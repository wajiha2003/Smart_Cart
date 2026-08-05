import { useState, useRef, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import { Product } from "../lib/types";
import { useAuth } from "../context/AuthContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
        <span className="flex h-4 items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-ink-subtle"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold select-none">
      AI
    </div>
  );
}

function ProductSuggestionCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-canvas p-2.5 transition hover:border-accent hover:shadow-sm">
      {product.image
        ? <img src={product.image} alt={product.title} className="h-11 w-11 rounded-lg object-cover shrink-0 border border-border" />
        : <div className="h-11 w-11 rounded-lg bg-border shrink-0" />
      }
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-brand leading-snug">{product.title}</p>
        <p className="text-[11px] font-medium text-accent">{product.category}</p>
        <p className="text-[13px] font-bold text-brand mt-0.5">${product.price.toFixed(2)}</p>
      </div>
      <svg className="ml-auto shrink-0 text-ink-subtle" width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && <BotAvatar />}
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "rounded-br-sm bg-brand text-white"
            : "rounded-bl-sm border border-border bg-surface text-ink"
        }`}>
          {msg.content}
        </div>
        {!isUser && msg.products && msg.products.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {msg.products.map((p) => <ProductSuggestionCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content: "Hi! 👋 I'm your SmartCart shopping assistant. Tell me what you're looking for — I'll help you find the perfect product.\n\n• \"Something for my home office under $100\"\n• \"A gift for a tech lover\"\n• \"Wireless headphones with good bass\"",
};

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  if (!user) return null;

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setError("");
    setThinking(true);
    try {
      const history = updated.map(({ role, content }) => ({ role, content }));
      const res = await api.post<{ reply: string; products: Product[] }>("/ai/chat", { messages: history });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply, products: res.data.products ?? [] }]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setThinking(false);
    }
  }

  function handleClear() { setMessages([WELCOME]); setError(""); }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed right-6 z-50 flex w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          style={{ bottom: "88px", maxHeight: "calc(100vh - 104px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-brand px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white text-[10px] font-bold">AI</div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-none">Shopping Assistant</p>
                <p className="text-[11px] text-white/60 mt-0.5">Powered by SmartCart AI</p>
              </div>
            </div>
            <button onClick={handleClear}
              className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-white/60 transition hover:bg-white/15 hover:text-white">
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4 bg-canvas/60">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {thinking && <TypingIndicator />}
            {error && <p className="text-center text-xs text-danger">{error} — please try again.</p>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border bg-surface px-3 py-3">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…" disabled={thinking}
              className="flex-1 rounded-xl border border-border bg-canvas px-4 py-2 text-[13px] text-ink outline-none transition focus:border-brand disabled:opacity-50" />
            <button type="submit" disabled={!input.trim() || thinking} aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-hover disabled:opacity-40">
              <svg className="h-4 w-4 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle button — bottom-right */}
      <button onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open shopping assistant"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:bg-brand-hover hover:scale-105 active:scale-95">
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.844L3 20l1.09-3.272C3.4 15.626 3 13.856 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {!open && messages.length > 1 && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-accent" />
        )}
      </button>
    </>
  );
}
