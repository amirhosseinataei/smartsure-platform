# 🛡️ بیمه‌یار هوشمند (SmartSure) - فهرست دسترسی

<div dir="rtl">

## 📑 فهرست مطالب

### 🚀 شروع سریع
- [README اصلی](./README.md) - معرفی کامل پروژه
- [نصب و راه‌اندازی](./README.md#-نصب-و-راه-اندازی) - راهنمای شروع

---

## 📚 مستندات

### 📖 مستندات اصلی
- [📘 مستندات API](./docs/api_documentation.md) - تمامی API های بک‌اند
- [🏛️ معماری سیستم](./docs/architecture.md) - معماری کامل سیستم
- [📋 نیازمندی‌های نرم‌افزاری (SRS)](./docs/srs.md) - مستندات SRS
- [🔒 طرح امنیت](./docs/security_plan.md) - راهنمای امنیت
- [🗄️ مستندات پایگاه داده](./docs/database.md) - ساختار و Schema
- [🚀 راهنمای استقرار](./docs/deployment.md) - راهنمای Deployment

---

## 💻 کد

### 🔧 Backend
- [README Backend](./src/backend/README.md) - راهنمای بک‌اند
- [ساختار Backend](./src/backend/) - کدهای بک‌اند
  - [Config](./src/backend/config/) - تنظیمات
  - [Models](./src/backend/models/) - کلاس‌های Model
  - [Services](./src/backend/services/) - منطق کسب‌وکار
  - [Controllers](./src/backend/controllers/) - کنترلرهای HTTP
  - [Routers](./src/backend/routers/) - مسیریابی
  - [Middlewares](./src/backend/middlewares/) - Middleware ها
  - [Utils](./src/backend/utils/) - ابزارها

### 🎨 Frontend
- [README Frontend](./src/frontend/README.md) - راهنمای فرانت‌اند
- [ساختار Frontend](./src/frontend/) - کدهای فرانت‌اند
  - [Components](./src/frontend/components/) - کامپوننت‌های React
  - [Pages](./src/frontend/pages/) - صفحات Next.js
  - [Services](./src/frontend/services/) - سرویس‌های API
  - [Utils](./src/frontend/utils/) - ابزارها

---

## 📊 دیاگرام‌ها

### 📈 UML Diagrams
- [Activity Diagrams](./diagrams/activity_diagrams/) - نمودار فعالیت
- [Sequence Diagrams](./diagrams/sequence_diagrams/) - نمودار توالی
- [Class Diagrams](./diagrams/class_diagrams/) - نمودار کلاس
- [State Machine Diagrams](./diagrams/StateMachine_diagrams/) - نمودار حالت
- [Use Case Diagrams](./diagrams/UseCase_diagrams/) - نمودار Use Case

### 🗄️ Database
- [ERD](./diagrams/erd/) - نمودار ERD
- [SQL Schema](./diagrams/erd/SmartSure%20-%20Intelligent%20Insurance%20Platform%20(AI%20+%20IoT).sql) - فایل SQL

### 🏗️ Architecture
- [Architecture Diagrams](./diagrams/Architecture_diagrams/) - دیاگرام‌های معماری

---

## 🎨 طراحی

### 🖼️ Wireframes
- [Wireframes](./wireframes/) - وایرفریم‌های UI/UX
  - [Login Screens](./wireframes/images/SmartSure%20Login/)
  - [Dashboard](./wireframes/images/PersianRiskDashboard/)

---

## 🔍 دسترسی سریع به بخش‌های کلیدی

### 🔐 احراز هویت
- [Auth Service](./src/backend/services/AuthService.js)
- [Auth Controller](./src/backend/controllers/AuthController.js)
- [Auth Router](./src/backend/routers/AuthRouter.js)
- [Auth Middleware](./src/backend/middlewares/AuthMiddleware.js)

### 📋 بیمه‌نامه‌ها
- [Policy Model](./src/backend/models/Policy.js)
- [Policy Service](./src/backend/services/PolicyService.js)
- [Policy Controller](./src/backend/controllers/PolicyController.js)
- [Policy Router](./src/backend/routers/PolicyRouter.js)

### 💰 خسارت‌ها
- [Claim Model](./src/backend/models/Claim.js)
- [Claim Service](./src/backend/services/ClaimService.js)
- [Claim Controller](./src/backend/controllers/ClaimController.js)
- [Claim Router](./src/backend/routers/ClaimRouter.js)

### 🔌 IoT
- [IoT Device Model](./src/backend/models/IoTDevice.js)
- [Sensor Data Model](./src/backend/models/SensorData.js)
- [IoT Service](./src/backend/services/IoTService.js)
- [IoT Controller](./src/backend/controllers/IoTController.js)

### 🤖 هوش مصنوعی
- [AI Model](./src/backend/models/AIModel.js)
- [AI Inference](./src/backend/models/AIInference.js)
- [AI Service](./src/backend/services/AIService.js)

### 💳 پرداخت
- [Payment Model](./src/backend/models/Payment.js)
- [Payment Service](./src/backend/services/PaymentService.js)
- [Payment Controller](./src/backend/controllers/PaymentController.js)

---

## 🛠️ ابزارها و تنظیمات

### ⚙️ Configuration
- [App Config](./src/backend/config/app.js)
- [Database Config](./src/backend/config/database.js)
- [Environment Variables](./src/backend/.env.example)

### 🔧 Utilities
- [Logger](./src/backend/utils/Logger.js)
- [Error Handler](./src/backend/utils/ErrorHandler.js)

### 📦 Package Management
- [Backend Package.json](./src/backend/package.json)
- [Frontend Package.json](./src/frontend/package.json)

---

## 📱 صفحات Frontend

### 🏠 صفحات اصلی
- [Login Page](./src/frontend/pages/auth/login.tsx)
- [Dashboard](./src/frontend/pages/dashboard/index.tsx)
- [Policies](./src/frontend/pages/policies/index.tsx)
- [Claims](./src/frontend/pages/claims/index.tsx)
- [Settings](./src/frontend/pages/settings/index.tsx)

### 🎨 کامپوننت‌ها
- [Components](./src/frontend/components/) - تمامی کامپوننت‌های React

---

## 🧪 تست

- [Backend Tests](./src/backend/__tests__/)
- [Frontend Tests](./src/frontend/__tests__/)

---

## 📝 تغییرات

برای مشاهده تغییرات اخیر:
- [Changelog](./CHANGELOG.md) - لیست تغییرات

---

## 🆘 پشتیبانی

- 📧 ایمیل: support@smartsure.ir
- 📖 مستندات: [docs/](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

## 📌 نکات مهم

1. **قبل از شروع**: حتماً [README اصلی](./README.md) را مطالعه کنید
2. **نصب**: ابتدا [نصب و راه‌اندازی](./README.md#-نصب-و-راه-اندازی) را انجام دهید
3. **مستندات**: برای جزئیات بیشتر به [مستندات](./docs/) مراجعه کنید
4. **API**: تمامی API ها در [مستندات API](./docs/api_documentation.md) موجود است

---

**آخرین به‌روزرسانی**: 2025-01-15

</div>

