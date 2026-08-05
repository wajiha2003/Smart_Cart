import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const PAGE_INTROS: { pattern: RegExp; intro: string }[] = [
  { pattern: /^\/$/, intro: "Welcome to SmartCart! Use the category buttons to filter products, or type in the search box. Click any product card to view details and add it to your cart." },
  { pattern: /^\/products\//, intro: "You're viewing a product page. See the price, highlights, and stock status. Use the plus and minus buttons to choose a quantity, then click Add to Cart." },
  { pattern: /^\/cart$/, intro: "This is your shopping cart. Adjust quantities, remove products, or click Proceed to Checkout when ready." },
  { pattern: /^\/checkout$/, intro: "You're on the checkout page. Enter your shipping address and click Place Order. A confirmation email will be sent automatically." },
  { pattern: /^\/orders$/, intro: "This is your order history. Each card shows your order number, status, items, and total. You'll receive an email when your status changes." },
  { pattern: /^\/login$/, intro: "This is the login page. Enter your email and password to sign in. Click Forgot Password if needed." },
  { pattern: /^\/signup$/, intro: "Create your SmartCart account here. Fill in your name, email, and password to get started." },
  { pattern: /^\/admin\/products/, intro: "You're on the Products page. Click Add Product to create a listing. Use Generate with AI to auto-write descriptions." },
  { pattern: /^\/admin\/orders/, intro: "This is Orders management. Use the dropdown to update order status. Customers are notified by email automatically." },
  { pattern: /^\/admin\/users/, intro: "This is the Users page. Toggle roles between customer and admin, or delete accounts." },
  { pattern: /^\/admin/, intro: "Welcome to the admin dashboard. The overview shows key stats. Use the sidebar to manage products, orders, and users." },
];

function getIntroForPath(pathname: string): string {
  return PAGE_INTROS.find((p) => p.pattern.test(pathname))?.intro
    ?? "Welcome to SmartCart! Ask me anything about how to shop, place orders, or manage your account.";
}

function speak(text: string, onEnd?: () => void): SpeechSynthesisUtterance {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.05;
  utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) => v.lang.startsWith("en") &&
    (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")));
  if (preferred) utt.voice = preferred;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
  return utt;
}

type AgentState = "idle" | "speaking" | "listening" | "thinking";

export default function VoiceAgent() {
  const { user } = useAuth();
  const location = useLocation();
  const [state, setState] = useState<AgentState>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [showCard, setShowCard] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) setSupported(false);
    if (!window.speechSynthesis) setSupported(false);
  }, []);

  useEffect(() => {
    window.speechSynthesis.cancel();
    setState("idle");
    setShowCard(false);
  }, [location.pathname]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    window.speechSynthesis.cancel();
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setState("listening");
    setTranscript("");

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setState("thinking");
      chatHistoryRef.current = [...chatHistoryRef.current, { role: "user", content: text }];
      try {
        const res = await api.post<{ reply: string }>("/ai/chat", {
          messages: [
            { role: "user", content: `I am on page: ${location.pathname}. Keep answers about SmartCart.` },
            { role: "assistant", content: "Understood! I'll help you navigate SmartCart." },
            ...chatHistoryRef.current,
          ],
        });
        const aiReply = res.data.reply;
        chatHistoryRef.current = [...chatHistoryRef.current, { role: "assistant", content: aiReply }];
        setReply(aiReply);
        setShowCard(true);
        setState("speaking");
        speak(aiReply, () => setState("idle"));
      } catch {
        const fallback = "Sorry, I couldn't get an answer. Please try again.";
        setReply(fallback);
        setShowCard(true);
        setState("speaking");
        speak(fallback, () => setState("idle"));
      }
    };
    recognition.onerror = () => setState("idle");
    recognition.onend = () => { if (state === "listening") setState("idle"); };
    recognition.start();
  }, [location.pathname, state]);

  const handleMicClick = useCallback(() => {
    if (state === "listening") { recognitionRef.current?.stop(); setState("idle"); return; }
    if (state === "speaking" || state === "thinking") { window.speechSynthesis.cancel(); setState("idle"); return; }
    const intro = getIntroForPath(location.pathname);
    setReply(intro);
    setShowCard(true);
    setState("speaking");
    speak(intro, () => { setState("idle"); setTimeout(startListening, 300); });
  }, [state, location.pathname, startListening]);

  if (!user || !supported) return null;

  const bgMap: Record<AgentState, string> = {
    idle:      "bg-accent hover:bg-accent-dark",
    speaking:  "bg-accent",
    listening: "bg-danger",
    thinking:  "bg-accent/70",
  };

  return (
    <>
      {/* Transcript card — appears above the button stack */}
      {showCard && (
        <div className="fixed bottom-[172px] right-6 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-accent px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white">Voice Assistant</span>
              {state === "speaking" && (
                <span className="flex items-end gap-0.5 h-3.5">
                  {[1,2,3,4].map((i) => (
                    <span key={i} className="inline-block w-0.5 rounded-full bg-white/80 animate-bounce"
                      style={{ height: `${4 + i * 2}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </span>
              )}
            </div>
            <button onClick={() => { setShowCard(false); window.speechSynthesis.cancel(); setState("idle"); }}
              className="text-white/60 hover:text-white transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="space-y-2 px-4 py-3 text-[13px]">
            {transcript && (
              <div className="flex gap-2">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-ink-subtle mt-0.5">You</span>
                <p className="text-ink-muted italic">"{transcript}"</p>
              </div>
            )}
            {reply && (
              <div className="flex gap-2">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent mt-0.5">AI</span>
                <p className="text-ink leading-relaxed">{reply}</p>
              </div>
            )}
          </div>
          {state === "idle" && (
            <div className="border-t border-border px-4 py-2.5">
              <button onClick={startListening}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent-soft py-2 text-[12px] font-semibold text-accent transition hover:bg-accent/20">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Ask a follow-up
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mic button — sits above chat button (bottom: 6rem + 14px gap + 56px = ~160px → use bottom-[84px]) */}
      <button
        onClick={handleMicClick}
        aria-label="Voice assistant"
        className={`fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition ${bgMap[state]}`}
      >
        {state === "listening" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-25" />
        )}
        {state === "thinking" ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : state === "speaking" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </>
  );
}
