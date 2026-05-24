import { useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useChatStore } from "../../store/chat";

interface ChatPaneProps {
  context?: string;
  placeholder?: string;
  className?: string;
}

export function ChatPane({
  context = "global",
  placeholder = "Bir soru sorun...",
  className = "",
}: ChatPaneProps) {
  const [input, setInput] = useState("");
  const { isLoading, sendMessage } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage(textToSend, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
    
    // Auto-grow height logic
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  };

  return (
    <div className={`flex items-center gap-3 bg-transparent px-4 py-1.5 w-full select-none ${className}`}>
      {/* Textarea Input */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-base md:text-[17px] text-foreground placeholder-muted-foreground/60 disabled:opacity-50 min-h-[38px] max-h-[140px] font-sans leading-relaxed custom-scrollbar"
      />

      {/* Antigravity Blue Send Button */}
      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0e75ec] hover:bg-[#0c62bd] text-white disabled:opacity-30 transition-all cursor-pointer shadow-xs shrink-0 self-center"
        title="Gönder"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
