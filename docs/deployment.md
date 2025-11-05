# راهنمای استقرار - بیمه‌یار هوشمند (SmartSure)

## فهرست مطالب
1. [پیش‌نیازها](#پیش-نیازها)
2. [نصب و راه‌اندازی](#نصب-و-راه-اندازی)
3. [پیکربندی](#پیکربندی)
4. [استقرار Production](#استقرار-production)
5. [مانیتورینگ](#مانیتورینگ)

---

## پیش‌نیازها

### نرم‌افزارهای مورد نیاز

- **Node.js**: نسخه 18 یا بالاتر
- **SQL Server**: نسخه 2019 یا بالاتر
- **npm** یا **yarn**: برای مدیریت پکیج‌ها

### بررسی نصب

```bash
node --version
npm --version
```

---

## نصب و راه‌اندازی

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd smartsure-platform/src/backend
```

### 2. نصب Dependencies

```bash
npm install
```

### 3. کپی فایل Environment

```bash
cp .env.example .env
```

### 4. تنظیم فایل .env

مقادیر را در فایل `.env` تنظیم کنید:

```env
NODE_ENV=development
PORT=3000
DB_SERVER=localhost
DB_DATABASE=smartsure
DB_USER=sa
DB_PASSWORD=YourPassword
JWT_SECRET=your-secret-key
```

### 5. راه‌اندازی پایگاه داده

فایل SQL موجود در `diagrams/erd/` را در SQL Server اجرا کنید:

```bash
sqlcmd -S localhost -d smartsure -i "../diagrams/erd/SmartSure - Intelligent Insurance Platform (AI + IoT).sql"
```

### 6. اجرای سرور

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

---

## پیکربندی

### Database Connection

تنظیمات اتصال به پایگاه داده در فایل `.env`:

```env
DB_SERVER=localhost
DB_DATABASE=smartsure
DB_USER=sa
DB_PASSWORD=YourPassword
DB_PORT=1433
DB_ENCRYPT=true
```

### JWT Configuration

```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## استقرار Production

### استفاده از PM2

```bash
npm install -g pm2
pm2 start server.js --name smartsure-backend
pm2 save
pm2 startup
```

### Docker (اختیاری)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## مانیتورینگ

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

```bash
# Development
tail -f logs/app.log

# Production (PM2)
pm2 logs smartsure-backend
```

---

**آخرین به‌روزرسانی**: 2025-01-15

