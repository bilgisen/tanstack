import { API } from './apiConfig'

const API_URL = API.hono

/** Known BIST index codes (İş Yatırım endeks listesi — 54 kod, KAP kataloğuyla eşit) */
export const INDEX_CODES = new Set([
  'XU100', 'X100S', 'XYUZO', 'XU030', 'X030S', 'XU050',
  'XSADA', 'XBANA', 'XSANK', 'XSANT', 'XSBAL', 'XBANK', 'XBLSM', 'XSBUR',
  'XSDNZ', 'XELKT', 'XFINK', 'XGMYO', 'XGIDA', 'XHARZ', 'XUHIZ', 'XHOLD',
  'XILTM', 'XINSA', 'XSIST', 'XSIZM', 'XSKAY', 'XKMYA', 'XKOBI', 'XSKOC',
  'XSKON', 'XKURY', 'XMADN', 'XUMAL', 'XYORT', 'XMANA', 'XMESY', 'XKAGT',
  'XSGRT', 'XUSIN', 'XSPOR', 'XUSRD', 'XTAST', 'XSTKR', 'XUTEK', 'XTEKS',
  'XTMTU', 'XTM25', 'XTCRT', 'XUTUM', 'XTUMY', 'XTRZM', 'XULAS', 'XYLDZ',
]);

/** Static fallback list — used only until the live market list is loaded */
const FALLBACK_STOCKS = new Set([
  'AKBNK', 'AKSA', 'ALARK', 'ARCLK', 'ASELS', 'ASTOR', 'BIMAS', 'BRSAN',
  'CCOLA', 'CIMSA', 'DOAS', 'DOGUB', 'ECZYT', 'EGEEN', 'EKGYO', 'ENJSA',
  'ENKAI', 'EREGL', 'FROTO', 'GARAN', 'GESAN', 'GUBRF', 'GWIND', 'HALKB',
  'HEKTS', 'ISCTR', 'ISGYO', 'IZMDC', 'KARSN', 'KCHOL', 'KONTR', 'KOZAA',
  'KOZAL', 'KRDMD', 'MAVI', 'MGROS', 'MPARK', 'ODAS', 'OTKAR', 'OYAKC',
  'PETKM', 'PGSUS', 'SAHOL', 'SASA', 'SISE', 'SKBNK', 'TCELL', 'THYAO',
  'TKFEN', 'TOASO', 'TSKB', 'TTKOM', 'TTRAK', 'TUPRS', 'ULKER', 'VAKBN',
  'VESBE', 'VESTL', 'YKBNK', 'ZOREN',
]);

let stockCodes: Set<string> | null = null;
let loadPromise: Promise<Set<string>> | null = null;

/**
 * Load the full BIST stock code list from the market API (single fetch, cached).
 */
export function loadMarketTickers(): Promise<Set<string>> {
  if (stockCodes) return Promise.resolve(stockCodes);
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/market/stocks`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          const codes = json.data
            .map((s: { code?: string }) => (s.code || '').toUpperCase())
            .filter(Boolean);
          if (codes.length > 0) {
            stockCodes = new Set(codes);
          }
        }
      }
    } catch {
      // fall back to static list
    }
    stockCodes = stockCodes || new Set();
    return stockCodes;
  })();
  return loadPromise;
}

/**
 * Check whether a symbol is a known BIST stock or index.
 * Uses the live list once loaded, otherwise the static fallback.
 */
export function isKnownTicker(sym: string): boolean {
  const upper = sym.toUpperCase();
  if (INDEX_CODES.has(upper)) return true;
  if (stockCodes) return stockCodes.has(upper);
  return FALLBACK_STOCKS.has(upper);
}
