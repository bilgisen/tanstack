import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../store/chat";
import { Cpu, ChevronDown, Lock, Check, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface ModelOption {
  id: string;
  displayName: string;
  provider: string;
  htPer1kInput: number;
  htPer1kOutput: number;
  accessible: boolean;
  allowedTiers: string[];
  estimatedHtPerCall: number;
}

export function ModelSelector() {
  const { selectedModelId, setSelectedModelId } = useChatStore();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/models/available");
      if (res.ok) {
        const json = await res.json();
        setModels(json);
      }
    } catch (e) {
      console.error("Failed to load available models:", e);
    }
  };

  useEffect(() => {
    fetchModels();

    // Re-fetch when user tier changes or window event fires
    window.addEventListener("ht-balance-updated", fetchModels);
    return () => {
      window.removeEventListener("ht-balance-updated", fetchModels);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleSelectModel = (model: ModelOption) => {
    if (!model.accessible) {
      // If locked, redirect to upgrade/profile
      navigate({ to: "/profil" });
      setIsOpen(false);
      return;
    }
    setSelectedModelId(model.id);
    setIsOpen(false);
  };

  if (!activeModel) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 border border-border/30 text-xs text-muted-foreground animate-pulse font-sans">
        <Cpu size={12} />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="relative font-sans shrink-0 self-center" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-muted/30 hover:bg-muted/70 text-xs font-semibold text-foreground border border-border/40 hover:border-border/80 transition-all cursor-pointer shadow-3xs hover:scale-102 active:scale-98 select-none shrink-0"
        title="Model Değiştir"
      >
        <Sparkles size={11} className="text-primary animate-pulse" />
        <span className="max-w-[120px] truncate">{activeModel.displayName}</span>
        <ChevronDown size={11} className={`text-muted-foreground/80 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-[280px] bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl py-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider border-b border-border/30 mb-1">
            Yapay Zeka Modeli Seçin
          </div>
          
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
            {models.map((model) => {
              const isSelected = model.id === selectedModelId;
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model)}
                  className={`flex items-start justify-between w-full px-3 py-2.5 hover:bg-muted/40 transition-colors text-left text-xs cursor-pointer ${
                    isSelected ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold flex items-center gap-1">
                      {model.displayName}
                      {!model.accessible && (
                        <Lock size={10} className="text-amber-500 shrink-0" />
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      ~{model.estimatedHtPerCall} HT/Sorgu
                    </span>
                  </div>

                  <div className="flex items-center shrink-0 self-center">
                    {isSelected ? (
                      <Check size={13} className="text-primary" />
                    ) : !model.accessible ? (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Yükselt
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
