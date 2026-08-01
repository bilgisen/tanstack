export interface CapabilityAction {
  id: string
  icon: 'watchlist' | 'compare' | 'scan'
  label: string
  prompt: string
}

export interface PageSuggestions {
  title: string
  description: string
  suggestions: Array<string>
  capabilities?: Array<CapabilityAction>
}

const companyNames: Record<string, string> = {
  THYAO: "Türk Hava Yolları", GARAN: "Garanti BBVA", AKBNK: "Akbank",
  ISCTR: "İş Bankası", EREGL: "Ereğli Demir Çelik", TUPRS: "Tüpraş",
  ASELS: "Aselsan", SISE: "Şişe Cam", KOZAL: "Koza Altın",
  SAHOL: "Sabancı Holding", KCHOL: "Koç Holding", PGSUS: "Pegasus",
  YKBNK: "Yapı Kredi", BIMAS: "BİM", EKGYO: "Emlak Konut",
  PETKM: "Petkim", FROTO: "Ford Otosan", AEFES: "Anadolu Efes",
  DOHOL: "Doğan Holding", ZOREN: "Zorlu Enerji", HALKB: "Halk Bankası",
  TSKB: "TSKB", TTKOM: "Türk Telekom", TCELL: "Turkcell",
  VAKBN: "Vakıfbank", TOASO: "Tofaş", HEKTS: "Hektaş",
  AKSEN: "Aksa Enerji", KONTR: "Kontrolmatik", KRDMD: "Kardemir",
  OYAKC: "Oyak Çimento", SOKM: "Şok Marketler", MGROS: "Migros",
  GWIND: "Galata Wind", ALBRK: "Albaraka", ISGYO: "İş GYO",
  GLYHO: "Global Yatırım", AGHOL: "AG Holding", ALARK: "Alarko Holding",
  ARCLK: "Arçelik", BAGE: "Bage Enerji", BRYAT: "Borusan Yatırım",
  CMENT: "Çimentaş", DENGE: "Deniz Gayrimenkul", ENKAI: "Enka İnşaat",
  KARSN: "Karsan", MAVI: "Mavi Giyim", TTRAK: "Türk Traktör", LOGO: "Logo Yazılım"
}

function getCompanyName(ticker: string): string {
  const upper = ticker.toUpperCase()
  return companyNames[upper] || upper
}

export function getPageSuggestions(context: string): PageSuggestions {
  if (context.startsWith("sirket:")) {
    const parts = context.split(":")
    const ticker = parts[1]?.toUpperCase() || ""
    const subpage = parts[2] || "genel-bakis"
    const companyName = getCompanyName(ticker)

    const baseTitle = `${companyName} (${ticker})`

    const defaultCompanyCapabilities: Array<CapabilityAction> = [
      {
        id: 'watchlist',
        icon: 'watchlist',
        label: 'Takip Listeme Ekle',
        prompt: `${ticker} hissesini takip listeme ekle`
      },
      {
        id: 'compare',
        icon: 'compare',
        label: 'Rakipleriyle Karşılaştır',
        prompt: `${ticker} hissesini sektördeki rakipleriyle detaylı karşılaştır`
      },
      {
        id: 'scan',
        icon: 'scan',
        label: 'Takip Listemi Analiz Et',
        prompt: 'Takip listemdeki tüm hisselerin anlık teknik ve temel durumunu özetle'
      }
    ]

    switch (subpage) {
      case "teknik-analiz":
        return {
          title: baseTitle,
          description: `${companyName} (${ticker}) teknik göstergelerini, destek/direnç seviyelerini ve formasyonları analiz edin.`,
          suggestions: [
            `${ticker} için RSI, MACD ve hareketli ortalamalar ne gösteriyor?`,
            `${ticker} destek ve direnç seviyeleri nelerdir?`,
            `${ticker} için ATR bazlı stop-loss seviyesi nedir?`,
            `${ticker} hissesinde son dönem hacim ve momentum analizi nasıl?`
          ],
          capabilities: defaultCompanyCapabilities
        }
      case "temel-analiz":
        return {
          title: baseTitle,
          description: `${companyName} (${ticker}) finansal rasyolarını, kârlılık ve büyüme göstergelerini keşfedin.`,
          suggestions: [
            `${ticker} F/K, PD/DD ve FAVÖK marjları sektörün neresinde?`,
            `${ticker} kârlılık trendi son 5 çeyrekte nasıl değişti?`,
            `${ticker} özsermaye kârlılığı (ROE) ve borçluluk yapısı sağlıklı mı?`,
            `${ticker} sektör ortalamalarına göre ucuz mu primli mi?`
          ],
          capabilities: defaultCompanyCapabilities
        }
      case "tablolar":
        return {
          title: baseTitle,
          description: `${companyName} (${ticker}) bilanço, gelir tablosu ve nakit akış tablolarını yorumlayın.`,
          suggestions: [
            `${ticker} son bilanço ve gelir tablosu büyüme oranları nedir?`,
            `${ticker} borçluluk oranı ve net borç değişimi nasıl?`,
            `${ticker} nakit akış tablosundaki en önemli kalemleri yorumla`
          ],
          capabilities: defaultCompanyCapabilities
        }
      case "sektor":
        return {
          title: baseTitle,
          description: `${companyName} (${ticker}) sektör içindeki konumunu rakipleriyle kıyaslayın.`,
          suggestions: [
            `${ticker} rakipleri arasında F/K ve PD/DD oranında kaçıncı sırada?`,
            `${ticker} sektör ortalamasının üzerinde büyüyor mu?`,
            `${ticker} için sektör bazlı pazar payı ve kârlılık kıyası`
          ],
          capabilities: defaultCompanyCapabilities
        }
      default: // genel-bakis
        return {
          title: baseTitle,
          description: `${companyName} (${ticker}) hakkında genel bilgiler, teknik/temel özet ve sektör konumu.`,
          suggestions: [
            `${companyName} hakkında genel bilgi ver.`,
            `${ticker} hissesinin anlık teknik analizini yap`,
            `${ticker} hissenin finansal analizi ve önemli rasyoları nelerdir?`,
            `${ticker} hissesinin sektördeki konumu hakkında bilgi ver`
          ],
          capabilities: defaultCompanyCapabilities
        }
    }
  }

  if (context.startsWith("endeks:")) {
    const parts = context.split(":")
    const endeksCode = parts[1]?.toUpperCase() || ""
    const subpage = parts[2] || "genel-bakis"
    const endeksName = endeksCode === "XU100" ? "BIST 100" :
      endeksCode === "XU030" ? "BIST 30" :
      endeksCode === "XUSIN" ? "BIST Sınai" :
      endeksCode === "XBANK" ? "BIST Banka" :
      endeksCode === "XUTEK" ? "BIST Teknoloji" : endeksCode

    const sharedCapabilities: Array<CapabilityAction> = [
      {
        id: 'watchlist',
        icon: 'watchlist',
        label: 'Endeksi Takip Listeme Ekle',
        prompt: `${endeksCode} endeksini takip listeme ekle`
      },
      {
        id: 'scan',
        icon: 'scan',
        label: 'Takip Listemi Analiz Et',
        prompt: 'Takip listemdeki hisselerin genel durumunu analiz et'
      }
    ]

    if (subpage === "teknik-analiz") {
      return {
        title: endeksName,
        description: `${endeksName} teknik göstergelerini, trend ve momentum analizini inceleyin.`,
        suggestions: [
          `${endeksCode} için RSI, MACD ve hareketli ortalamalar ne gösteriyor?`,
          `${endeksCode} günlük ve haftalık trend yönü nedir?`,
          `${endeksCode} için ana destek ve direnç seviyeleri hangileri?`
        ],
        capabilities: sharedCapabilities
      }
    }

    return {
      title: endeksName,
      description: `${endeksName} endeksinin teknik görünümünü, bileşenlerini ve seviyelerini analiz edin.`,
      suggestions: [
        `${endeksCode} için trend yönü ve momentum göstergeleri ne durumda?`,
        `${endeksCode} için ana destek ve direnç seviyeleri neler?`,
        `${endeksCode} endeksinde en yüksek ağırlığa sahip hisselerin durumu nedir?`
      ],
      capabilities: sharedCapabilities
    }
  }

  if (context.startsWith("endeksler")) {
    return {
      title: "BIST Endeksleri",
      description: "Tüm BIST endekslerini inceleyin, sektörel endekslerin performanslarını karşılaştırın.",
      suggestions: [
        "BIST 100 trend yönü ve direnç seviyeleri nelerdir?",
        "Haftanın en iyi performans gösteren endeksleri hangileri?",
        "Banka endeksi (XBANK) teknik göstergeleri ne durumda?"
      ],
      capabilities: [
        {
          id: 'scan',
          icon: 'scan',
          label: 'Endeks Performansı',
          prompt: 'BIST endekslerinin son 1 haftalık performans sıralamasını getir'
        }
      ]
    }
  }

  if (context.startsWith("sector-group:") || context.startsWith("sector:") || context.startsWith("sektor:")) {
    return {
      title: "Sektör Analizi",
      description: "Sektör bazlı karşılaştırmalar yapın, sektör liderlerini keşfedin.",
      suggestions: [
        "Bu sektörde en düşük F/K oranına sahip iskontolu hisseler hangileri?",
        "Sektör medyan kârlılığının üzerinde performans gösteren şirketler?",
        "Sektördeki son dönem performans ve büyüme sıralaması nasıl?"
      ],
      capabilities: [
        {
          id: 'compare',
          icon: 'compare',
          label: 'Sektör Şirketlerini Kıyasla',
          prompt: 'Bu sektördeki öne çıkan hisseleri F/K, ROE ve borçluluk rasyolarına göre karşılaştır'
        },
        {
          id: 'scan',
          icon: 'scan',
          label: 'Sektör Hisselerini Tara',
          prompt: 'Bu sektörde özsermaye kârlılığı en yüksek hisseleri listele'
        }
      ]
    }
  }

  if (context.startsWith("profil")) {
    return {
      title: "Profil ve Abonelik",
      description: "Jet token bakiyeniz, abonelik paketiniz ve kullanım istatistikleriniz hakkında bilgi alın.",
      suggestions: [
        "Jetabone ve Proabone paketleri arasındaki fark nedir?",
        "Jet Token nedir, nasıl kullanılır?",
        "Mevcut token bakiyem ve kullanım geçmişim nedir?"
      ]
    }
  }

  // global
  return {
    title: "Araştırmaya Başlayın",
    description: "Hisseler, rasyolar, bilançolar ve teknik formasyonlar hakkında sorularınızı sorun. BIST odaklı yapay zeka analiz etsin.",
    suggestions: [
      "Bugün en çok kazandıran hisseler hangileri?",
      "BIST 100 teknik göstergeleri ne durumda?",
      "BIST 30 endeksinde öne çıkan hisseler hangileri?",
      "Takip listemdeki hisselerin genel durumunu analiz et"
    ],
    capabilities: [
      {
        id: 'scan',
        icon: 'scan',
        label: 'Takip Listemi Analiz Et',
        prompt: 'Takip listemdeki hisselerin genel durumunu analiz et'
      },
      {
        id: 'compare',
        icon: 'compare',
        label: 'Piyasa Taraması Yap',
        prompt: 'En düşük F/K oranına sahip iskontolu hisseleri tara'
      }
    ]
  }
}
