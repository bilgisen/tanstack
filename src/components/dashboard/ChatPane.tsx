import { useState } from "react";
import { ArrowUp, Plus, Mic } from "lucide-react";
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
    <div className={`flex flex-col bg-transparent h-full min-h-0 ${className}`}>
      {/* Textarea Input Container (Ultra-Simple Solid Single-Line Bar) */}
      <div className="p-3 bg-transparent shrink-0">
        <div className="flex items-center gap-2 bg-muted/40 border border-border/85 rounded-xl px-2.5 py-1.5 focus-within:border-border transition-all select-none">
          {/* Plus Button */}
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors cursor-pointer shrink-0">
            <Plus size={16} />
          </button>

          {/* Textarea Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none px-1.5 py-1 text-xs md:text-sm text-foreground placeholder-muted-foreground/60 disabled:opacity-50 min-h-[32px] max-h-[80px] font-sans"
          />

          {/* Mic Button */}
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors cursor-pointer shrink-0">
            <Mic size={15} />
          </button>

          {/* Antigravity Blue Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0e75ec] hover:bg-[#0c62bd] text-white disabled:opacity-30 transition-all cursor-pointer shadow-xs shrink-0"
            title="Gönder"
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
