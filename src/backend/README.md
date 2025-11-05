# 🔧 SmartSure Backend

<div dir="rtl">

**بک‌اند پلتفرم بیمه‌یار هوشمند با Node.js + Express + SQL Server**

## 📋 فهرست مطالب

1. [معرفی](#معرفی)
2. [معماری](#معماری)
3. [نصب و راه‌اندازی](#نصب-و-راه-اندازی)
4. [ساختار پروژه](#ساختار-پروژه)
5. [API Endpoints](#api-endpoints)
6. [تست](#تست)
7. [استقرار](#استقرار)

---

## 🎯 معرفی

بک‌اند SmartSure با استفاده از **Node.js** و **Express.js** و **SQL Server** پیاده‌سازی شده است. این سیستم از **معماری OOP** و **Layered Architecture** استفاده می‌کند.

### ویژگی‌ها

- ✅ معماری OOP با کلاس‌ها
- ✅ استفاده از SQL Server
- ✅ احراز هویت JWT
- ✅ اعتبارسنجی با Joi
- ✅ Logging با Winston
- ✅ Error Handling پیشرفته
- ✅ پشتیبانی از IoT و AI

---

## 🏗️ معماری

### ساختار کلی

```
Request → Router → Middleware → Controller → Service → Model → Database
                                                      ↓
Response ← Router ← Middleware ← Controller ← Service ← Model ← Database
```

### لایه‌ها

1. **Router Layer**: مسیریابی درخواست‌ها
2. **Middleware Layer**: احراز هویت، اعتبارسنجی، Logging
3. **Controller Layer**: مدیریت HTTP Request/Response
4. **Service Layer**: منطق کسب‌وکار
5. **Model Layer**: دسترسی به داده
6. **Database Layer**: SQL Server

---

## 📦 نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- SQL Server 2019+
- npm یا yarn

### مراحل نصب

#### 1. نصب Dependencies

```bash
npm install
```

#### 2. تنظیم Environment Variables

```bash
cp .env.example .env
```

فایل `.env` را ویرایش کنید:

```env
NODE_ENV=development
PORT=3000
DB_SERVER=localhost
DB_DATABASE=smartsure
DB_USER=sa
DB_PASSWORD=YourPassword
JWT_SECRET=your-secret-key
```

#### 3. راه‌اندازی پایگاه داده

فایل SQL موجود در `diagrams/erd/` را در SQL Server اجرا کنید:

```bash
sqlcmd -S localhost -d smartsure -i "../diagrams/erd/SmartSure - Intelligent Insurance Platform (AI + IoT).sql"
```

#### 4. اجرای سرور

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

سرور در آدرس `http://localhost:3000` اجرا می‌شود.

---

## 📁 ساختار پروژه

```
src/backend/
├── config/              # تنظیمات
│   ├── database.js      # اتصال به SQL Server
│   └── app.js           # تنظیمات اپلیکیشن
├── models/              # کلاس‌های Model
│   ├── BaseModel.js     # کلاس پایه
│   ├── User.js
│   ├── Customer.js
│   ├── Policy.js
│   ├── Claim.js
│   ├── IoTDevice.js
│   ├── Payment.js
│   └── ...
├── services/            # کلاس‌های Service
│   ├── AuthService.js
│   ├── PolicyService.js
│   ├── ClaimService.js
│   ├── IoTService.js
│   ├── PaymentService.js
│   └── AIService.js
├── controllers/         # کلاس‌های Controller
│   ├── AuthController.js
│   ├── PolicyController.js
│   ├── ClaimController.js
│   └── ...
├── routers/            # کلاس‌های Router
│   ├── AuthRouter.js
│   ├── PolicyRouter.js
│   ├── ClaimRouter.js
│   └── ...
├── middlewares/        # کلاس‌های Middleware
│   ├── AuthMiddleware.js
│   └── ValidationMiddleware.js
├── utils/              # ابزارها
│   ├── Logger.js
│   └── ErrorHandler.js
├── app.js              # کلاس اصلی Express App
└── server.js           # نقطه ورود سرور
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### احراز هویت

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
GET  /api/v1/auth/profile
PUT  /api/v1/auth/change-password
```

### بیمه‌نامه‌ها

```http
GET    /api/v1/policies
POST   /api/v1/policies
GET    /api/v1/policies/:id
PATCH  /api/v1/policies/:id/premium
```

### خسارت‌ها

```http
POST /api/v1/claims
GET  /api/v1/claims
GET  /api/v1/claims/:id
```

### IoT

```http
POST /api/v1/iot/devices
POST /api/v1/iot/telemetry
GET  /api/v1/iot/devices
GET  /api/v1/iot/devices/:deviceId/data
```

### پرداخت

```http
POST /api/v1/payments/claim
GET  /api/v1/payments
```

برای جزئیات کامل: [API Documentation](../../docs/api_documentation.md)

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

### تست یکپارچگی

```bash
npm run test:integration
```

---

## 🚀 استقرار

### Development

```bash
npm run dev
```

### Production

#### استفاده از PM2

```bash
npm install -g pm2
pm2 start server.js --name smartsure-backend
pm2 save
pm2 startup
```

#### Docker

```bash
docker build -t smartsure-backend .
docker run -p 3000:3000 smartsure-backend
```

برای جزئیات بیشتر: [Deployment Guide](../../docs/deployment.md)

---

## 📝 Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest",
  "lint": "eslint ."
}
```

---

## 🔐 امنیت

- ✅ JWT برای احراز هویت
- ✅ bcrypt برای Hash کردن رمز عبور
- ✅ Input Validation با Joi
- ✅ Rate Limiting
- ✅ CORS Configuration
- ✅ Helmet برای Security Headers

---

## 📊 Logging

Logs در فایل‌های زیر ذخیره می‌شوند:

- `logs/error.log` - خطاها
- `logs/combined.log` - تمام Log ها

برای تنظیم سطح Logging:

```env
LOG_LEVEL=info  # error, warn, info, debug
```

---

## 🐛 Debugging

### Development Mode

```bash
DEBUG=* npm run dev
```

### Logging

```javascript
const Logger = require('./utils/Logger');
const logger = new Logger('MyModule');

logger.info('Info message');
logger.error('Error message', error);
```

---

## 📚 منابع بیشتر

- [مستندات API](../../docs/api_documentation.md)
- [معماری سیستم](../../docs/architecture.md)
- [طرح امنیت](../../docs/security_plan.md)
- [مستندات پایگاه داده](../../docs/database.md)

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

