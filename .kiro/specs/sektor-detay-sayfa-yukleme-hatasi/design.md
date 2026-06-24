# Sektör Detay Sayfa Yükleme Hatası - Bugfix Design

## Overview

Bu bug, sektör detay sayfasında (`/sektorler/$slug`) sektör özetinin yanlış hesaplanmasından kaynaklanıyor. Sorun, `useEffect` hook'u içinde sektör özeti (`sectorSummary`) hesaplanırken `companies` state'inin henüz boş olması. API çağrısı asenkron olduğu için, özet hesaplaması `companies` array'i dolmadan önce yapılıyor ve bu da her zaman "0 şirket" ve "%0 değişim" sonucu veriyor.

**Fix Stratejisi:** Sektör özeti hesaplamasını `companies` state'i güncellendikten sonra tetiklemek için ikinci bir `useEffect` kullanacağız. Bu, `companies` değiştiğinde otomatik olarak özeti yeniden hesaplayacak ve timing sorununu çözecek.

## Glossary

- **Bug_Condition (C)**: Sektör özeti hesaplamasının `companies` state'i boşken yapılması - bu durumda her zaman "0 şirket" ve ortalama değişim "%0" olarak hesaplanır
- **Property (P)**: Sektör özeti, `companies` state'i dolduğunda doğru şirket sayısı ve gerçek ortalama değişim yüzdesi göstermelidir
- **Preservation**: Mevcut sayfa davranışları (API çağrıları, şirket listesi render'ı, navigasyon, hover efektleri, loading durumu) değişmeden korunmalıdır
- **fetchSectorCompanies**: `useEffect` içindeki asenkron fonksiyon - API'den sektör şirketlerini çeker ve fiyat verilerini zenginleştirir
- **companies**: Sektördeki şirketlerin ticker, name, last_price, diff_percent, volume bilgilerini içeren state array'i
- **sectorSummary**: Sektör özeti metinlerini içeren string array state'i - şirket sayısı ve ortalama değişim yüzdesini gösterir

## Bug Details

### Bug Condition

Bug, sektör detay sayfası ilk yüklendiğinde meydana gelir. `useEffect` hook'u içinde API çağrısı yapılır ve aynı `useEffect` içinde sektör özeti hesaplanır. Ancak `setCompanies(enriched)` çağrısı API response'u beklerken, özet hesaplaması (`setSectorSummary`) hemen önceki satırda, henüz `companies` state'i güncellenmeden önce çalışır. Bu da özet hesaplamasının boş array üzerinde yapılmasına neden olur.

**Formal Specification:**
```
FUNCTION isBugCondition(executionContext)
  INPUT: executionContext of type { companies: SectorCompany[], calculationPoint: string }
  OUTPUT: boolean
  
  RETURN executionContext.calculationPoint === "before_state_update"
         AND executionContext.companies.length === 0
         AND sectorSummaryCalculation_is_executed === true
END FUNCTION
```

**Kod'daki Sorunlu Bölge (satır 78-82):**
```typescript
// Bu noktada companies state'i hala boş
const avgDiff = companies.length > 0
  ? companies.reduce((sum, c) => sum + (c.diff_percent || 0), 0) / companies.length
  : 0
setSectorSummary([...]) // Hatalı: boş array'den hesaplanan değerleri kullanıyor
```

### Examples

- **Örnek 1**: Kullanıcı `/sektorler/holdingler` sayfasına gider → API 15 şirket döner → Ekranda "0 şirket" ve "%0 değişim" gösterilir
- **Örnek 2**: Kullanıcı `/sektorler/bankacilik-finans` sayfasına gider → API 8 şirket döner (ortalama +2.5% değişim) → Ekranda "0 şirket" ve "%0 değişim" gösterilir
- **Örnek 3**: Kullanıcı `/sektorler/teknoloji-iletisim` sayfasına gider → API 12 şirket döner (ortalama -1.3% değişim) → Ekranda "0 şirket" ve "%0 değişim" gösterilir
- **Edge Case**: Kullanıcı gerçekten şirketi olmayan bir sektör slug'ına gider → API boş array döner → Ekranda "0 şirket" ve "%0 değişim" gösterilmeli (bu doğru davranış)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- API çağrılarının yapılış şekli (URL'ler, error handling, try-catch blokları) değişmemeli
- Şirketler tablosu render'ı aynı şekilde çalışmalı (hover, click, logo gösterimi, fiyat formatlama)
- Loading durumu ve "Veriler yükleniyor" mesajı aynı şekilde gösterilmeli
- Sektör listesi sayfası (`/sektorler`) etkilenmemeli
- `SLUG_TO_NAME` mapping'i ve `toSlug` fonksiyonu değişmemeli
- Şirket detay sayfasına navigasyon (`/panel/sirketler/${ticker}`) aynı şekilde çalışmalı
- Suggested questions (teknik/fundamental) aynı şekilde render edilmeli ve chat'e mesaj gönderme davranışı korunmalı
- Sayfa layout'u ve tüm UI komponentleri (back button, sector heading, stats boxes) görsel olarak değişmemeli

**Scope:**
Sadece sektör özeti hesaplama timing'i değiştirilecek. API çağrıları, state yönetimi (companies, sectorName, loading), UI render'ı ve kullanıcı etkileşimleri tamamen aynı kalacak.

## Hypothesized Root Cause

Kod analizi sonucunda root cause net bir şekilde belirlenmiştir:

1. **State Update Timing Issue (Ana Sebep)**: `setSectorSummary` çağrısı, `setCompanies` çağrısından önce yapılıyor. React'te `setState` asenkron olduğu için, `setCompanies(enriched)` çağrısı yapıldığında bile, o satırdan sonraki kodda hala eski (boş) `companies` değeri görünür. Özet hesaplaması bu eski değeri kullanıyor.

2. **Closure Over Stale State**: `useEffect` içindeki `fetchSectorCompanies` fonksiyonu, render sırasındaki `companies` değerini capture ediyor (closure). API çağrısı tamamlandığında bile bu closure'daki değer boş array.

3. **Same Effect Syndrome**: Hem API çağrısı hem özet hesaplaması aynı `useEffect` içinde yapılıyor. Bu, özet hesaplamasının `companies` state update'ini "görmesini" imkansız kılıyor.

4. **Missing Dependency**: Özet hesaplaması `companies` state'ine bağlı olmalı ama bağımlılık olarak tanımlanmamış. Bu, React'in otomatik yeniden hesaplama mekanizmasını devreye sokmuyor.

## Correctness Properties

Property 1: Bug Condition - Doğru Sektör Özeti Hesaplaması

_For any_ sektör detay sayfası yüklemesi (slug parametresi) ve API'den dönen şirket verisi kombinasyonu, sektör özeti `companies` state'i dolduğunda hesaplanmalı ve doğru şirket sayısı ile gerçek ortalama değişim yüzdesi gösterilmelidir.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Mevcut Sayfa Davranışları

_For any_ kullanıcı etkileşimi (sayfa navigasyonu, şirket tıklaması, chat soruları) ve API response senaryosu, fix uygulandıktan sonra sayfa mevcut davranışını korumalı, loading durumu, tablo render'ı, navigasyon ve tüm UI etkileşimleri değişmeden çalışmalıdır.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

**File**: `src/routes/sektorler.$slug.tsx`

**Function**: `SektorDetailPage` component - `useEffect` hooks

**Specific Changes**:

1. **Sektör Özeti Hesaplamasını Ayrı useEffect'e Taşı**: 
   - Mevcut `useEffect` içindeki satır 78-82'deki özet hesaplama kodunu kaldır
   - Yeni bir `useEffect` hook'u ekle, dependency array'ine `[companies, sectorName]` ekle
   - Bu yeni effect içinde özet hesaplamasını yap

2. **Timing Sorununu Çöz**:
   - `companies` state'i her güncellendiğinde (API response geldiğinde) yeni effect tetiklenecek
   - Hesaplama her zaman güncel `companies` array'i üzerinde çalışacak

3. **Edge Case Handling**:
   - `companies.length === 0` durumunda da özet göster (gerçekten şirketi olmayan sektörler için)
   - Loading durumunda özet render edilmesin (zaten loading state var)

4. **Kod Değişiklikleri**:

**Satır 78-82'yi Sil:**
```typescript
// Silinecek kod:
const avgDiff = companies.length > 0
  ? companies.reduce((sum, c) => sum + (c.diff_percent || 0), 0) / companies.length
  : 0
setSectorSummary([...])
```

**Satır 90'dan sonra (mevcut useEffect'ten sonra) Yeni useEffect Ekle:**
```typescript
useEffect(() => {
  if (loading) return; // Loading bitene kadar özet hesaplama

  const avgDiff = companies.length > 0
    ? companies.reduce((sum, c) => sum + (c.diff_percent || 0), 0) / companies.length
    : 0
  
  setSectorSummary([
    `**${sectorName}** sektöründe toplam **${companies.length}** şirket bulunmaktadır.`,
    `Sektör ortalaması bugün **${avgDiff >= 0 ? '+' : ''}${avgDiff.toFixed(2)}%** değişim göstermektedir.`
  ])
}, [companies, sectorName, loading])
```

5. **Alternative Fix (Daha Temiz)**: 
   - `sectorSummary` state'ini kaldırıp computed value olarak hesapla
   - Render sırasında doğrudan `companies` array'inden hesapla
   - State yönetimi karmaşasını tamamen ortadan kaldır

## Testing Strategy

### Validation Approach

Testing stratejisi iki fazlı: önce unfixed kod üzerinde bug'ı doğrula (counterexample'lar topla), sonra fixed kod üzerinde doğru davranışı ve preservation'ı test et.

### Exploratory Bug Condition Checking

**Goal**: UNFIXED kod üzerinde bug'ı göster. Sektör özeti hesaplamasının `companies` boşken yapıldığını counterexample'larla kanıtla.

**Test Plan**: Sektör detay sayfasını yükle, API mock'la veya gerçek API kullan, sektör özetinin yanlış gösterildiğini assert et. Console log ekleyerek `companies.length` değerini özet hesaplama noktasında kontrol et.

**Test Cases**:
1. **Holdingler Sektörü Test**: `/sektorler/holdingler` sayfasını yükle, API 15 şirket dönsün → Ekranda "0 şirket" ve "%0" gösterilmeli (BUG - unfixed kod'da fail edecek)
2. **Bankacılık Sektörü Test**: `/sektorler/bankacilik-finans` sayfasını yükle, API 8 şirket dönsün (avg +2.5%) → Ekranda "0 şirket" ve "%0" gösterilmeli (BUG - unfixed kod'da fail edecek)
3. **Boş Sektör Test**: API boş array dönsün → Ekranda "0 şirket" gösterilmeli (bu hem unfixed hem fixed kod'da aynı sonuç vermeli)
4. **Console Log Test**: `fetchSectorCompanies` içinde özet hesaplama noktasında `console.log(companies.length)` ekle → "0" yazmalı (unfixed kod'da)

**Expected Counterexamples**:
- Sektör özeti her zaman "0 şirket" ve "%0 değişim" gösterir
- `companies.length` özet hesaplama noktasında 0'dır
- API response gelmiş ve `enriched` array'i dolu olsa bile, state update henüz yansımamıştır

### Fix Checking

**Goal**: Fixed kod üzerinde, `companies` state'i dolduktan sonra sektör özetinin doğru hesaplandığını doğrula.

**Pseudocode:**
```
FOR ALL sectorSlug IN ["holdingler", "bankacilik-finans", "teknoloji-iletisim"] DO
  navigate to `/sektorler/${sectorSlug}`
  wait for API response
  wait for companies state update
  calculatedSummary := getSectorSummary()
  expectedCompanyCount := companies.length
  expectedAvgDiff := average(companies.map(c => c.diff_percent))
  
  ASSERT calculatedSummary contains expectedCompanyCount
  ASSERT calculatedSummary contains expectedAvgDiff formatted correctly
END FOR
```

**Test Plan**: Mock API response'ları hazırla, sektör detay sayfasını yükle, özet metinlerinde doğru şirket sayısı ve ortalama değişim olduğunu assert et.

### Preservation Checking

**Goal**: Fixed kod üzerinde, bug fix'in diğer sayfa davranışlarını bozmadığını doğrula.

**Pseudocode:**
```
FOR ALL userInteraction IN [page_load, company_click, chat_question, back_navigation] DO
  behaviorBefore := observeOriginalBehavior(userInteraction)
  behaviorAfter := observeFixedBehavior(userInteraction)
  
  ASSERT behaviorBefore === behaviorAfter
END FOR
```

**Testing Approach**: Property-based testing preservation için ideal çünkü:
- Birçok farklı sektör slug'ı ve API response kombinasyonu test edilebilir
- Edge case'ler (boş sektör, tek şirket, çok şirket) otomatik oluşturulur
- Regresyon garantisi güçlenir

**Test Plan**: Önce unfixed kod üzerinde mevcut davranışları gözlemle (manuel veya snapshot), sonra fixed kod üzerinde aynı davranışların korunduğunu test et.

**Test Cases**:
1. **Loading State Preservation**: Sayfa yüklenirken "Veriler yükleniyor" mesajı gösterilmeli (unfixed ve fixed aynı)
2. **Şirket Listesi Render Preservation**: Tablo doğru render edilmeli, hover efektleri çalışmalı (unfixed ve fixed aynı)
3. **Şirket Tıklama Preservation**: Şirkete tıklandığında `/panel/sirketler/${ticker}` sayfasına navigate etmeli (unfixed ve fixed aynı)
4. **Chat Soruları Preservation**: Suggested questions'a tıklandığında chat'e mesaj gönderilmeli (unfixed ve fixed aynı)
5. **Back Button Preservation**: "Sektörlere Dön" butonuna tıklandığında `/sektorler` sayfasına gitmeli (unfixed ve fixed aynı)
6. **Stats Boxes Preservation**: Yükselen/Düşen/Düz şirket sayıları doğru hesaplanmalı (unfixed ve fixed aynı)

### Unit Tests

- `companies` state'i dolduğunda sektör özetinin doğru hesaplandığını test et
- Boş `companies` array'i için özet hesaplamasını test et (edge case)
- Ortalama değişim hesaplamasının doğru formatta (+ işareti, 2 decimal) olduğunu test et
- `sectorName` değiştiğinde özet metninin güncellenmesini test et

### Property-Based Tests

- Random sektör slug'ları ve API response'ları oluştur, özet hesaplamasının her zaman doğru olduğunu test et
- Random şirket sayıları ve diff_percent değerleri generate et, ortalama hesaplamasının matematiksel doğruluğunu test et
- Random kullanıcı etkileşimleri (click, navigate) generate et, preservation'ın tüm senaryolarda korunduğunu test et

### Integration Tests

- Sektör listesinden bir sektöre tıkla → Detay sayfası yüklenmeli ve doğru özet gösterilmeli
- Detay sayfasından bir şirkete tıkla → Şirket detay sayfasına gitmeli
- Detay sayfasından geri dön → Sektör listesi sayfasına dönmeli
- Suggested question'a tıkla → Chat'e mesaj gönderilmeli ve cevap alınmalı
