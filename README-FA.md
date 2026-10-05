# Companion English (App2)

این مخزن یک برنامه مستقل برای گوشی دوم است. برنامه کنترل‌کننده قدیمی و انتخاب نقش در این پروژه وجود ندارد.

## امکانات اصلی

- ۱۲۹ درس جمله‌محور و پوشش دقیق ۵۰۴ واژه
- مرور فاصله‌دار، تمرین تلفظ و Emma متنی/صوتی
- مخاطبان واقعی، پیام متنی و پیام صوتی خصوصی
- ترجمه، اصلاح و پیشنهاد پاسخ خصوصی قبل از ارسال
- تماس صوتی زنده WebRTC با TURN
- اشتراک صفحه رضایت‌محور با اعلان رسمی Android
- کنترل لمسی اختیاری از طریق Accessibility Service
- پیشرفت ابری، زنجیره روزانه و محدودیت مصرف AI

## اجرای محلی

```bash
npm install
npm run typecheck
npm run validate:content
npm run dev -- --web
```

## راه‌اندازی Backend با یک دستور

پس از ورود و Link شدن Supabase CLI:

```bash
./scripts/setup-production.sh
```

این اسکریپت migration را اجرا و چهار Edge Function موردنیاز را منتشر می‌کند.

## TURN امن

اطلاعات اصلی سرویس TURN داخل APK قرار نمی‌گیرد. پس از تهیه سرویس، Secretها فقط روی Supabase ثبت می‌شوند:

```bash
supabase secrets set METERED_DOMAIN=YOUR_DOMAIN METERED_SECRET_KEY=YOUR_SECRET
supabase functions deploy turn-credentials
```

برای coturn شخصی می‌توان به‌جای آن `TURN_URLS`، `TURN_USERNAME` و `TURN_CREDENTIAL` را به‌عنوان Supabase Secret ثبت کرد.

## ساخت APK مستقل

شناسه Android این برنامه `com.devicecontrol.companion` است و با برنامه‌های دیگر تداخل ندارد.

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

پروفایل production در `eas.json` خروجی APK می‌سازد، onboarding واقعی را فعال نگه می‌دارد و از امضای مدیریت‌شده EAS استفاده می‌کند.

## نکات رضایت و امنیت

- اشتراک صفحه فقط پس از پنجره رسمی MediaProjection آغاز می‌شود.
- کنترل لمسی فقط پس از فعال‌سازی دستی Accessibility توسط صاحب گوشی کار می‌کند.
- TURN، پیام‌ها، فایل‌های صوتی و پیشرفت آموزشی با دسترسی احراز هویت‌شده استفاده می‌شوند.
- هیچ Secret خصوصی نباید در Git یا چت قرار گیرد.
