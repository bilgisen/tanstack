import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { BarChart3, ExternalLink } from "lucide-react";
import { useChatStore } from "../../store/chat";
import { useUIStore } from "../../store/ui";
import { isKnownTicker, loadMarketTickers } from "../../lib/marketTickers";
import { CollapsibleSection } from "../chat/CollapsibleSection";
import { MetricCardGrid } from "../chat/MetricCardGrid";
import { SuggestionChips } from "../chat/SuggestionChips";
import { InteractiveWidget  } from "./InteractiveWidget";
import type {InteractiveWidgetProps} from "./InteractiveWidget";

function extractMentionedTickers(text: string, contextSymbol: string | null): Array<string> {
  const upper = text.toUpperCase();
  const words = upper.split(/[^A-Z0-9ÇŞĞÜÖİ]/);
  const found = new Set<string>();
  for (const w of words) {
    if (w.length >= 3 && w.length <= 5 && isKnownTicker(w)) {
      found.add(w);
    }
  }
  // Remove context symbol if present (already on that page)
  if (contextSymbol) found.delete(contextSymbol);
  return Array.from(found);
}

interface MarkdownRendererProps {
  text: string;
  isAssistant: boolean;
  context?: string;
  suggestions?: Array<string>;
  widget?: InteractiveWidgetProps['widget'];
}

export interface ExtractedMetrics {
  rsi?: string;
  support?: string;
  resistance?: string;
  stopLoss?: string;
  trend?: string;
}

// 1. Parser helpers
export function extractSuggestedQuestions(text: string, context: string = "global"): { cleanText: string, questions: Array<string> } {
  const lines = text.split("\n");
  const mainLines: Array<string> = [];
  const questions: Array<string> = [];
  
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
  
  // Fallback: context-aware smart questions based on the current page context
  const isSector = /^(industry|sector|sector-group|sektor):/i.test(context) || context === 'sektorler';
  const isIndex = context.startsWith("endeks:");
  const isCompany = context.startsWith("sirket:");
  const contextTicker = context.startsWith("sirket:") ? context.split(":")[1]?.toUpperCase() : null;
  
  if (isSector) {
    // Sector page — no technical analysis data here; keep questions sector-focused
    return {
      cleanText: text,
      questions: [
        "Sektördeki şirketleri PD/DD rasyosuna göre iskontolu/pahalı diye ayır?",
        "Bu sektörde en yüksek ROE'ye sahip şirketler hangileri?",
        "Sektörün genel değerleme görünümü medyan rasyolara göre nasıl?"
      ]
    };
  }
  
  if (isIndex) {
    return {
      cleanText: text,
      questions: [
        "Bu endeksin bugün öne çıkan bileşen hisseleri hangileri?",
        "Bu endeksi diğer endekslerle karşılaştır",
        "Bu endeks için güncel destek ve direnç seviyeleri nerede?"
      ]
    };
  }
  
  const keywords = text.toUpperCase();
  const fallbackQuestions: Array<string> = [];
  
  if (contextTicker) {
    fallbackQuestions.push(
      `${contextTicker} için güncel destek ve direnç seviyeleri nelerdir?`,
      `${contextTicker} temel rasyoları (F/K, PD/DD, ROE) sektörün neresinde?`,
      `${contextTicker} sektöründeki konumunu rakipleriyle karşılaştır`
    );
  } else if (keywords.includes("EREGL")) {
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
  } else if (isCompany) {
    fallbackQuestions.push("Bu analizdeki temel göstergeleri daha detaylı açıklayabilir misin?");
    fallbackQuestions.push("Bu hissenin sektördeki konumu ve rakipleriyle kıyası nasıl?");
    fallbackQuestions.push("Bu hisse için destek, direnç ve stop-loss seviyeleri nerede konumlanıyor?");
  } else {
    fallbackQuestions.push("Bugün en çok kazandıran hisseler hangileri?");
    fallbackQuestions.push("BIST 100 teknik göstergeleri ne durumda?");
    fallbackQuestions.push("Hangi sektörler bugün öne çıktı?");
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

  const contextSymbol = context.startsWith("sirket:")
    ? context.split(":")[1]?.toUpperCase() ?? null
    : context.startsWith("endeks:")
      ? context.split(":")[1]?.toUpperCase() ?? null
      : null;

  // Load the full BIST ticker list once for dynamic ticker detection
  const [marketLoaded, setMarketLoaded] = useState(false);
  useEffect(() => {
    let mounted = true;
    loadMarketTickers().then(() => {
      if (mounted) setMarketLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  // Extract questions and clean text
  const { cleanText, questions } = useMemo(() => {
    if (!isAssistant) return { cleanText: text, questions: [] };
    if (suggestions && suggestions.length > 0) {
      return { cleanText: text, questions: suggestions };
    }
    return extractSuggestedQuestions(text, context);
  }, [text, isAssistant, suggestions, context]);

  // Extract tickers mentioned in the response for navigation buttons
  const mentionedTickers = useMemo(() => {
    if (!isAssistant) return [];
    return extractMentionedTickers(cleanText, contextSymbol);
  }, [cleanText, isAssistant, contextSymbol, marketLoaded]);

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

  const handleMetricClick = async (label: string, value: string) => {
    if (isLoading) return;
    const q = contextSymbol
      ? `${contextSymbol} için ${label}: ${value} — bu ne anlama geliyor, nasıl yorumlanmalı?`
      : `${label}: ${value} — bu ne anlama geliyor?`;
    openRightSidebar();
    await sendMessage(q, context);
  };

  const handleWidgetAction = async (label: string, payload?: string) => {
    if (isLoading) return;
    openRightSidebar();
    await sendMessage(label, payload ? `sirket:${payload}:genel-bakis` : context);
  };

  const handleNavigate = (symbol: string) => {
    const path = symbol.startsWith('X') ? `/endeksler/${symbol.toLowerCase()}` : `/hisse/${symbol.toLowerCase()}`;
    window.dispatchEvent(new CustomEvent('app-navigate', { detail: { path } }));
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
        <CollapsibleSection title="Teknik Göstergeler" icon={<BarChart3 size={12} />} defaultOpen={true}>
          <MetricCardGrid 
            columns={4}
            onCardClick={handleMetricClick}
            items={[
              ...(metrics.trend ? [{ label: 'Trend', value: metrics.trend.split(" ")[0], color: metrics.trend.includes("Yükseliş") ? 'up' as const : metrics.trend.includes("Düşüş") ? 'down' as const : 'neutral' as const }] : []),
              ...(metrics.rsi ? [{ label: 'RSI (14)', value: metrics.rsi, color: (parseFloat(metrics.rsi) > 70 ? 'down' as const : parseFloat(metrics.rsi) < 30 ? 'up' as const : 'neutral' as const) }] : []),
              ...(metrics.support ? [{ label: 'Destek', value: `₺${metrics.support}`, color: 'up' as const, subtitle: 'En yakın' }] : []),
              ...(metrics.resistance ? [{ label: 'Direnç', value: `₺${metrics.resistance}`, color: 'down' as const, subtitle: 'En yakın' }] : []),
              ...(metrics.stopLoss ? [{ label: 'Stop-Loss', value: `₺${metrics.stopLoss}`, color: 'warning' as const, subtitle: 'ATR bazlı' }] : []),
            ]}
          />
        </CollapsibleSection>
      )}

      {/* 2.5 Dinamik İnteraktif Widget */}
      {widget && (
        <InteractiveWidget widget={widget} onWidgetAction={handleWidgetAction} />
      )}

      {/* 3. Navigation buttons for tickers mentioned in the response */}
      {mentionedTickers.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {mentionedTickers.map(sym => (
            <button
              key={sym}
              onClick={() => handleNavigate(sym)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <ExternalLink size={12} />
              {sym}
            </button>
          ))}
        </div>
      )}

      {/* 4. Konuyu Derinleştirecek Öneri Chipleri */}
      {questions.length > 0 && (
        <SuggestionChips 
          suggestions={questions} 
          onSelect={handleQuestionClick}
          max={4}
        />
      )}
    </div>
  );
}
