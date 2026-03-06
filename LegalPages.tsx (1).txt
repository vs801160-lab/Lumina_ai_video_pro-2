import React from 'react';
import { ArrowLeft, Shield, FileText, RefreshCcw } from 'lucide-react';

interface LegalPagesProps {
  type: 'privacy' | 'terms' | 'refund';
  onBack: () => void;
}

const LegalPages: React.FC<LegalPagesProps> = ({ type, onBack }) => {
  const content = {
    terms: {
      title: "Terms of Service",
      icon: <FileText size={32} className="text-indigo-500" />,
      sections: [
        { title: "1. Acceptance of Terms", content: "By accessing Lumina Studio, you agree to be bound by these Terms of Service and all applicable laws and regulations." },
        { title: "2. AI Content Generation", content: "Lumina Studio uses Google Gemini Veo for video generation. Users are responsible for the content they generate and must comply with AI safety guidelines." },
        { title: "3. Credits and Payments", content: "Credits purchased are non-transferable and used for video generation. One video generation costs 10 credits." },
        { title: "4. User Conduct", content: "Users must not generate harmful, illegal, or sexually explicit content. Violation of these rules will lead to account suspension." }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      icon: <Shield size={32} className="text-emerald-500" />,
      sections: [
        { title: "1. Data Collection", content: "We collect basic profile information from Google Sign-In and your generated prompts to provide our services." },
        { title: "2. Data Storage", content: "Your videos and profile data are securely stored using Supabase. We do not sell your personal data to third parties." },
        { title: "3. AI Processing", content: "Prompts are sent to Google Gemini API for processing. Please do not include sensitive personal information in your prompts." },
        { title: "4. Cookies", content: "We use essential cookies to maintain your session and preferences." }
      ]
    },
    refund: {
      title: "Refund Policy",
      icon: <RefreshCcw size={32} className="text-amber-500" />,
      sections: [
        { title: "1. Credit Purchases", content: "Due to the computational cost of AI rendering, all credit purchases are final and non-refundable once used." },
        { title: "2. Technical Failures", content: "If a video generation fails due to a system error, the credits will be automatically refunded to your account." },
        { title: "3. Subscription Cancellation", content: "You can stop using the service at any time, but unused credits will remain in your vault for future use." },
        { title: "4. Contact Support", content: "For any payment-related issues, please contact our support team with your transaction ID." }
      ]
    }
  };

  const page = content[type];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-12 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Studio</span>
      </button>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-16 space-y-12 backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-xl">
            {page.icon}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{page.title}</h1>
        </div>

        <div className="space-y-10">
          {page.sections.map((s, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-indigo-400">{s.title}</h3>
              <p className="text-slate-400 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-slate-800 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Last Updated: March 2025</p>
        </div>
      </div>
    </div>
  );
};

export default LegalPages;
