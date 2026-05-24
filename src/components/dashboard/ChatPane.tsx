import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { useChatStore } from "../../store/chat";

interface ChatPaneProps {
  context?: string;
  placeholder?: string;
  className?: string;
}

export function ChatPane({
  context = "global",
  placeholder = "HissePro asistanına borsa veya finans hakkında soru sorun...",
  className = "",
}: ChatPaneProps) {
  const [input, setInput] = useState("");
  const { isLoading, sendMessage } = useChatStore();

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    setInput("");
    await sendMessage(textToSend, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex items-center gap-3.5 bg-transparent px-4 py-3 md:py-3.5 w-full select-none ${className}`}>
      {/* Textarea Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none py-2.5 text-sm md:text-base text-foreground placeholder-muted-foreground/60 disabled:opacity-50 min-h-[44px] max-h-[120px] font-sans leading-relaxed"
      />

      {/* Antigravity Blue Send Button */}
      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0e75ec] hover:bg-[#0c62bd] text-white disabled:opacity-30 transition-all cursor-pointer shadow-xs shrink-0 self-end mb-1"
        title="Gönder"
      >
        <ArrowUp size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
