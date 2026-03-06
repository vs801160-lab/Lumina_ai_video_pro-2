
import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "./types";

export class GeminiVideoService {
  private static getActiveKey(): string {
    const getEnv = (key: string): string => {
      // Priority 1: process.env (Platform injected)
      try {
        if (typeof process !== 'undefined' && process.env) {
          const val = (process.env as any)[key];
          if (val && val !== "undefined" && val !== "null") return val;
        }
      } catch (e) {}

      // Priority 2: import.meta.env (Vite)
      try {
        const env = import.meta.env;
        if (env && env[key]) return env[key];
        
        // Priority 3: fallback to prefixed version
        const prefixed = `VITE_${key}`;
        if (env && env[prefixed]) return env[prefixed];
      } catch (e) {}

      return "";
    };

    // Priority 1: GEMINI_API_KEY (General Gemini models)
    const geminiKey = getEnv('GEMINI_API_KEY');
    if (geminiKey) return geminiKey;

    // Priority 2: API_KEY (Specific to Veo/Paid models)
    const apiKey = getEnv('API_KEY');
    if (apiKey) return apiKey;
    
    throw new Error("API_KEY_PENDING");
  }

  static async refinePrompt(userPrompt: string): Promise<string> {
    if (!userPrompt) return "";
    try {
      const key = this.getActiveKey();
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a professional cinematographer. Improve this video prompt for an AI video model (Veo 3.1). Keep it concise but descriptive about lighting, movement, and mood. Prompt: "${userPrompt}"`,
        config: { temperature: 0.8 }
      });
      return response.text?.trim() || userPrompt;
    } catch (e: any) {
      if (e.message === "API_KEY_PENDING") return userPrompt;
      console.error("Refinement failed", e);
      return userPrompt;
    }
  }
  
  static async planStoryboard(script: string): Promise<any[]> {
    if (!script) return [];
    console.log("Planning storyboard for script:", script.substring(0, 50) + "...");
    try {
      const key = this.getActiveKey();
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a professional film director. Break this short script into 3 cinematic scenes for an AI video model. 
        Return ONLY a JSON array of objects. Each object MUST have:
        - "title": A short, catchy name for the scene.
        - "prompt": A detailed visual description for an AI video generator (mention lighting, camera movement, and subject).
        - "shotType": The cinematic shot type (e.g., "Wide Shot", "Close-up", "Low Angle", "POV").
        
        Script: "${script}"`,
        config: { 
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text || "[]";
      console.log("Storyboard response received:", text.substring(0, 100) + "...");
      
      // Robust parsing: remove markdown code blocks if present
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e: any) {
      console.error("Storyboard planning failed:", e);
      if (e.message?.includes("API_KEY_PENDING")) {
        throw new Error("API_KEY_PENDING");
      }
      throw new Error(`Storyboard Error: ${e.message || "Unknown error"}`);
    }
  }

  static async generateAudio(prompt: string): Promise<string> {
    try {
      const key = this.getActiveKey();
      const ai = new GoogleGenAI({ apiKey: key });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Generate a cinematic Dolby Atmos soundscape and voiceover for this scene: ${prompt}` }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return `data:audio/mp3;base64,${base64Audio}`;
      }
      throw new Error("Audio generation failed");
    } catch (e) {
      console.error("Audio generation error", e);
      throw e;
    }
  }

  static async generateDirectorsNote(prompt: string): Promise<string> {
    try {
      const key = this.getActiveKey();
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As a legendary film director, write a 1-sentence "Director's Note" about the cinematic potential of this scene: "${prompt}". Focus on mood and visual storytelling.`,
      });
      return response.text?.trim() || "";
    } catch (e) {
      return "";
    }
  }

  static async generateShortsContent(prompt: string): Promise<{ caption: string, subtitles: string }> {
    try {
      const key = this.getActiveKey();
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a viral social media manager. Create a viral caption and a short subtitle script for a YouTube Short/Instagram Reel based on this video prompt: "${prompt}". 
        Return ONLY a JSON object with keys: "caption" (with hashtags) and "subtitles" (short punchy lines).`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{"caption": "", "subtitles": ""}');
    } catch (e) {
      return { caption: "", subtitles: "" };
    }
  }

  static async generateVideo(
    settings: GenerationSettings,
    onProgress: (status: string) => void
  ): Promise<{ videoBlob: Blob, apiVideoData: any }> {
    try {
      const key = this.getActiveKey();
      const ai = new GoogleGenAI({ apiKey: key });
      onProgress("Initializing Lumina...");
      
      const hasReferenceImages = settings.referenceImages && settings.referenceImages.length > 0;
      
      // Constraints: For reference images, model must be 'veo-3.1-generate-preview' and aspect ratio '16:9'
      const model = hasReferenceImages ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
      const aspectRatio = hasReferenceImages ? '16:9' : (settings.aspectRatio || '16:9');
      
      const config: any = {
        numberOfVideos: 1,
        resolution: settings.resolution || '720p',
        aspectRatio: aspectRatio
      };

      let finalPrompt = `${settings.style ? `[Style: ${settings.style}] ` : ""}${settings.prompt}`;
      
      if (hasReferenceImages) {
        // Enhance prompt for character consistency
        finalPrompt = `Maintain strict visual consistency with the provided reference image. ${finalPrompt}`;
        
        config.referenceImages = settings.referenceImages!.map(img => {
          const matches = img.match(/^data:([^;]+);base64,(.+)$/);
          const mimeType = matches ? matches[1] : 'image/png';
          const data = matches ? matches[2] : img;
          
          return {
            image: {
              imageBytes: data,
              mimeType: mimeType
            },
            referenceType: 'ASSET'
          };
        });
      }

      onProgress("Connecting to Veo Servers...");
      
      let operation = await ai.models.generateVideos({
        model,
        prompt: finalPrompt,
        config
      });

      let pollCount = 0;
      const statusMessages = [
        "Synthesizing motion...",
        "Applying cinematic lighting...",
        "Rendering temporal consistency...",
        "Optimizing frame transitions...",
        "Finalizing pixels..."
      ];

      while (!operation.done) {
        const msg = statusMessages[pollCount % statusMessages.length];
        onProgress(msg);
        await new Promise(resolve => setTimeout(resolve, 10000));
        const pollAi = new GoogleGenAI({ apiKey: key });
        operation = await pollAi.operations.getVideosOperation({ operation: operation });
        pollCount++;
      }

      const videoData = operation.response?.generatedVideos?.[0]?.video;
      if (!videoData || !videoData.uri) throw new Error("No video data returned.");

      onProgress("Downloading Masterpiece...");
      const response = await fetch(videoData.uri, {
        method: 'GET',
        headers: {
          'x-goog-api-key': key,
        },
      });
      if (!response.ok) throw new Error("Could not fetch video stream.");
      
      const blob = await response.blob();
      return { videoBlob: blob, apiVideoData: videoData };
    } catch (error: any) {
      if (error.message === "API_KEY_PENDING") {
        throw new Error("आपका गूगल क्लाउड अकाउंट अभी वेरिफिकेशन में है। कृपया एक्टिव होने का इंतज़ार करें।");
      }
      throw error;
    }
  }
}
