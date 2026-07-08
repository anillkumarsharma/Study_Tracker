import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { chatApi } from "../api/studyApi";
import { useAuth } from "../store/AuthContext";

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  // Greet the user the first time the panel opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Namaste ${
            user?.firstName || ""
          }! 👋 Main StudyBuddy hoon. Apne routine, subjects ya exams ke baare me kuch bhi poochho — main aapki study planning me madad karunga.`,
        },
      ]);
    }
  }, [open, messages.length, user]);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      // Send recent history (skip the very first greeting) for context.
      const history = next.filter((m, i) => !(i === 0 && m.role === "assistant"));
      const { reply } = await chatApi.send(history.slice(-12));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.message ||
            "Oops, main abhi connect nahi ho paaya. Thodi der baad try karo.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="StudyBuddy AI chat"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-amber text-navy shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2.5 bg-navy px-4 py-3 text-paper">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber text-navy">
              <Bot size={18} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">StudyBuddy AI</p>
              <p className="text-[11px] text-paper/70">Aapka study coach</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-navy text-paper"
                      : "rounded-bl-sm bg-white text-navy shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm text-slate-400 shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kuch poochho…"
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-amber"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber text-navy transition-colors hover:bg-amber/90 disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
