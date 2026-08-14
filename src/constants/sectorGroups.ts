export const GROUP_COLORS: Record<string, string> = {
  Bankacilik_Finans: '#494fdf',
  Sigortacilik: '#22c55e',
  GYO: '#f59e0b',
  Enerji_Altyapi: '#8b5cf6',
  Sanayi_Metal_Kimya: '#06b6d4',
  Insaat_Yapi: '#f43f5e',
  Otomotiv_Savunma_Makine: '#0ea5e9',
  Saglik_Ilac: '#f97316',
  Teknoloji_Iletisim: '#14b8a6',
  Gida_Icecek_Tarim: '#64748b',
  Tuketim_Perakende_Tekstil: '#e11d48',
  Ulastirma_Lojistik: '#6366f1',
  Turizm_Medya_Eglence: '#d946ef',
  Holdingler: '#84cc16',
}

export const SECTOR_COLORS = [
  '#494fdf', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#f43f5e', '#0ea5e9', '#f97316', '#14b8a6', '#64748b',
  '#e11d48', '#6366f1', '#d946ef', '#84cc16', '#78716c',
]

export function getGroupColor(key: string): string {
  return GROUP_COLORS[key] || SECTOR_COLORS[hashCode(key) % SECTOR_COLORS.length]
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export const SECTOR_GROUPS: Record<string, string> = {
  Bankacilik_Finans: 'Bankacılık & Finans',
  Sigortacilik: 'Sigortacılık',
  GYO: 'GYO',
  Enerji_Altyapi: 'Enerji & Altyapı',
  Sanayi_Metal_Kimya: 'Sanayi & Metal & Kimya',
  Insaat_Yapi: 'İnşaat & Yapı Malzemeleri',
  Otomotiv_Savunma_Makine: 'Otomotiv & Savunma & Makine',
  Saglik_Ilac: 'Sağlık & İlaç',
  Teknoloji_Iletisim: 'Teknoloji & İletişim',
  Gida_Icecek_Tarim: 'Gıda & İçecek & Tarım',
  Tuketim_Perakende_Tekstil: 'Tüketim & Perakende & Tekstil',
  Ulastirma_Lojistik: 'Ulaştırma & Lojistik',
  Turizm_Medya_Eglence: 'Turizm & Medya & Eğlence',
  Holdingler: 'Holdingler',
}

export const SECTOR_CONSOLIDATION: Record<string, string | null> = {
  Bankacılık: 'Bankacilik_Finans',
  'Yatırım Ortaklıkları': 'Bankacilik_Finans',
  'Aracı Kurumlar': 'Bankacilik_Finans',
  'Fin.Kiralama ve Faktoring': 'Bankacilik_Finans',
  'Varlık Yönetim': 'Bankacilik_Finans',
  Sigorta: 'Sigortacilik',
  GYO: 'GYO',
  'Elektrik Üretim': 'Enerji_Altyapi',
  'Elektrik - Doğalgaz Dağıtım': 'Enerji_Altyapi',
  'Elektrik Enerji Ürt.Teçh/Tesis Kurulum': 'Enerji_Altyapi',
  Petrol: 'Enerji_Altyapi',
  'Demir-Çelik Temel': 'Sanayi_Metal_Kimya',
  'Demir-Çelik Döküm': 'Sanayi_Metal_Kimya',
  'Kimyasal Ürün': 'Sanayi_Metal_Kimya',
  Çimento: 'Sanayi_Metal_Kimya',
  Seramik: 'Sanayi_Metal_Kimya',
  Cam: 'Sanayi_Metal_Kimya',
  Boya: 'Sanayi_Metal_Kimya',
  Kablo: 'Sanayi_Metal_Kimya',
  'Endüstriyel Makine -Teçhizat Üretim': 'Sanayi_Metal_Kimya',
  'İnşaat Malzemeleri': 'Insaat_Yapi',
  'İnşaat- Taahhüt': 'Insaat_Yapi',
  Otomotiv: 'Otomotiv_Savunma_Makine',
  'Otomotiv Parçası': 'Otomotiv_Savunma_Makine',
  'Otomotiv Lastiği': 'Otomotiv_Savunma_Makine',
  Savunma: 'Otomotiv_Savunma_Makine',
  'Sağlık ve İlaç': 'Saglik_Ilac',
  Teknoloji: 'Teknoloji_Iletisim',
  'Bilgisayar Toptancılığı': 'Teknoloji_Iletisim',
  İletişim: 'Teknoloji_Iletisim',
  'İletişim Cihazları': 'Teknoloji_Iletisim',
  Gıda: 'Gida_Icecek_Tarim',
  'Meşrubat / İçecek': 'Gida_Icecek_Tarim',
  Hayvancılık: 'Gida_Icecek_Tarim',
  'Tarım Kimyasalları': 'Gida_Icecek_Tarim',
  'Tekstil Entegre': 'Tuketim_Perakende_Tekstil',
  'Endüstriyel Tekstil': 'Tuketim_Perakende_Tekstil',
  'Deri Giyim': 'Tuketim_Perakende_Tekstil',
  'Kağıt Ürünleri': 'Tuketim_Perakende_Tekstil',
  Mobilya: 'Tuketim_Perakende_Tekstil',
  Kırtasiye: 'Tuketim_Perakende_Tekstil',
  'Perakande - Ticaret': 'Tuketim_Perakende_Tekstil',
  Pazarlama: 'Tuketim_Perakende_Tekstil',
  'Dayanıklı Tüketim': 'Tuketim_Perakende_Tekstil',
  'Ulaştırma-Lojistik': 'Ulastirma_Lojistik',
  'Havayolları ve Hizm.': 'Ulastirma_Lojistik',
  Turizm: 'Turizm_Medya_Eglence',
  Medya: 'Turizm_Medya_Eglence',
  'Eğlence Hizmetleri': 'Turizm_Medya_Eglence',
  Holdingler: 'Holdingler',
  Madencilik: 'Sanayi_Metal_Kimya',
  Diğer: null,
  Spor: null,
}

// Yalnızca tek bir İY sektörü içeren gruplar. Bu gruplarda ara sayfa yerine
// grup URL'i (örn. /sektorler/gyo) doğrudan sektör detayını gösterir.
export const GROUP_TO_SINGLE_SECTOR: Record<string, string> = {
  Sigortacilik: 'Sigorta',
  GYO: 'GYO',
  Saglik_Ilac: 'Sağlık ve İlaç',
  Holdingler: 'Holdingler',
}

export function groupKeyToSlug(key: string): string {
  return key
    .replace(/_/g, '-')
    .replace(/İ/g, 'i')
    .toLowerCase()
}

export function slugToGroupKey(slug: string): string | undefined {
  const found = Object.keys(SECTOR_GROUPS).find(
    (k) => groupKeyToSlug(k) === slug
  )
  return found
}

export function sectorNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/i̇/g, 'i')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getSectorNameFromSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/\s+/g, ' ')
}

export function sectorNameToGroupKey(name: string): string | null {
  return SECTOR_CONSOLIDATION[name] ?? null
}

export function groupKeyToDisplayName(key: string): string {
  return SECTOR_GROUPS[key] || key
}

export function groupSlugToDisplayName(slug: string): string {
  const key = slugToGroupKey(slug)
  return key ? groupKeyToDisplayName(key) : slug
}

// Build reverse mapping: slug -> original sector name (with Turkish chars)
const SLUG_TO_SECTOR_NAME: Record<string, string> = {}
for (const name of Object.keys(SECTOR_CONSOLIDATION)) {
  const slug = sectorNameToSlug(name)
  // Only set if not already set, to respect insertion order
  if (!SLUG_TO_SECTOR_NAME[slug]) {
    SLUG_TO_SECTOR_NAME[slug] = name
  }
}

export function slugToSectorName(slug: string): string | undefined {
  return SLUG_TO_SECTOR_NAME[slug]
}

// ─── Endeks donut (BIST sektör dağılımı) → İY sektörü köprüsü ───────────────
// BIST `graphic.php` sector_distribution nameTr kategorileri İY sektörleriyle
// birebir örtüşmez; her BIST kategorisi en temsilci İY sektörüne eşlenir.
// Tüm 54 endeks tarandı (2026-08): 33 benzersiz BIST adı. Eşlenmeyen adlar
// ("diğer" dahil) tıklanınca /sektorler ana sayfasına yönlendirilir.
const BIST_DONUT_TO_SECTOR: Record<string, string> = {
  BANKALAR: 'Bankacılık',
  'ARACI KURUMLAR': 'Aracı Kurumlar',
  'HOLDINGLER VE YATIRIM SIRKETLERI': 'Holdingler',
  'KIMYA ILAC PETROL LASTIK VE PLASTIK URUNLER': 'Kimyasal Ürün',
  'METAL ESYA MAKINE ELEKTRIKLI CIHAZLAR VE ULASIM ARACLARI': 'Endüstriyel Makine -Teçhizat Üretim',
  'PERAKENDE TICARET': 'Perakande - Ticaret',
  'TOPTAN TICARET': 'Perakande - Ticaret',
  SAVUNMA: 'Savunma',
  'ULASTIRMA VE DEPOLAMA': 'Ulaştırma-Lojistik',
  'ANA METAL SANAYI': 'Demir-Çelik Temel',
  BILISIM: 'Teknoloji',
  'GIDA ICECEK VE TUTUN': 'Gıda',
  'YIYECEK VE ICECEK HIZMETLERI': 'Gıda',
  'HAM PETROL VE DOGALGAZ CIKARTILMASI': 'Petrol',
  'ELEKTRIK GAZ VE BUHAR': 'Elektrik Üretim',
  'FINANSAL KIRALAMA VE FAKTORING SIRKETLERI': 'Fin.Kiralama ve Faktoring',
  'GAYRI MENKUL FAALIYETLERI': 'GYO',
  'GAYRIMENKUL YATIRIM ORTAKLIKLARI': 'GYO',
  'INSAAT VE BAYINDIRLIK ISLERI': 'İnşaat- Taahhüt',
  'KAGIT VE KAGIT URUNLERI BASIM': 'Kağıt Ürünleri',
  'KOMUR VE LINYIT MADENCILIGI': 'Madencilik',
  'METAL CEVHERI MADENCILIGI': 'Madencilik',
  'MENKUL KIYMET YATIRIM ORTAKLIKLARI': 'Yatırım Ortaklıkları',
  'ORMAN URUNLERI VE MOBILYA': 'Mobilya',
  'SEYAHAT ACENTESI TUR OPERATORU VE DIGER REZERVASYON HIZMETLERI ILE ILGILI FAALIYETLER': 'Turizm',
  KONAKLAMA: 'Turizm',
  'SIGORTA SIRKETLERI': 'Sigorta',
  'SPOR FAALIYETLERI EGLENCE VE OYUN FAALIYETLERI': 'Spor',
  'TAS VE TOPRAGA DAYALI': 'Çimento',
  'TEKSTIL GIYIM ESYASI VE DERI': 'Tekstil Entegre',
  TELEKOMUNIKASYON: 'İletişim',
}

export function bistDonutToSectorName(name: string): string | undefined {
  if (!name) return undefined
  const norm = name.toLocaleUpperCase('tr-TR').trim()
  return BIST_DONUT_TO_SECTOR[norm]
}

export function sectorNameToGroupSlug(name: string): string | undefined {
  const key = sectorNameToGroupKey(name)
  return key ? groupKeyToSlug(key) : undefined
}
