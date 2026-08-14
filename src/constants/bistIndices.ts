const bistIndices: Record<string, string> = {
  XU100: 'BIST 100',
  X100S: 'BIST 100 Ağırlık Sınırlamalı',
  XYUZO: 'BIST 100-30',
  XU030: 'BIST 30',
  X030S: 'BIST 30 Ağırlık Sınırlamalı',
  XU050: 'BIST 50',
  XSADA: 'BIST Adana',
  XBANA: 'BIST Ana',
  XSANK: 'BIST Ankara',
  XSANT: 'BIST Antalya',
  XSBAL: 'BIST Balıkesir',
  XBANK: 'BIST Banka',
  XBLSM: 'BIST Bilişim',
  XSBUR: 'BIST Bursa',
  XSDNZ: 'BIST Denizli',
  XELKT: 'BIST Elektrik',
  XFINK: 'BIST Fin. Kir. Faktoring',
  XGMYO: 'BIST Gayrimenkul Y.O.',
  XGIDA: 'BIST Gıda İçecek',
  XHARZ: 'BIST Halka Arz',
  XUHIZ: 'BIST Hizmetler',
  XHOLD: 'BIST Holding ve Yatırım',
  XILTM: 'BIST İletişim',
  XINSA: 'BIST İnşaat',
  XSIST: 'BIST İstanbul',
  XSIZM: 'BIST İzmir',
  XSKAY: 'BIST Kayseri',
  XKMYA: 'BIST Kimya Petrol Plastik',
  XKOBI: 'BIST KOBİ Sanayi',
  XSKOC: 'BIST Kocaeli',
  XSKON: 'BIST Konya',
  XKURY: 'BIST Kurumsal Yönetim',
  XMADN: 'BIST Madencilik',
  XUMAL: 'BIST Mali',
  XYORT: 'BIST Menkul Kıym. Y.O.',
  XMANA: 'BIST Metal Ana',
  XMESY: 'BIST Metal Eşya Makina',
  XKAGT: 'BIST Orman Kağıt Basım',
  XSGRT: 'BIST Sigorta',
  XUSIN: 'BIST Sınai',
  XSPOR: 'BIST Spor',
  XUSRD: 'BIST Sürdürülebilirlik',
  XTAST: 'BIST Taş Toprak',
  XSTKR: 'BIST Tekirdağ',
  XUTEK: 'BIST Teknoloji',
  XTEKS: 'BIST Tekstil Deri',
  XTMTU: 'BIST Temettü',
  XTM25: 'BIST Temettü 25',
  XTCRT: 'BIST Ticaret',
  XUTUM: 'BIST Tüm',
  XTUMY: 'BIST Tüm-100',
  XTRZM: 'BIST Turizm',
  XULAS: 'BIST Ulaştırma',
  XYLDZ: 'BIST Yıldız',
}

export default bistIndices

export type IndexCategory = 'sektor' | 'gosterge' | 'bolgesel'

export const INDEX_CATEGORIES: Record<IndexCategory, { label: string; codes: Array<string> }> = {
  sektor: {
    label: 'Sektör',
    codes: [
      'XBANK', 'XSGRT', 'XFINK', 'XGMYO', 'XHOLD', 'XGIDA', 'XKMYA', 'XMANA',
      'XMESY', 'XTAST', 'XMADN', 'XELKT', 'XINSA', 'XTEKS', 'XKAGT', 'XTRZM',
      'XULAS', 'XILTM', 'XUTEK', 'XBLSM', 'XSPOR', 'XTCRT', 'XYORT',
    ],
  },
  gosterge: {
    label: 'Gösterge',
    codes: [
      'XU100', 'XU030', 'XU050', 'XUTUM', 'XTUMY', 'XUSIN', 'XUMAL', 'XUHIZ',
      'X100S', 'X030S', 'XYUZO', 'XYLDZ', 'XUSRD', 'XTMTU', 'XTM25', 'XKURY',
      'XHARZ', 'XKOBI',
    ],
  },
  bolgesel: {
    label: 'Bölgesel',
    codes: [
      'XSADA', 'XBANA', 'XSANK', 'XSANT', 'XSBAL', 'XSBUR', 'XSDNZ', 'XSIST',
      'XSIZM', 'XSKAY', 'XSKOC', 'XSKON', 'XSTKR',
    ],
  },
}

export function getIndexSlug(code: string): string {
  return code.toLowerCase()
}

export function getIndexName(code: string): string {
  if (!code) return ''
  return bistIndices[code.toUpperCase()] || code.toUpperCase()
}
