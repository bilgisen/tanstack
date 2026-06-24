# Bugfix Requirements Document

## Introduction

Sektör detay sayfaları (örn: `/sektorler/holdingler`) kullanıcılar tarafından erişildiğinde yüklenmiyor. Kullanıcı sektör listesinden bir sektöre tıkladığında, o sektöre ait şirketler ve sektör özeti gösterilmesi gerekirken sayfa düzgün şekilde render edilmiyor. Bu bug, kullanıcıların sektörel analiz yapmasını ve sektördeki şirketleri görmesini engelliyor.

Sorun temel olarak `sektorler.$slug.tsx` dosyasındaki state yönetimi ve zamanlama hatalarından kaynaklanıyor: sektör özeti hesaplaması `companies` state'i henüz boşken yapılıyor, bu da her zaman "0 şirket" ve "%0 değişim" sonucu veriyor.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN kullanıcı bir sektör detay sayfasına eriştiğinde (örn: `/sektorler/holdingler`) THEN sektör özeti yanlış hesaplanır ve "0 şirket" ile "%0 değişim" değerleri gösterilir

1.2 WHEN `useEffect` içinde `setSectorSummary` çağrısı yapıldığında THEN `companies` array'i henüz boş olduğu için hesaplama yanlış sonuç verir

1.3 WHEN API'den şirket verileri başarıyla çekildiğinde THEN sektör özeti güncellenmez ve eski (hatalı) değerler ekranda kalır

### Expected Behavior (Correct)

2.1 WHEN kullanıcı bir sektör detay sayfasına eriştiğinde (örn: `/sektorler/holdingler`) THEN API'den o sektöre ait şirketler çekilmeli ve doğru şirket sayısı ile ortalama değişim yüzdesi hesaplanmalıdır

2.2 WHEN `companies` state'i güncellendikten sonra THEN sektör özeti otomatik olarak yeniden hesaplanmalı ve güncel değerlerle gösterilmelidir

2.3 WHEN API'den şirket verileri başarıyla çekildiğinde THEN şirket sayısı ve ortalama değişim yüzdesi doğru bir şekilde hesaplanmalı ve kullanıcıya gösterilmelidir

2.4 WHEN sektör özetinin hesaplanma zamanı geldiğinde THEN `companies` array'inin dolu olması garantilenmelidir

### Unchanged Behavior (Regression Prevention)

3.1 WHEN kullanıcı sektör listesi sayfasına eriştiğinde (`/sektorler`) THEN sayfa mevcut şekilde çalışmaya devam etmelidir ve tüm sektörler doğru şekilde listelenmelidir

3.2 WHEN API'den sektör verileri çekilirken THEN mevcut `toSlug` fonksiyonu ve slug-to-name mapping'i değişmeden çalışmalıdır

3.3 WHEN kullanıcı bir şirkete tıkladığında THEN şirket detay sayfasına yönlendirme mevcut şekilde çalışmalıdır

3.4 WHEN fiyat verileri API'den çekildiğinde THEN şirketlerin fiyat, değişim yüzdesi ve hacim bilgileri doğru şekilde zenginleştirilmeye devam etmelidir

3.5 WHEN loading durumu aktifken THEN "Veriler yükleniyor, lütfen bekleyin..." mesajı gösterilmeye devam etmelidir

3.6 WHEN sektör detay sayfasında şirketler tablosu render edilirken THEN mevcut tablo formatı, stil ve etkileşimler (hover, click) değişmeden çalışmalıdır
