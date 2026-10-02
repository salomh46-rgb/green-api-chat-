# 🏢 Jasper Production Infrastructure Registry & Brain Anchor
> **OXIRGI YANGILANISH (AUTO-SYNC):** 2026-10-02 15:33 (Asia/Tashkent)
> **ESLATMA YANGI CHATLAR VA SUBAGENTLAR UCHUN:** Ushbu fayl Javohirbek (Jasper) ning faol VPS serverlari, bulut xizmatlari va ishlab turgan loyihalari haqidagi bosh kognitiv xotiradir. Har qanday yangi chat sessiyasida bu ma'lumotlar avtomatik e'tiborga olinadi.

---

## 🖥️ 1. Asosiy VPS Server (Production Server)

* **Server IP manzili:** `62.171.143.55`
* **SSH Foydalanuvchisi:** `root` (Port: `22`)
* **Operatsion muhit:** Linux / Docker `29.8.1` (BuildKit & Buildx faol)
* **Boshqaruv Paneli (PaaS):** **Coolify v4.3.21**
* **Coolify Kirish URL:** `http://62.171.143.55:8000`
* **Coolify Server UUID:** `th4q5kobym2mvrlbuth2hwlv`
* **Bosh Loyiha:** `My first project` (UUID: `dhlmf6vmdqmthrfrfougam2l`)
* **Muhit:** `production` (UUID: `szo4vtoesoydgrtuuva8diex`)
* **Xavfsizlik holati:**
  * Ro'yxatdan o'tish (Registration): **O'chirilgan (Disabled)**
  * Ikki bosqichli tasdiq (2FA / Destructive action): **Faol**

---

## 🗄️ 2. VPS Ichidagi Self-Hosted Supabase Ekotizimi

Serverda to'liq mustaqil Supabase BaaS tizimi ishlab turibdi:
1. **PostgreSQL 15:** `supabase-db` (Postgres 15.8.1 — sog'lom, faol)
2. **API Gateway:** `supabase-kong` (`http://supabasekong-hpuzpikkxuolobd2zwkpcepk.62.171.143.55.sslip.io`)
3. **REST API Dvigateli:** `supabase-rest` (PostgREST v14.6)
4. **Foydalanuvchilar Autentifikatsiyasi:** `supabase-gotrue` (GoTrue v2.186.0)
5. **Fayllar Saqlash (S3):** `supabase-minio` (MinIO Object Storage)
6. **Edge Functions:** `supabase-edge-functions` (Deno runtime v1.71.2)
7. **Analitika:** `supabase-analytics` (Logflare) & `supabase-vector`

---

## 🚀 3. VPS Serverida 24/7 Ishlab Turgan Loyihalar

### A. Ovozli Savdo & Qarz Daftari AI (@Ovozli_SavdoBOT)
* **Telegram Bot:** [@Ovozli_SavdoBOT](https://t.me/Ovozli_SavdoBOT)
* **GitHub Repozitoriy:** `https://github.com/salomh46-rgb/voice2deal-ai-bot` (Public, branch: `main`)
* **Lokal kod joylashuvi:** `D:\ALLProjects\voice2deal_ai`
* **Coolify App UUID:** `l485fd7senuuzzzhnyx29yqm`
* **Holati:** 🟢 **Running (24/7 ishlab turibdi)**
* **Ichki dvigatel:** Python 3.11 Docker konteyneri, SQLite WAL (avtomatik zaxiralash bilan), Gemini AI integratsiyasi.
* **Buyruqlar:** `/kassa`, `/qarzlar`, `/xodimlar`, `/obuna`, `/rol`, `/export`, `/health`, `/start`.

### B. DentaMed Klinika Ekotizimi (@DentaMedKlinika_bot)
* **Telegram Bot:** [@DentaMedKlinika_bot](https://t.me/DentaMedKlinika_bot)
* **Bot Xizmati:** `dentamed-bot.service` (Systemd: active)
* **VPS Serverdagi Joylashuvi:** `/opt/dentamed-backend` (Python 3.11 venv)
* **Vercel Production WebApp:** `https://dentamed-hospital-crm.vercel.app`
* **Coolify Rezerv Manzili:** `http://x9tz2brejvkuqaml0l2k8jgq.62.171.143.55.sslip.io`
* **GitHub Repozitoriyalari:**
  * Frontend WebApp: `https://github.com/salomh46-rgb/dentamed-hospital-crm` (Branch: `main`)
  * Full-stack (Bot + Backend + Frontend): `https://github.com/salomh46-rgb/DentaMedKlinika_bot` (Branch: `main`)
* **Lokal Kod Joylashuvi:**
  * `D:\ALLProjects\dentamed_hospital_crm` (Frontend Vercel loyihasi)
  * `D:\ALLProjects\dental_lor_med` (Bot & Fullstack backend loyihasi)
* **Holati:** 🟢 **100% Production Ready (Bozorga to'liq tayyor)**
* **Muhim Arxitektura Sinxronizatsiyasi:**
  * **Kross-Qurilma (PC ⟷ Mobile):** Telegram rasmiy `CloudStorage` dvigateli ulandi. Bemor kompyuterda qabulga yozilsa ham, telefonda darhol ko'rinadi va aksincha.
  * **Bot Baza Sinxronizatsiyasi:** `web_app_data` orqali kelgan barcha yangi qabullar atomik tarzda `/opt/dentamed-backend/data/appointments.json` ga saqlanadi. Botdagi «📋 Mening Qabullarim» tugmasi o'sha zahotiyoq talon, shifokor va PIN-kodni chiqarib beradi.
  * **Retsepshn Web Portali:** Filiallar bo'yicha filter bilan shifokorlar smenasi va qabullar jadvali jonli ishlaydi.

### C. OmniStore Telegram Mini App (SaaS/E-commerce)
* **Lokal Kod Joylashuvi:** `C:\Users\Public\Downloads\OmniStore`
* **Holati:** 🟡 **Development (Tailwind v3.4.17 ga pasaytirildi va PostCSS xatolari tuzatildi)**
* **Texnologiyalar:** React, TypeScript, Vite, TailwindCSS (v3.4.17), DaisyUI, Zustand (tenantId state).
* **Xususiyatlari:** 
  - Multi-tenant arxitektura (`tenantId` bazasida).
  - Telegram WebApp SDK integratsiyasi (`WebApp.expand()`, `WebApp.ready()`).
  - Kassa va Savat arxitekturasi.
* **Eslatma:** UI sifati va 2026 Elite dizayn talablariga moslanmoqda. Hozirda `npm run dev` orqali `http://localhost:5173` da ishlaydi.

### D. Bestportfoliyo (Shaxsiy Vebsayt)
* **Lokal Kod Joylashuvi:** `bestportfoliyo.vercel.app` (va lokal papka)
* **Holati:** 🟢 **Production Ready (2026 Elite UI)**
* **Xususiyatlari:** 3D Interactive Grid, Cosmic Quiet Luxury, Yandex/Chrome avtotarjimasidan himoya (`notranslate`), Byudjet kalkulyatori, Karyera xaritasi.

### E. NimaBo'ldi Bot (AI Popkorn Bot)
* **Lokal Kod Joylashuvi:** `c:\Users\Public\Downloads\nimaboldi_bot`
* **Holati:** 🟢 **Production Ready** (Docker bilan)
* **Xususiyatlari:** Gemini 1.5 Flash orqali matn va ovozli xabarlarni hikoyaga aylantirish. Aiogram 3, SQLAlchemy 2.0 (PostgreSQL).

### F. Edu Track (O'quv Markaz CRM & Telegram Integratsiyasi)
* **Telegram Bot:** [@edutracku_bot](https://t.me/edutracku_bot)
* **Vercel Production:** `https://edutrack-oquv-markaz.vercel.app`
* **GitHub Repozitoriy:** `https://github.com/salomh46-rgb/edutrack-Oquv-Markaz.git` (Branch: `main`)
* **Lokal Kod Joylashuvi:** `D:\ALLProjects\EduTrackIlmziyo`
* **Asosiy Tashkilot UUID:** `b2222222-2222-2222-2222-222222222222`
* **Holati:** 🟢 **Production Ready & Telegram Auto-Link Faol**

### G. Jev System One Decision Engine & Skill
* **GitHub Repozitoriy:** `https://github.com/salomh46-rgb/jev-system-one-skill.git` (Branch: `main`)
* **Lokal Kod Joylashuvi:** `D:\ALLProjects\jev-system-one-skill`
* **Skill Joylashuvi:** `c:\Users\Public\Downloads\.agents\skills\jev-system-one`
* **Holati:** 🟢 **Production Ready & Published on GitHub**

### H. Jasper Master Agent Suite & Production Skills OS
* **GitHub Repozitoriy:** `https://github.com/salomh46-rgb/jasper-master-skill.git` (Branch: `main`)
* **Lokal Kod Joylashuvi:** `D:\ALLProjects\jasper-master-skill`
* **Holati:** 🟢 **Production Ready & Published on GitHub**

### I. GREEN-API MAX Messenger Web Client
* **GitHub Repozitoriy:** `https://github.com/salomh46-rgb/green-api-chat-.git` (Branch: `main`)
* **Vercel Production (Live Demo):** `https://green-api-chat-taupe.vercel.app/`
* **GitHub Pages Rezerv:** `https://salomh46-rgb.github.io/green-api-chat-/`
* **Lokal Kod Joylashuvi:** `c:\Users\Public\Downloads\green-api-chat`
* **Holati:** 🟢 **Production Ready & Deployed (100% Passed Vitest Automated Tests)**
* **Xususiyatlari:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Web Audio API. GREEN-API REST integratsiyasi (`SendMessage`, `ReceiveNotification`, `DeleteNotification`, `GetStateInstance`), xotiradan tozalash, adaptiv backoff, Optimistic UI, 8-prefiks normalizatsiyasi, va test topshirig'i (v5) ga 100% javob beruvchi arxitektura.

---

## 🔒 4. Lokal Xavfsizlik & Tarmoq Asboblari (Windows Kompyuterda)

* **Tor SOCKS5 Proksi:** `127.0.0.1:9050`
* **Tor ControlPort:** `127.0.0.1:9051` (SIGNAL NEWNYM bilan aylanuvchi anonim IP)
* **Boshqaruv Skriptlari:** `C:\Users\Public\Downloads\TorService`

---

## 🐳 5. VPS Serverda Jonli Ishlayotgan Konteynerlar Skaneri
```
Status check skipped: Command 'ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=2 root@62.171.143.55 "docker ps --format '{{.Names}}	{{.Status}}'"' timed out after 3 seconds
```
