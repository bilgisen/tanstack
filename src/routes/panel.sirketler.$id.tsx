import { createFileRoute } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import companyNames from '../constants/companyNames.json'

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
  const [loadingSummary, setLoadingSummary] = useState(false)

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
            if (summaryJson && summaryJson.paragraphs) {
              setHeaderSummary(summaryJson.paragraphs);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 flex flex-col min-h-fit pb-12">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-1 shrink-0">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{data.code} / BIST</span>
          <h1 className="text-base font-semibold text-foreground tracking-tight leading-none mt-0.5">{data.name}</h1>
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
        <div className="relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3.5">
            <Sparkles size={15} className="text-primary" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">AI ÖZET ANALİZ</h3>
          </div>
          
          <div className="space-y-3.5 text-xs md:text-sm text-foreground/80 leading-relaxed font-medium">
            {headerSummary.map((p, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
