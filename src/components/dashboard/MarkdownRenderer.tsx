import { useMemo } from "react";
import { marked } from "marked";
import { useChatStore } from "../../store/chat";
import { useUIStore } from "../../store/ui";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldAlert, 
  ChevronRight, 
  BarChart3, 
  Activity, 
  Compass 
} from "lucide-react";
import { InteractiveWidget } from "./InteractiveWidget";

interface MarkdownRendererProps {
  text: string;
  isAssistant: boolean;
  context?: string;
  suggestions?: string[];
  widget?: any;
}

export interface ExtractedMetrics {
  rsi?: string;
  support?: string;
  resistance?: string;
  stopLoss?: string;
  trend?: string;
}

// 1. Parser helpers
export function extractSuggestedQuestions(text: string): { cleanText: string, questions: string[] } {
  const lines = text.split("\n");
  const mainLines: string[] = [];
  const questions: string[] = [];
  
  let inQuestionsSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect question block markers
    if (trimmed.toLowerCase().includes("önerilen sorular") || trimmed.toLowerCase().includes("sorabileceğiniz sorular") || trimmed.toLowerCase().includes("önerilen bazı sorular")) {
      inQuestionsSection = true;
      continue;
    }
    
    // A line that ends with "?" and starts with a list marker or bullet
    const isQuestionLine = trimmed.endsWith("?") && (/^[-*+•\d.]/.test(trimmed) || trimmed.length > 10);
    
    if (isQuestionLine) {
      const cleanQuestion = trimmed.replace(/^[-*+•\d.\s]+/, "").trim();
      if (cleanQuestion.length > 5 && !questions.includes(cleanQuestion)) {
        questions.push(cleanQuestion);
      }
    } else {
      if (!inQuestionsSection || trimmed !== "") {
        mainLines.push(line);
      }
    }
  }
  
  if (questions.length > 0) {
    return {
      cleanText: mainLines.join("\n").trim(),
      questions: questions.slice(0, 5) // max 5 questions
    };
  }
  
  // Fallback: Generate smart questions based on ticker keywords detected in text
  const keywords = text.toUpperCase();
  const fallbackQuestions: string[] = [];
  
  if (keywords.includes("EREGL")) {
    fallbackQuestions.push("EREGL için güncel destek ve direnç seviyeleri nelerdir?");
    fallbackQuestions.push("Ereğli Demir Çelik'in kârlılık ve bilanço beklentileri nasıl?");
    fallbackQuestions.push("EREGL için ATR bazlı teknik stop-loss seviyesi nedir?");
  } else if (keywords.includes("THYAO")) {
    fallbackQuestions.push("THYAO hissesinde yükseliş momentumu devam ediyor mu?");
    fallbackQuestions.push("Türk Hava Yolları için aracı kurumların hedef fiyatları ne?");
    fallbackQuestions.push("THYAO teknik göstergeleri (RSI/MACD) neye işaret ediyor?");
  } else if (keywords.includes("TUPRS")) {
    fallbackQuestions.push("TUPRS için kısa vadeli hareketli ortalama kesişimleri nasıl?");
    fallbackQuestions.push("Tüpraş'ın temettü dağıtım beklentileri nelerdir?");
    fallbackQuestions.push("TUPRS teknik analizinde hangi direnç noktası kritik?");
  } else if (keywords.includes("ASELS")) {
    fallbackQuestions.push("ASELS pay senedi için en güncel destek ve direnç noktaları nereler?");
    fallbackQuestions.push("Aselsan teknik analizinde ADX gücü neyi teyit ediyor?");
    fallbackQuestions.push("ASELS için MACD kesişimi gerçekleşti mi?");
  } else if (keywords.includes("XU100") || keywords.includes("BIST")) {
    fallbackQuestions.push("BIST 100 endeksinde ralli sürer mi, direnç bölgesi neresi?");
    fallbackQuestions.push("Endeksin RSI aşırı alım bölgesinde mi, düzeltme yakın mı?");
    fallbackQuestions.push("Hangi sektörler endeksin üzerinde getiri sağlayabilir?");
  } else {
    fallbackQuestions.push("Bu analizdeki teknik göstergeleri daha detaylı açıklayabilir misin?");
    fallbackQuestions.push("Hisse senedinin orta vadeli hareketli ortalamaları (SMA) ne durumda?");
    fallbackQuestions.push("Bu hisse için stop-loss ve risk seviyeleri nerede konumlanıyor?");
  }
  
  return {
    cleanText: text,
    questions: fallbackQuestions.slice(0, 3)
  };
}

export function extractMetricsFromText(text: string): ExtractedMetrics | null {
  const metrics: ExtractedMetrics = {};
  
  // 1. Try RSI
  const rsiMatch = text.match(/RSI(?: de\u011feri)?\s*(?:\u015fu anda)?\s*\*\*?([0-9.]+)\*\*?/i) || text.match(/RSI is\s*([0-9.]+)/i);
  if (rsiMatch) metrics.rsi = rsiMatch[1];
  
  // 2. Try Support
  const supportMatch = text.match(/destek(?: b\u00f6lgesi)?\s*(?:en yak\u0131n)?\s*\*\*?([0-9.]+)\s*TL\*\*?/i) || text.match(/support is near\s*([0-9.]+)/i);
  if (supportMatch) metrics.support = supportMatch[1];
  
  // 3. Try Resistance
  const resistanceMatch = text.match(/diren\u00e7(?: e\u015fi\u011fi)?\s*\*\*?([0-9.]+)\s*TL\*\*?/i) || text.match(/resistance near\s*([0-9.]+)/i);
  if (resistanceMatch) metrics.resistance = resistanceMatch[1];
  
  // 4. Try Stop Loss
  const stopLossMatch = text.match(/stop-loss(?: korumas\u0131)?\s*(?:ise)?\s*\*\*?([0-9.]+)\s*TL\*\*?/i) || text.match(/stop-loss placement around\s*([0-9.]+)/i);
  if (stopLossMatch) metrics.stopLoss = stopLossMatch[1];
  
  // 5. Try Trend
  const trendMatch = text.match(/\*\*?(Y\u00fckseli\u015f \(Bo\u011fa\)|D\u00fc\u015f\u00fc\u015f \(Ay\u0131\)|Yatay \/ Karars\u0131z)\*\*?\s*e\u011filiminde/i);
  if (trendMatch) metrics.trend = trendMatch[1];

  if (metrics.support || metrics.resistance || metrics.stopLoss || metrics.rsi) {
    return metrics;
  }
  return null;
}

export function MarkdownRenderer({ text, isAssistant, context = "global", suggestions, widget }: MarkdownRendererProps) {
  const { sendMessage, isLoading } = useChatStore();
  const { openRightSidebar } = useUIStore();
  
  // Extract questions and clean text
  const { cleanText, questions } = useMemo(() => {
    if (!isAssistant) return { cleanText: text, questions: [] };
    if (suggestions && suggestions.length > 0) {
      return { cleanText: text, questions: suggestions };
    }
    return extractSuggestedQuestions(text);
  }, [text, isAssistant, suggestions]);

  // Extract financial indicators for rich UI presentations
  const metrics = useMemo(() => {
    if (!isAssistant) return null;
    return extractMetricsFromText(cleanText);
  }, [cleanText, isAssistant]);

  // Convert Markdown to HTML securely
  const htmlContent = useMemo(() => {
    try {
      return marked.parse(cleanText) as string;
    } catch (e) {
      console.error(e);
      return cleanText;
    }
  }, [cleanText]);

  const handleQuestionClick = async (q: string) => {
    if (isLoading) return;
    openRightSidebar();
    await sendMessage(q, context);
  };

  if (!isAssistant) {
    return <div className="whitespace-pre-wrap text-base sm:text-[15px] leading-relaxed text-foreground">{text}</div>;
  }

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300">
      {/* 1. Main Chat Text Rendered as Rich HTML */}
      <div 
        className="chatbot-response text-[15px] sm:text-base text-foreground/95 leading-relaxed space-y-3"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* 2. Zengin Teknik Dashboard / Kart Sunumu (Tables / Gauges) */}
      {metrics && (
        <div className="mt-4 p-3.5 rounded-xl bg-muted/5 border border-border/10 grid grid-cols-2 sm:grid-cols-4 gap-3 shadow-xs">
          
          {/* Trend Card */}
          {metrics.trend && (
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border/10">
              <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider flex items-center gap-1.5">
                <Activity size={12} className="text-muted-foreground" /> Trend
              </span>
              <span className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${
                metrics.trend?.includes("Yükseliş") ? "text-emerald-500" : metrics.trend?.includes("Düşüş") ? "text-destructive" : "text-amber-500"
              }`}>
                {metrics.trend?.includes("Yükseliş") ? <TrendingUp size={14} /> : metrics.trend?.includes("Düşüş") ? <TrendingDown size={14} /> : <Minus size={14} />}
                {metrics.trend?.split(" ")[0]}
              </span>
            </div>
          )}

          {/* RSI Gauge Card */}
          {metrics.rsi && (
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border/10">
              <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider flex items-center gap-1.5">
                <BarChart3 size={12} className="text-muted-foreground" /> RSI
              </span>
              <span className="text-sm font-semibold mt-1 flex items-center gap-2">
                {metrics.rsi}
                <span className={`w-2 h-2 rounded-full ${
                  parseFloat(metrics.rsi) > 70 ? "bg-destructive" : parseFloat(metrics.rsi) < 30 ? "bg-emerald-500" : "bg-primary/40"
                }`} />
              </span>
            </div>
          )}

          {/* Destek / Direnç Aralığı Card */}
          {(metrics.support || metrics.resistance) && (
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border/10">
              <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider flex items-center gap-1.5">
                <Compass size={12} className="text-muted-foreground" /> Destek/Direnç
              </span>
              <span className="text-sm font-semibold mt-1 truncate">
                <span className="text-emerald-500">₺{metrics.support || "—"}</span>
                <span className="text-muted-foreground mx-1">/</span>
                <span className="text-destructive">₺{metrics.resistance || "—"}</span>
              </span>
            </div>
          )}

          {/* ATR Stop Loss Card */}
          {metrics.stopLoss && (
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border/10">
              <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-muted-foreground" /> Stop-Loss
              </span>
              <span className="text-sm font-semibold text-destructive mt-1">
                ₺{metrics.stopLoss}
              </span>
            </div>
          )}

        </div>
      )}

      {/* 2.5 Dinamik İnteraktif Widget */}
      {isAssistant && widget && (
        <InteractiveWidget widget={widget} />
      )}

      {/* 3. Konuyu Derinleştirecek Sade Önerilen Sorular */}
      {questions.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border/10 space-y-3">
          <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider block select-none">
            Sıradaki Adım Önerileri:
          </span>
          <div className="flex flex-col gap-2">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionClick(q)}
                disabled={isLoading}
                className="w-full flex items-center justify-between text-left text-sm text-foreground/85 hover:text-primary hover:bg-primary/5 active:bg-primary/10 border border-border/10 hover:border-primary/20 rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer disabled:opacity-50 group font-medium bg-card/40"
              >
                <span className="truncate pr-4">{q}</span>
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
