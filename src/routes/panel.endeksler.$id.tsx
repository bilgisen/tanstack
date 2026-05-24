import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Globe, Sparkles, HelpCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useChatStore } from '../store/chat'
import { useUIStore } from '../store/ui'

export const Route = createFileRoute('/panel/endeksler/$id')({
  component: EndeksDetailPage,
})

type IndexMeta = {
  name: string;
  code: string;
  description: string;
  components: { code: string; name: string; price: number; diff: number; volume: string }[];
};

const indexMetadata: Record<string, IndexMeta> = {
  bist30: {
    name: "BIST 30 Endeksi",
    code: "XU030",
    description: "Borsa İstanbul'da işlem gören, işlem hacmi ve piyasa değeri en yüksek 30 şirketin ortak performansını gösterir.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "KCHOL", name: "Koç Holding", price: 242.10, diff: 2.85, volume: "5.4M" },
      { code: "AKBNK", name: "Akbank", price: 58.40, diff: -3.42, volume: "14.2M" },
      { code: "YKBNK", name: "Yapı Kredi", price: 32.10, diff: -4.15, volume: "19.5M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
    ]
  },
  bist100: {
    name: "BIST 100 Endeksi",
    code: "XU100",
    description: "Borsa İstanbul'un ana endeksidir. Piyasa değeri ve işlem hacmi en yüksek 100 hissenin performansını temsil eder.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "ASELS", name: "Aselsan", price: 64.20, diff: 5.12, volume: "11.1M" },
      { code: "SAHOL", name: "Sabancı Holding", price: 98.70, diff: -1.25, volume: "4.8M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
      { code: "BIMAS", name: "Bim Mağazalar", price: 385.50, diff: -0.52, volume: "2.1M" },
    ]
  },
  bist500: {
    name: "BIST 500 Endeksi",
    code: "XU500",
    description: "Borsa İstanbul'da işlem gören ve en geniş kapsamlı 500 şirketin ortak performansını ölçen endekstir.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "ASELS", name: "Aselsan", price: 64.20, diff: 5.12, volume: "11.1M" },
      { code: "KCHOL", name: "Koç Holding", price: 242.10, diff: 2.85, volume: "5.4M" },
      { code: "SAHOL", name: "Sabancı Holding", price: 98.70, diff: -1.25, volume: "4.8M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
    ]
  },
  bistbanka: {
    name: "BIST Bankacılık Endeksi",
    code: "XBANK",
    description: "Borsa İstanbul'da işlem gören ve ana faaliyet alanı bankacılık olan tüm finans kurumlarının performansını ölçer.",
    components: [
      { code: "AKBNK", name: "Akbank", price: 58.40, diff: -3.42, volume: "14.2M" },
      { code: "YKBNK", name: "Yapı Kredi", price: 32.10, diff: -4.15, volume: "19.5M" },
      { code: "GARAN", name: "Garanti BBVA", price: 82.50, diff: -0.25, volume: "7.4M" },
      { code: "ISCTR", name: "İş Bankası C", price: 15.20, diff: 1.15, volume: "28.1M" },
      { code: "HALKB", name: "Halkbank", price: 16.40, diff: -1.80, volume: "5.1M" },
      { code: "VAKBN", name: "Vakıfbank", price: 18.10, diff: -2.10, volume: "6.2M" },
    ]
  }
};

function EndeksDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [indexData, setIndexData] = useState<IndexMeta | null>(null)
  const [indexSummary, setIndexSummary] = useState<string[] | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[] | null>(null)

  const { sendMessage } = useChatStore()
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore()

  const rawId = id.toLowerCase();
  const currentMeta = indexMetadata[rawId] || indexMetadata.bist100;

  useEffect(() => {
    async function fetchIndexDetail() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";

        // Fetch dynamic index AI Header Summary
        try {
          const summaryRes = await fetch(`${apiUrl}/api/market/symbol/${currentMeta.code.toUpperCase()}/header-summary`);
          if (summaryRes.ok) {
            const summaryJson = await summaryRes.json();
            if (summaryJson) {
              if (summaryJson.paragraphs) {
                setIndexSummary(summaryJson.paragraphs);
              }
              if (summaryJson.questions) {
                setSuggestedQuestions(summaryJson.questions);
              }
            }
          }
        } catch (e) {
          console.error("Failed to load index AI summary", e);
        }

      } catch (err) {
        console.error("Failed to load index detail", err);
      }
    }

    setIndexData(currentMeta);
    fetchIndexDetail();
  }, [id, currentMeta]);

  if (!indexData) return null;

  const chatContext = `endeks:${currentMeta.code.toLowerCase()}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 flex flex-col min-h-fit pb-12">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-1 shrink-0">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Endeks Detay</span>
          <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight leading-none mt-1">{indexData.name}</h1>
        </div>
      </div>

      {/* Description Info */}
      <div className="border border-border/50 p-5 rounded-xl bg-card/40 text-xs text-muted-foreground/80 leading-relaxed">
        {indexData.description}
      </div>

      {/* AI Analiz Raporu */}
      {indexSummary && indexSummary.length > 0 && (
        <div className="relative overflow-hidden space-y-6">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-primary" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">AI ÖZET ANALİZ</h3>
            </div>
            
            <div className="text-sm md:text-[15px] text-foreground/80 leading-relaxed font-medium">
              {indexSummary.map((p, idx) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
              ))}
            </div>
          </div>

          {/* Suggested Questions Section */}
          {suggestedQuestions && suggestedQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-primary/75" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">ÖNERİLEN ANALİZ SORULARI</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      await sendMessage(q, chatContext);
                      if (!isRightSidebarOpen) {
                        toggleRightSidebar();
                      }
                    }}
                    className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/40 hover:border-border rounded-xl p-3.5 transition-all cursor-pointer leading-relaxed active:scale-[0.99] font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Constituent Stocks Table */}
      <div className="border border-border/75 rounded-xl p-5 bg-card/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-4 shrink-0">
          <Globe size={14} className="text-primary" />
          <span>Bileşenler ve Ağırlıklar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-2 font-semibold">Hisse</th>
                <th className="pb-3 pr-2 font-semibold">Şirket Unvanı</th>
                <th className="pb-3 text-right pr-2 font-semibold">Son Fiyat</th>
                <th className="pb-3 text-right font-semibold">Değişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {indexData.components.map((comp) => {
                const compUp = comp.diff >= 0;
                return (
                  <tr 
                    key={comp.code}
                    onClick={() => navigate({ to: `/panel/sirketler/${comp.code.toLowerCase()}` as any })}
                    className="group hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-2 font-semibold text-foreground group-hover:text-primary transition-colors">
                      {comp.code}
                    </td>
                    <td className="py-3 pr-2 text-muted-foreground max-w-[150px] truncate">
                      {comp.name}
                    </td>
                    <td className="py-3 text-right pr-2 text-foreground font-medium">
                      {comp.price.toFixed(2)} TL
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        compUp ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                      }`}>
                        {compUp ? "+" : ""}{comp.diff.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
