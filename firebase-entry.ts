import { onRequest } from "firebase-functions/v2/https";

export const api = onRequest({
  region: "asia-south1", 
  memory: "512MiB",
  timeoutSeconds: 60,
  secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_SECRET_KEY", "GEMINI_API_KEY"],
}, async (req, res) => {
  try {
    // Lazy load everything inside the handler
    const { initializeApp, getApps } = await import("firebase-admin/app");
    if (getApps().length === 0) {
      initializeApp();
    }

    const { getApp } = await import("./server.js");
    const app = await getApp();
    return app(req, res);
  } catch (error: any) {
    console.error("Initialization Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
