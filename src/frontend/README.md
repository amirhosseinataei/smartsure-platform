# 🎨 SmartSure Frontend

<div dir="rtl">

**فرانت‌اند پلتفرم بیمه‌یار هوشمند با Next.js + React + Tailwind CSS**

## 📋 فهرست مطالب

1. [معرفی](#معرفی)
2. [معماری](#معماری)
3. [نصب و راه‌اندازی](#نصب-و-راه-اندازی)
4. [ساختار پروژه](#ساختار-پروژه)
5. [صفحات اصلی](#صفحات-اصلی)
6. [کامپوننت‌ها](#کامپوننت-ها)
7. [استقرار](#استقرار)

---

## 🎯 معرفی

فرانت‌اند SmartSure با استفاده از **Next.js 14**، **React 18** و **Tailwind CSS** پیاده‌سازی شده است. این سیستم از **TypeScript** برای Type Safety استفاده می‌کند.

### ویژگی‌ها

- ✅ Next.js 14 با App Router
- ✅ React 18 با Hooks
- ✅ Tailwind CSS برای استایل‌دهی
- ✅ TypeScript برای Type Safety
- ✅ Zustand برای State Management
- ✅ React Query برای Data Fetching
- ✅ React Hook Form برای فرم‌ها
- ✅ Responsive Design
- ✅ Dark Mode Support

---

## 🏗️ معماری

### ساختار کلی

```
User → Pages → Components → Services → API
                              ↓
                    State Management (Zustand)
```

### تکنولوژی‌ها

- **Next.js**: Framework اصلی
- **React**: کتابخانه UI
- **Tailwind CSS**: استایل‌دهی
- **TypeScript**: Type Safety
- **Zustand**: State Management
- **React Query**: Data Fetching
- **Axios**: HTTP Client

---

## 📦 نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- npm یا yarn

### مراحل نصب

#### 1. نصب Dependencies

```bash
npm install
```

#### 2. تنظیم Environment Variables

```bash
cp .env.example .env.local
```

فایل `.env.local` را ویرایش کنید:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=SmartSure
```

#### 3. اجرای Development Server

```bash
npm run dev
```

اپلیکیشن در آدرس `http://localhost:3000` اجرا می‌شود.

---

## 📁 ساختار پروژه

```
src/frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # صفحات احراز هویت
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/          # داشبورد
│   ├── policies/           # بیمه‌نامه‌ها
│   ├── claims/             # خسارت‌ها
│   ├── settings/           # تنظیمات
│   └── layout.tsx          # Layout اصلی
├── components/             # کامپوننت‌های React
│   ├── common/            # کامپوننت‌های مشترک
│   ├── forms/             # فرم‌ها
│   ├── charts/            # نمودارها
│   └── ui/                # کامپوننت‌های UI
├── lib/                   # کتابخانه‌ها
│   ├── api/               # API Client
│   ├── utils/             # ابزارها
│   └── hooks/             # Custom Hooks
├── store/                 # State Management (Zustand)
├── types/                 # TypeScript Types
├── styles/                # استایل‌های اضافی
│   └── globals.css
├── public/                # فایل‌های استاتیک
├── tailwind.config.js     # تنظیمات Tailwind
├── tsconfig.json          # تنظیمات TypeScript
└── next.config.js         # تنظیمات Next.js
```

---

## 📱 صفحات اصلی

### احراز هویت

- `/auth/login` - صفحه ورود
- `/auth/register` - صفحه ثبت‌نام
- `/auth/forgot-password` - بازیابی رمز عبور

### داشبورد

- `/dashboard` - داشبورد اصلی
- `/dashboard/overview` - نمای کلی
- `/dashboard/analytics` - تحلیل‌ها

### بیمه‌نامه‌ها

- `/policies` - لیست بیمه‌نامه‌ها
- `/policies/new` - ایجاد بیمه‌نامه جدید
- `/policies/[id]` - جزئیات بیمه‌نامه

### خسارت‌ها

- `/claims` - لیست خسارت‌ها
- `/claims/new` - ثبت خسارت جدید
- `/claims/[id]` - جزئیات خسارت

### تنظیمات

- `/settings` - تنظیمات کاربر
- `/settings/profile` - پروفایل
- `/settings/security` - امنیت

---

## 🧩 کامپوننت‌ها

### کامپوننت‌های مشترک

- `Layout` - Layout اصلی
- `Header` - هدر
- `Sidebar` - منوی کناری
- `Footer` - فوتر
- `Loading` - نمایش بارگذاری
- `Error` - نمایش خطا

### کامپوننت‌های فرم

- `LoginForm` - فرم ورود
- `RegisterForm` - فرم ثبت‌نام
- `PolicyForm` - فرم بیمه‌نامه
- `ClaimForm` - فرم خسارت

### کامپوننت‌های UI

- `Button` - دکمه
- `Input` - ورودی
- `Card` - کارت
- `Modal` - مودال
- `Table` - جدول
- `Chart` - نمودار

---

## 🎨 استایل‌دهی

### Tailwind CSS

از Tailwind CSS برای استایل‌دهی استفاده می‌شود:

```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  کلیک کنید
</button>
```

### Dark Mode

پشتیبانی از Dark Mode:

```tsx
<div className="bg-white dark:bg-gray-800">
  محتوا
</div>
```

---

## 🔌 API Integration

### API Client

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default apiClient;
```

### استفاده از React Query

```typescript
import { useQuery } from 'react-query';
import apiClient from '@/lib/api/client';

function usePolicies() {
  return useQuery('policies', async () => {
    const { data } = await apiClient.get('/policies');
    return data;
  });
}
```

---

## 📊 State Management

### Zustand Store

```typescript
// store/authStore.ts
import create from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

---

## 🧪 تست

### اجرای تست‌ها

```bash
npm test
```

### تست واحد

```bash
npm run test:unit
```

### تست E2E

```bash
npm run test:e2e
```

---

## 🚀 استقرار

### Build برای Production

```bash
npm run build
```

### اجرای Production

```bash
npm start
```

### استقرار با Vercel

```bash
vercel deploy
```

---

## 📝 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

---

## 🔐 امنیت

- ✅ Authentication با JWT
- ✅ Protected Routes
- ✅ CSRF Protection
- ✅ XSS Prevention
- ✅ Input Validation

---

## 📚 منابع بیشتر

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات را Commit کنید
4. Push کنید
5. Pull Request باز کنید

---

## 📞 پشتیبانی

برای سوالات و مشکلات:
- 📧 Email: support@smartsure.ir
- 📖 مستندات: [docs/](../../docs/)
- 🐛 Issues: GitHub Issues

---

**آخرین به‌روزرسانی**: 2025-01-15

**نسخه**: 1.0.0

</div>

