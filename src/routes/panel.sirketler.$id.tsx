import { createFileRoute } from '@tanstack/react-router'
import { Sparkles, HelpCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import companyNames from '../constants/companyNames.json'
import { useChatStore } from '../store/chat'
import { useUIStore } from '../store/ui'

export const Route = createFileRoute('/panel/sirketler/$id')({
  component: SirketDetailPage,
})

type CompanyStats = {
  name: string;
  code: string;
};

function SirketDetailPage() {
  const { id } = Route.useParams()
  const [data, setData] = useState<CompanyStats | null>(null)
  const [headerSummary, setHeaderSummary] = useState<string[] | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[] | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const { sendMessage } = useChatStore()
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore()

  const tickerUpper = id.toUpperCase();
  const officialName = (companyNames as Record<string, string>)[tickerUpper] || `${tickerUpper} Anonim Şirketi`;

  const fallback = {
    name: officialName,
    code: tickerUpper,
  };

  useEffect(() => {
    async function fetchSirketDetails() {
      setLoadingSummary(true);
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";

        // Fetch dynamic AI Header Summary
        try {
          const summaryRes = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/header-summary`);
          if (summaryRes.ok) {
            const summaryJson = await summaryRes.json();
            if (summaryJson) {
              if (summaryJson.paragraphs) {
                setHeaderSummary(summaryJson.paragraphs);
              }
              if (summaryJson.questions) {
                setSuggestedQuestions(summaryJson.questions);
              }
            }
          }
        } catch (e) {
          console.error("Failed to load AI header summary", e);
        }

        setData({
          name: officialName,
          code: tickerUpper,
        });

      } catch (err) {
        console.error("Failed to fetch company details", err);
        setData(fallback);
      } finally {
        setLoadingSummary(false);
      }
    }

    fetchSirketDetails();
  }, [id, officialName]);

  if (!data) return null;

  const chatContext = `sirket:${tickerUpper.toLowerCase()}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 flex flex-col min-h-fit pb-12">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-1 shrink-0">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{data.code} / BIST</span>
          <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight leading-none mt-1">{data.name}</h1>
        </div>
      </div>

      {/* AI Analiz Raporu Loading State */}
      {loadingSummary && !headerSummary && (
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-primary" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted-foreground/10 rounded w-full"></div>
            <div className="h-3 bg-muted-foreground/10 rounded w-5/6"></div>
          </div>
        </div>
      )}

      {/* AI Analiz Raporu - Google Minimalist style */}
      {headerSummary && headerSummary.length > 0 && (
        <div className="relative overflow-hidden space-y-6">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-primary" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">AI ÖZET ANALİZ</h3>
            </div>
            
            <div className="text-[15px] md:text-[17px] text-foreground/85 leading-relaxed font-medium">
              {headerSummary.map((p, idx) => (
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

    </div>
  )
}
