# Polar.sh Entegrasyonu

## Değiştirilen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/lib/tiers.ts` | JetAbone ₺799 / 100K JT, ProAbone ₺1.499 / 500K JT |
| `src/routes/api/checkout.ts` | `@polar-sh/tanstack-start` `Checkout` handler — GET `/api/checkout?products=<ID>&customerExternalId=<ID>&customerEmail=<EMAIL>`, 302 redirect |
| `src/routes/api/webhooks/polar.ts` | `@polar-sh/tanstack-start` `Webhooks` handler — per-event TODO stubs (onOrderPaid, onSubscriptionActive/Canceled/Revoked) |
| `src/routes/profil.index.tsx` | "Hemen Yükselt" butonları → direkt GET redirect ile `/api/checkout` |
| `.env` | `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER` eklendi |

## Silinen Dosyalar

- `src/routes/odeme/basarili.tsx`
- `src/routes/odeme/iptal.tsx`

## Polar Ürünleri

| Plan | Product ID | Fiyat |
|---|---|---|
| JetAbone | `21cce3c0-6541-4e3d-81be-d8287e78eb0f` | ₺799/ay |
| ProAbone | `575bb0d5-44c3-49d6-aaba-fa8a9b0cc08c` | ₺1.499/ay |

## Webhook

- **URL**: `https://jetborsa.com/api/webhooks/polar`
- **Format**: raw (JSON)
- **Durum**: ✅ Polar dashboard'da kayıtlı, tüm event'ler açık
- **Webhook handler**: `onOrderPaid`, `onSubscriptionActive`, `onSubscriptionCanceled`, `onSubscriptionRevoked` — TODO stub (DB işlemleri eklenmeli)

## Kullanıcı ID Çözümleme

Checkout oluşturulurken `customerExternalId=<userId>` gönderilir. Webhook event'lerinde `event.data.customer.external_id` olarak gelir.

## Production Dağıtımı

Cloudflare Workers'ta Polar env'leri `wrangler secret` ile ayarlanmalı:

```bash
npx wrangler secret put POLAR_ACCESS_TOKEN
npx wrangler secret put POLAR_WEBHOOK_SECRET
```

`.env` dosyasındaki değerler production'da kullanılmaz.

## Webhook Event İşleyicileri

| Event | İşlem |
|---|---|
| `onOrderPaid` | `customer.external_id` → userId, product ID → tier. Kullanıcı kredilerini günceller (upsert). |
| `onSubscriptionActive` | Abonelik aktif → tier/monthlyJT güncellenir. |
| `onSubscriptionCanceled` | `polarSubStatus='canceled'`, tier değişmez (dönem sonuna kadar erişim devam). |
| `onSubscriptionRevoked` | Tier `free`'e düşer, `polarSubStatus='revoked'`. |

### Kullanılan Polar SDK tipleri

Runtime'da JSON `snake_case` property'ler kullanılır:
- `data.customer.external_id` → userId
- `data.product.id` / `data.product_id` → Polar product ID
- `data.subscription.id` / `data.subscription_id` → Polar subscription ID
- `data.current_period_end` → billing period end

## Doğrulama

- [x] JetAbone ₺799 Polar API'de var
- [x] ProAbone ₺1.499 Polar API'de var
- [x] Webhook endpoint kayıtlı (https://jetborsa.com/api/webhooks/polar)
- [x] Type check temiz (sadece önceden var olan hatalar)
