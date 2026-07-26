# JetBorsa — Proje Planı ve Durum

## Faz 1: Migration & Core Altyapı ✅
- [x] TanStack Start v1 migration (router, SSR, server functions)
- [x] Better Auth entegrasyonu (Google OAuth, session yönetimi)
- [x] D1 SQLite + Drizzle ORM (schema, migrations, seed)
- [x] Proxy-based lazy auth singleton (lib/auth.ts)
- [x] Cloudflare Workers env binding (lib/env.ts)

## Faz 2: Dashboard & Chat ✅
- [x] ChatPane / ChatPanel / ChatSheet bileşenleri
- [x] AI analysis panel (CeoTaReport, FaReport)
- [x] MarkdownRenderer (LaTeX, tablo, collapsible section desteği)
- [x] CollapsibleSection, MetricCardGrid, SuggestionChips
- [x] TradingViewChart (lightweight-charts, history fallback)
- [x] InteractiveWidget (dropdown chart picker)

## Faz 3: Auth & Credits ✅
- [x] Kullanıcı giriş/çıkış (Google OAuth)
- [x] Kredi/tier sistemi (free, subscriber, premium)
- [x] Tier bazlı içerik kilitleme (LockedSection)
- [x] Jet Token (JT) — aylık kullanım, reset, tüketim
- [x] Profil sayfası (kredi durumu, abonelik badge)

## Faz 4: Chat İyileştirmeleri ✅
- [x] Chat persistence (D1, multi-turn context)
- [x] Aylık kullanım limiti ve günlük limit
- [x] SSE stream ile canlı yanıt
- [x] Suggestion chips, follow-up sorular
- [x] Jet Token rename (eski isim: puan)

## Faz 5: Tarama (Screening) ⚡
- [x] 5.1 — Çoklu filtre UI (sektör, fiyat, P/E, PD/DD, vb.)
- [x] 5.2 — Filtre sonuçları tablosu + sıralama
- [x] 5.3 — UI iyileştirmeleri, responsive, mobil dostu
- [x] 5.4 — Rasyo bazlı filtreleme (backend `/screener/filter` + frontend `useCompScreener` + ratio UI)

## Faz 6: Sektörler ✅
- [x] Sektör grup listesi (14 grup: BIST 30, Banka, Holding, GYO, vb.)
- [x] Grup detay sayfası (şirket listesi, karşılaştırma)
- [x] Sektör ana sayfası (alfabetik sıralı, outline buton)
- [x] Sektör dağılım pie chart (endeks detayında)

## Faz 7: Endeksler ✅
- [x] Endeks listesi (DataTable ile sıralanabilir)
- [x] Endeks detay (genel bakış + teknik analiz tab'ları)
- [x] Teknik Analiz sayfası (ScoreGauge, SMA, destek/direnç)
- [x] Sektör dağılımı (pie chart)
- [x] TradingViewChart entegrasyonu

## Faz 8: Admin Paneli ✅
- [x] Kullanıcı listesi (DataTable)
- [x] Kullanıcı detay (krediler, tier değiştirme)
- [x] Model/config yönetimi

## Faz 9: AI Rapor & Best Practice Cleanup ✅
- [x] AI rapor tipleri (AnalysisResponse, SwotResponse, vb.)
- [x] Tüm hook'lara generic tipler
- [x] `as any` temizliği (30+ dosyada ~150 `any` → somut tipler)
- [x] Recharts Tooltip wrapper (SafeTooltip — typed-tooltip.tsx)
- [x] Veri tiplerinin iyileştirilmesi (useMarketData, useTechnicalAnalysis)
- [x] useCompData responselarına interface tanımları

---

## Kalan İşler 🔴

### Yüksek Öncelik
| İş | Durum | Not |
|---|---|---|---|
| **Faz 5.4 — Tarama rasyo filtreleri** | ✅ | Backend `/screener/filter` + frontend `useCompScreener` + ratio UI deployed |
| **DB view migration (D1 → haftalık)** | ✅ | `0003_spotty_warbound.sql` production D1'a uygulandı |
| **routeTree.gen.ts `as any`** | 🟢 Safe | 35 adet, TanStack Router codegen çıktısı |
| **lib/auth.ts `any`** | 🟢 Safe | Proxy pattern, library type overload uyumsuzluğu |

### Düşük Öncelik / İsteğe Bağlı
| İş | Durum | Not |
|---|---|---|
| API route'larında `@ts-nocheck` kaldırma | 🟡 İsteğe bağlı | Server-side, düşük risk |
| Unit test ekleme (vitest) | 📋 Plan | Test altyapısı hazır |
| E2E test (Playwright) | 📋 Plan | — |
| PWA / mobil optimizasyon | 📋 Plan | — |
| i18n desteği | 📋 Plan | — |

---

## Teknik Borç

| Öğe | Durum |
|---|---|
| TypeScript strict mode | ✅ Açık, tüm dosyalar derleniyor |
| `any` count (manuel dosyalar) | ~10 (auth Proxy, Recharts wrapper, API routes) |
| `routeTree.gen.ts` `as any` | 35 (auto-generated, safe) |
| Eslint config | ✅ Aktif |
