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
  Madencilik: 'Holdingler',
  Diğer: null,
  Spor: null,
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
