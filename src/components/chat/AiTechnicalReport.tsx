import { useCallback, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  Download,
  FileText,
  Gauge,
  Layers,
  Loader2,
  Map,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { API } from "../../lib/apiConfig";
import { getSessionToken, useChatStore } from "../../store/chat";
import { useUIStore } from "../../store/ui";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import type {
  AiReportData,
  AiReportIndicators,
  AiReportKeyLevels,
  AiReportOverview,
  AiReportPatterns,
  AiReportScenarios,
} from "../../lib/aiReportTypes";

interface AiTechnicalReportProps {
  ticker: string;
  context: string;
  onRequireAuth?: () => void;
}

const REPORT_MODEL_ID = "gemini-2.5-flash";
const EST_INPUT_TOKENS = 4000;
const EST_OUTPUT_TOKENS = 2000;

const fmtPrice = (v: number | undefined | null) => {
  if (v == null || isNaN(v)) return "—";
  return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtPct = (v: number | undefined | null) => {
  if (v == null || isNaN(v)) return "—";
  return `${v.toFixed(1)}%`;
};

const fmtRatio = (v: number | string | undefined | null) => {
  if (v == null) return "—";
  if (typeof v === "string") {
    const parsed = parseFloat(v.replace(",", "."));
    return !isNaN(parsed) ? parsed.toFixed(2) : v;
  }
  return v.toFixed(2);
};

const fmtNum = (v: number | string | undefined | null) => {
  if (v == null) return "—";
  if (typeof v === "string") return v;
  return fmtPrice(v);
};

function probText(v: number | string | undefined | null): string {
  if (v == null) return "";
  if (typeof v === "number") return `%${v}`;
  if (typeof v === "string") return v;
  return "";
}

function toneClass(dir?: string): "up" | "down" | undefined {
  const d = (dir || "").toLowerCase();
  if (d.includes("bull")) return "up";
  if (d.includes("bear")) return "down";
  return undefined;
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="text-sm font-semibold text-foreground">{title}</div>
    </div>
  );
}

function Row({ label, value, mono = true, tone }: { label: string; value: string; mono?: boolean; tone?: "up" | "down" | "muted" }) {
  const toneCls =
    tone === "up" ? "text-emerald-500" : tone === "down" ? "text-destructive" : tone === "muted" ? "text-muted-foreground" : "text-foreground";
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono" : ""} text-sm font-semibold ${toneCls}`}>{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/20 bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground break-words">{value}</div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const size = 84;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-foreground leading-none">{score}</span>
        <span className="text-[9px] text-muted-foreground font-medium mt-0.5">/100</span>
      </div>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────── */
function OverviewSection({ data }: { data: AiReportOverview }) {
  const overview = data.overview;
  const comps = overview?.score_components || {};
  const components = [
    { label: "Trend", value: comps.trend ?? 0 },
    { label: "Momentum", value: comps.momentum ?? 0 },
    { label: "Hacim", value: comps.volume ?? 0 },
    { label: "Formasyon", value: comps.pattern ?? 0 },
  ].filter((c) => c.value > 0);
  const risks = (data.risk_assessment?.technical_risks || []).filter(Boolean);
  const opps = (data.risk_assessment?.technical_opportunities || []).filter(Boolean);

  return (
    <div className="space-y-4">
      <SectionHeading icon={<FileText size={13} />} title="Genel Görünüm" />

      {data.executive_summary && (
        <div className="rounded-xl border border-border/20 bg-muted/10 px-4 py-3 text-sm leading-relaxed text-foreground/85">
          {data.executive_summary}
        </div>
      )}

      {overview && (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <ScoreRing score={overview.technical_score ?? 0} />
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Teknik Skor
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2">
            <Row label="Güven" value={overview.confidence || "—"} mono={false} />
            <Row label="Piyasa Rejimi" value={overview.market_regime || "—"} mono={false} />
            <Row label="Trend Yönü" value={overview.trend_direction || "—"} mono={false} />
            <Row label="Fiyat Karakteri" value={overview.price_character || "—"} mono={false} />
            <Row label="Konfluans" value={`${overview.confluence_score ?? "—"} /100`} />
            <Row label="Önerilen Strateji" value={overview.recommended_strategy || "—"} mono={false} />
          </div>
        </div>
      )}

      {components.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {components.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5 rounded-lg border border-border/20 bg-muted/5 px-3 py-1.5">
              <span className="text-[11px] text-muted-foreground">{c.label}</span>
              <span className="text-xs font-bold font-mono text-foreground">{c.value}</span>
            </div>
          ))}
        </div>
      )}

      {(risks.length > 0 || opps.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {risks.length > 0 && (
            <div className="rounded-xl border border-destructive/15 bg-destructive/5 px-3.5 py-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-destructive">
                <Shield size={12} /> Riskler
              </div>
              <ul className="space-y-1">
                {risks.slice(0, 5).map((r, i) => (
                  <li key={i} className="text-xs leading-relaxed text-foreground/80">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {opps.length > 0 && (
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                <TrendingUp size={12} /> Fırsatlar
              </div>
              <ul className="space-y-1">
                {opps.slice(0, 5).map((o, i) => (
                  <li key={i} className="text-xs leading-relaxed text-foreground/80">
                    • {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {data.izlenmesi_gerekenler && (
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3">
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            İzlenmesi Gerekenler
          </div>
          {data.izlenmesi_gerekenler.not && (
            <p className="text-xs leading-relaxed text-foreground/80">{data.izlenmesi_gerekenler.not}</p>
          )}
          {(data.izlenmesi_gerekenler.izlenecek_konular || []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(data.izlenmesi_gerekenler.izlenecek_konular || []).slice(0, 8).map((k, i) => (
                <span key={i} className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Indicators ────────────────────────────────────────────── */
function IndicatorsSection({ data }: { data: AiReportIndicators }) {
  const ind = data.indicators;
  const comps = data.score_components || {};

  const rows: Array<{ label: string; value: string; mono?: boolean; tone?: "up" | "down" | "muted" }> = [];

  if (ind?.rsi?.value != null) {
    const v = ind.rsi.value;
    rows.push({
      label: "RSI (14)",
      value: `${v.toFixed(1)}${ind.rsi.interpretation || ind.rsi.status ? ` — ${ind.rsi.interpretation || ind.rsi.status}` : ""}`,
      mono: false,
      tone: v >= 70 ? "up" : v <= 30 ? "down" : undefined,
    });
  }
  if (ind?.macd?.histogram != null) {
    rows.push({
      label: "MACD Histogram",
      value: ind.macd.histogram.toFixed(2),
      tone: ind.macd.histogram >= 0 ? "up" : "down",
    });
  }
  if (ind?.stochastic?.k != null) {
    rows.push({
      label: "Stokastik",
      value: `${ind.stochastic.k.toFixed(0)} / ${ind.stochastic.d?.toFixed(0) ?? "—"}`,
      tone: toneClass(ind.stochastic.status),
    });
  }
  if (ind?.supertrend?.value != null) {
    rows.push({
      label: "Supertrend",
      value: `${ind.supertrend.direction || "—"}`,
      mono: false,
      tone: toneClass(ind.supertrend.direction),
    });
  }
  if (ind?.moving_averages?.sma_20 != null) rows.push({ label: "SMA 20", value: fmtPrice(ind.moving_averages.sma_20) });
  if (ind?.moving_averages?.sma_50 != null) rows.push({ label: "SMA 50", value: fmtPrice(ind.moving_averages.sma_50) });
  if (ind?.moving_averages?.sma_200 != null) rows.push({ label: "SMA 200", value: fmtPrice(ind.moving_averages.sma_200) });
  if (ind?.moving_averages?.ema_9 != null) rows.push({ label: "EMA 9", value: fmtPrice(ind.moving_averages.ema_9) });
  if (ind?.moving_averages?.ema_21 != null) rows.push({ label: "EMA 21", value: fmtPrice(ind.moving_averages.ema_21) });
  if (ind?.moving_averages?.golden_cross != null) {
    rows.push({
      label: "Altın Kesişim",
      value: ind.moving_averages.golden_cross ? "Evet" : "Hayır",
      mono: false,
      tone: ind.moving_averages.golden_cross ? "up" : "down",
    });
  }
  if (ind?.volume?.mfi != null) {
    const mfi = ind.volume.mfi;
    rows.push({ label: "MFI", value: mfi.toFixed(0), tone: mfi > 80 ? "up" : mfi < 20 ? "down" : undefined });
  }
  if (ind?.volume?.obv_trend) rows.push({ label: "OBV Trend", value: ind.volume.obv_trend, mono: false });
  if (ind?.volatility?.atr_percent != null) rows.push({ label: "ATR (%)", value: `${ind.volatility.atr_percent.toFixed(1)}%` });
  if (ind?.adx_details?.adx != null) {
    const adx = ind.adx_details.adx;
    rows.push({ label: "ADX", value: adx.toFixed(0), tone: adx >= 25 ? "up" : "muted" });
  }
  if (ind?.vwap != null) rows.push({ label: "VWAP", value: fmtPrice(ind.vwap) });

  const components = [
    { label: "Trend", value: comps.trend ?? 0 },
    { label: "Momentum", value: comps.momentum ?? 0 },
    { label: "Hacim", value: comps.volume ?? 0 },
    { label: "Formasyon", value: comps.pattern ?? 0 },
  ].filter((c) => c.value > 0);

  return (
    <div className="space-y-4">
      <SectionHeading icon={<Gauge size={13} />} title="Göstergeler" />
      {rows.length > 0 && <div className="divide-y divide-border/15">{rows.map((r) => <Row key={r.label} {...r} />)}</div>}
      {components.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {components.map((c) => (
            <MetricCard key={c.label} label={c.label} value={String(c.value)} />
          ))}
        </div>
      )}
      {data.divergences && (data.divergences.divergence_count != null || data.divergences.summary) && (
        <div className="rounded-xl border border-border/20 bg-muted/10 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Diverjans Sinyalleri</span>
            {data.divergences.divergence_count != null && (
              <span className="text-sm font-bold font-mono text-foreground">{data.divergences.divergence_count}</span>
            )}
          </div>
          {data.divergences.summary && <p className="mt-1 text-xs text-muted-foreground">{data.divergences.summary}</p>}
        </div>
      )}
      {data.volume_profile?.poc != null && (
        <div className="text-xs text-muted-foreground">
          POC: <span className="font-mono font-semibold text-foreground">{fmtPrice(data.volume_profile.poc)}</span>
          {data.volume_profile.value_area_low != null && data.volume_profile.value_area_high != null && (
            <span className="ml-2">
              Değer Aralığı: {fmtPrice(data.volume_profile.value_area_low)} – {fmtPrice(data.volume_profile.value_area_high)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Key Levels ───────────────────────────────────────────── */
function KeyLevelsSection({ data }: { data: AiReportKeyLevels }) {
  const kl = data.key_levels || {};
  const levels = [
    kl.support_1 ? { label: "Destek 1", v: kl.support_1 } : null,
    kl.support_2 ? { label: "Destek 2", v: kl.support_2 } : null,
    kl.resistance_1 ? { label: "Direnç 1", v: kl.resistance_1 } : null,
    kl.resistance_2 ? { label: "Direnç 2", v: kl.resistance_2 } : null,
  ].filter((l): l is NonNullable<typeof l> => !!l);

  return (
    <div className="space-y-4">
      <SectionHeading icon={<Target size={13} />} title="Seviyeler" />
      {data.current_price != null && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Güncel Fiyat</span>
          <span className="text-lg font-bold font-mono text-foreground">{fmtPrice(data.current_price)}</span>
        </div>
      )}
      {levels.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {levels.map((l) => (
            <div key={l.label} className="rounded-xl border border-border/20 bg-muted/30 px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{l.label}</div>
              <div className="text-lg font-bold font-mono text-foreground">{fmtPrice(l.v.price)}</div>
              {(l.v.importance || l.v.scenario) && (
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
                  {l.v.importance || l.v.scenario}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Stop-Loss" value={fmtPrice(kl.stop_loss)} />
        <MetricCard label="Take Profit" value={fmtPrice(kl.take_profit)} />
        <MetricCard label="Risk/Ödül" value={fmtRatio(kl.risk_reward_ratio)} />
      </div>
    </div>
  );
}

/* ── Patterns ─────────────────────────────────────────────── */
function PatternsSection({ data }: { data: AiReportPatterns }) {
  const patterns = data.patterns || {};
  const candles = (patterns.candlestick || []).slice(0, 6);
  const charts = (patterns.chart || []).slice(0, 4);

  return (
    <div className="space-y-4">
      <SectionHeading icon={<Layers size={13} />} title="Formasyonlar" />
      {patterns.pattern_direction && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
            Yön: <b className="text-foreground">{patterns.pattern_direction}</b>
          </span>
          {patterns.active_count != null && (
            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary">
              {patterns.active_count} aktif
            </span>
          )}
        </div>
      )}

      {(candles.length > 0 || charts.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {candles.map((p, i) => (
            <div key={i} className="rounded-xl border border-border/20 bg-muted/30 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{p.name || "Formasyon"}</span>
                <span className={`text-[11px] font-semibold ${toneClass(p.direction) === "up" ? "text-emerald-500" : toneClass(p.direction) === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                  {toneClass(p.direction) === "up" ? "▲ Yükseliş" : toneClass(p.direction) === "down" ? "▼ Düşüş" : p.direction || "Nötr"}
                </span>
              </div>
              {(p.reliability || p.bars_ago != null) && (
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {p.reliability ? `Güvenilirlik: ${p.reliability}` : ""}
                  {p.bars_ago != null ? ` · ${p.bars_ago} bar önce` : ""}
                </div>
              )}
            </div>
          ))}
          {charts.map((p, i) => (
            <div key={`c${i}`} className="rounded-xl border border-border/20 bg-primary/5 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{p.name || "Chart Formasyonu"}</span>
                <span className={`text-[11px] font-semibold ${toneClass(p.direction) === "up" ? "text-emerald-500" : toneClass(p.direction) === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                  {toneClass(p.direction) === "up" ? "▲" : toneClass(p.direction) === "down" ? "▼" : "•"}
                </span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {p.volume_confirmed ? "Hacim onaylı" : "Hacim onayı bekleniyor"}
                {p.confidence != null ? ` · Güv: ${p.confidence}` : ""}
              </div>
              {p.entry_price != null && (
                <div className="mt-0.5 text-[10px] text-foreground/70">
                  Giriş: {fmtPrice(p.entry_price)} · Hedef: {fmtPrice(p.target_price)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.liquidity_voids && data.liquidity_voids.filter((v) => (v.price ?? 0) > 0).length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500">
            <Zap size={12} /> Likidite Boşlukları
          </div>
          <div className="space-y-1">
            {data.liquidity_voids.filter((v) => (v.price ?? 0) > 0).slice(0, 4).map((v, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-foreground/80">
                <span>
                  Boşluk @ {fmtPrice(v.price)} ({v.direction || "—"})
                </span>
                <span className="font-mono text-amber-500/80">{fmtPct(v.gap_percent)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Scenarios ────────────────────────────────────────────── */
function ScenariosSection({ data }: { data: AiReportScenarios }) {
  const s = data.scenarios || {};
  const cards: Array<{
    title: string;
    prob: string;
    body: string;
    tone: "up" | "down" | "neutral";
    toneClass: string;
  }> = [];

  if (s.positive) {
    cards.push({
      title: s.positive.name || "Olumlu",
      prob: probText(s.positive.probability),
      body: s.positive.target != null ? fmtNum(s.positive.target) : (s.positive.conditions || []).join(" · ") || "",
      tone: "up",
      toneClass: "border-emerald-500/20 bg-emerald-500/5",
    });
  }
  if (s.neutral) {
    cards.push({
      title: s.neutral.name || "Nötr",
      prob: probText(s.neutral.probability),
      body: s.neutral.strategy || (s.neutral.conditions || []).join(" · ") || "",
      tone: "neutral",
      toneClass: "border-border/20 bg-muted/10",
    });
  }
  if (s.negative) {
    cards.push({
      title: s.negative.name || "Olumsuz",
      prob: probText(s.negative.probability),
      body: s.negative.risk != null ? fmtNum(s.negative.risk) : (s.negative.conditions || []).join(" · ") || "",
      tone: "down",
      toneClass: "border-destructive/20 bg-destructive/5",
    });
  }

  return (
    <div className="space-y-4">
      <SectionHeading icon={<Map size={13} />} title="Senaryolar" />
      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {cards.map((c, i) => (
            <div key={i} className={`rounded-xl border px-3 py-3 ${c.toneClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{c.title}</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    c.tone === "up" ? "text-emerald-500" : c.tone === "down" ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {c.prob}
                </span>
              </div>
              {c.body && <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">{c.body}</div>}
            </div>
          ))}
        </div>
      )}
      {data.key_levels?.stop_loss != null && (
        <div className="grid grid-cols-3 gap-2">
          <MetricCard label="Stop-Loss" value={fmtPrice(data.key_levels.stop_loss)} />
          <MetricCard label="Take Profit" value={fmtPrice(data.key_levels.take_profit)} />
          <MetricCard label="R:R" value={fmtRatio(data.key_levels.risk_reward_ratio)} />
        </div>
      )}
    </div>
  );
}

/* ── PDF Export ───────────────────────────────────────────── */
async function exportPdf(root: HTMLElement, fileName: string) {
  const dataUrl = await toPng(root, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
    style: { colorScheme: "light" },
  });
  const imgWidth = 1600;
  const imgHeight = Math.round((dataUrl ? root.offsetHeight : root.offsetHeight) * (imgWidth / Math.max(root.offsetWidth, 1)));
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [imgWidth, imgHeight] });
  pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(`${fileName}.pdf`);
}

/* ── Main Component ───────────────────────────────────────── */
export function AiTechnicalReport({ ticker, context: _context, onRequireAuth }: AiTechnicalReportProps) {
  const [report, setReport] = useState<AiReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { setGlobalPrompt, openRightSidebar } = useUIStore();
  const { init } = useChatStore();

  const generate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const requestId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    try {
      const sessionToken = await getSessionToken();
      if (!sessionToken) {
        onRequireAuth?.();
        setError("Rapor oluşturmak için giriş yapmalısınız.");
        setLoading(false);
        return;
      }

      // 1. Token reservation (pre-check)
      const preCheckRes = await fetch("/api/ai/pre-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: REPORT_MODEL_ID,
          estimatedInputTokens: EST_INPUT_TOKENS,
          estimatedOutputTokens: EST_OUTPUT_TOKENS,
        }),
      });
      const preCheck = preCheckRes.ok ? await preCheckRes.json() : { ok: false, error: "UNKNOWN" };

      if (!preCheck.ok) {
        let msg = "Rapor oluşturulamadı. Lütfen tekrar deneyin.";
        if (preCheck.error === "MODEL_NOT_ALLOWED") {
          msg = "Bu özellik şu an kullanılamamaktadır. Abonelik paketinizi [Profil ve Abonelik Paneli](/profil) sayfasında inceleyebilirsiniz.";
        } else if (preCheck.error === "INSUFFICIENT_JT" || preCheck.error === "INSUFFICIENT_HT") {
          const available = preCheck.availableJT || preCheck.availableHT || 0;
          msg = `Yetersiz Jet Token bakiyesi! Mevcut bakiyeniz: ${available.toLocaleString()} Jet Token. [Profil ve Abonelik Paneli](/profil) üzerinden ek kredi alabilirsiniz.`;
        } else if (preCheck.error === "DAILY_LIMIT") {
          msg = "Günlük kullanım limitinize ulaştınız. Sınırsız kullanım için [Profil ve Abonelik Paneli](/profil) sayfasından paketinizi yükseltin.";
        } else if (preCheck.error === "USER_NOT_FOUND") {
          msg = "Kullanıcı bilgileriniz bulunamadı. Sayfayı yenileyip tekrar deneyin.";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      const reservedCost = preCheck.estimatedCost || 0;
      setEstimatedCost(reservedCost);

      // 2. Generate report (hono orchestrator — finveri + Gemini behind it)
      const reportRes = await fetch(`${API.hono}/api/v2/ai-report/${ticker.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!reportRes.ok) {
        const body = await reportRes.json().catch(() => null);
        setError(body?.error || "Rapor oluşturulamadı. Lütfen biraz sonra tekrar deneyin.");
        setLoading(false);
        return;
      }
      const reportData = (await reportRes.json()) as AiReportData;
      setReport(reportData);

      // 3. Charge tokens (fire-and-forget — idempotent by requestId)
      const narrative = reportData.sections?.ai_analysis?.narrative || "";
      fetch("/api/ai/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: REPORT_MODEL_ID,
          inputTokens: EST_INPUT_TOKENS,
          outputTokens: Math.max(500, Math.ceil(narrative.length / 4)),
          reservedCost,
          requestId,
          featureType: "report",
        }),
      }).catch(() => {});

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ht-balance-updated"));
      }
    } catch (e) {
      console.error("AI report generation failed:", e);
      setError("Rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [loading, ticker, onRequireAuth]);

  const ask = useCallback(
    async (question: string) => {
      if (!question) return;
      try {
        await init();
      } catch {
        // ignore
      }
      setGlobalPrompt(question);
      openRightSidebar();
    },
    [setGlobalPrompt, openRightSidebar, init]
  );

  const handleExport = useCallback(async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      await exportPdf(printRef.current, `jetborsa-ai-teknik-rapor-${ticker.toUpperCase()}`);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setExporting(false);
    }
  }, [ticker]);

  const ai = report?.sections?.ai_analysis;
  const sections = report?.sections;
  const hasSections = !!sections && Object.values(sections).some(Boolean);

  const sectionOrder: Array<{ key: string; render: () => React.ReactNode }> = [];
  const secs = sections;
  if (secs?.overview) sectionOrder.push({ key: "overview", render: () => <OverviewSection data={secs.overview as AiReportOverview} /> });
  if (secs?.indicators) sectionOrder.push({ key: "indicators", render: () => <IndicatorsSection data={secs.indicators as AiReportIndicators} /> });
  if (secs?.key_levels) sectionOrder.push({ key: "key_levels", render: () => <KeyLevelsSection data={secs.key_levels as AiReportKeyLevels} /> });
  if (secs?.patterns) sectionOrder.push({ key: "patterns", render: () => <PatternsSection data={secs.patterns as AiReportPatterns} /> });
  if (secs?.scenarios) sectionOrder.push({ key: "scenarios", render: () => <ScenariosSection data={secs.scenarios as AiReportScenarios} /> });

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles size={16} />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground">AI Teknik Analiz Raporu</div>
            <div className="text-[11px] text-muted-foreground">
              JetBorsa AI tarafından üretilir · {ticker.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {estimatedCost != null && !loading && (
            <span className="inline-flex items-center gap-1 rounded-full border border-muted/20 bg-muted/10 px-2 py-1 text-[11px] text-foreground">
              <Gauge size={11} className="text-primary" /> ~{estimatedCost.toLocaleString()} JT
            </span>
          )}
          {hasSections && !loading && (
            <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              PDF
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-1">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Loader2 size={30} className="animate-spin text-primary" />
            <div className="text-sm text-muted-foreground">
              {ticker.toUpperCase()} için teknik analiz raporu hazırlanıyor...
              <div className="mt-1 text-xs text-muted-foreground/70">
                İlk oluşturmada veriler hesaplanıyor, bu 1-2 dakika sürebilir.
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!report && !loading && !error && (
          <div className="space-y-3 py-2">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Bu rapor; trend, destek/direnç, indikatörler, formasyonlar, senaryolar ve risk metriklerini kapsayan
              profesyonel seviyede bir teknik analiz sunar. Rapor oluşturmak belirli bir Jet Token tutarı harcar.
            </p>
            <Button size="sm" onClick={generate}>
              <Bot size={14} className="mr-1.5" />
              {ticker.toUpperCase()} için AI Teknik Analiz Raporu Oluştur
            </Button>
          </div>
        )}

        {report && !loading && (
          <div ref={printRef} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{report.ticker}</span>
                {report.current_price != null && (
                  <span className="text-sm font-mono text-foreground">
                    {fmtPrice(report.current_price)} {report.unit || ""}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground/60">
                  {report.report_date ? new Date(report.report_date).toLocaleDateString("tr-TR") : "Bugün"}
                </span>
              </div>
              <button
                type="button"
                onClick={generate}
                className="flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline"
              >
                <RefreshCw size={12} /> Raporu Yenile
              </button>
            </div>

            {ai?.narrative && (
              <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles size={12} /> AI Yorumu
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{ai.narrative}</div>
              </div>
            )}

            {ai?.sonuc && ai.sonuc.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Öne Çıkanlar (Aksiyonlar)
                </div>
                {ai.sonuc.slice(0, 6).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm">
                    <span className="mt-0.5 shrink-0 text-primary">•</span>
                    <span className="text-foreground/85">{a}</span>
                  </div>
                ))}
              </div>
            )}

            {sectionOrder.length > 0 && (
              <div className="space-y-6">
                {sectionOrder.map((s) => (
                  <div key={s.key}>{s.render()}</div>
                ))}
              </div>
            )}

            {ai?.questions && ai.questions.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Merak Ettiklerin
                </div>
                {ai.questions.slice(0, 3).map((q, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => ask(q)}
                    className="flex w-full items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-left text-sm text-foreground/85 transition-colors hover:bg-primary/10 cursor-pointer"
                  >
                    <ChevronRight size={14} className="shrink-0 text-primary" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}