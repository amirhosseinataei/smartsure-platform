# مستندات API - بیمه‌یار هوشمند (SmartSure)

## فهرست مطالب
1. [مقدمه](#مقدمه)
2. [پایه URL](#پایه-url)
3. [احراز هویت](#احراز-هویت)
4. [API های کاربران](#api-های-کاربران)
5. [API های بیمه‌نامه](#api-های-بیمه‌نامه)
6. [API های IoT](#api-های-iot)
7. [API های خسارت](#api-های-خسارت)
8. [API های پرداخت](#api-های-پرداخت)
9. [API های هوش مصنوعی](#api-های-هوش-مصنوعی)
10. [API های مستندات](#api-های-مستندات)
11. [API های مدیریتی](#api-های-مدیریتی)

---

## مقدمه

این مستندات شامل تمامی API های سرویس بک‌اند SmartSure است. تمامی درخواست‌ها باید با فرمت JSON ارسال شوند و پاسخ‌ها نیز به صورت JSON برگردانده می‌شوند.

### کدهای وضعیت HTTP

| کد | توضیح |
|----|-------|
| 200 | موفق |
| 201 | ایجاد شد |
| 400 | درخواست نامعتبر |
| 401 | احراز هویت نشده |
| 403 | دسترسی غیرمجاز |
| 404 | یافت نشد |
| 500 | خطای سرور |

---

## پایه URL

```
Production: https://api.smartsure.ir/v1
Development: http://localhost:3000/api/v1
```

---

## احراز هویت

تمام API های محافظت‌شده نیاز به توکن JWT دارند که باید در هدر `Authorization` ارسال شود:

```
Authorization: Bearer <token>
```

### ثبت‌نام

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullname": "محمد احمدی",
  "phone": "09123456789",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "کاربر با موفقیت ثبت‌نام شد",
  "data": {
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "fullname": "محمد احمدی",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### ورود

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "username": "user123",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "ورود موفق",
  "data": {
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "fullname": "محمد احمدی",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### بازنشانی رمز عبور

```http
POST /api/v1/auth/forgot-password
```

```http
POST /api/v1/auth/reset-password
```

---

## API های کاربران

### دریافت پروفایل کاربر

```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "fullname": "محمد احمدی",
    "phone": "09123456789",
    "role": "customer",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### به‌روزرسانی پروفایل

```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullname": "محمد احمدی جدید",
  "phone": "09123456789",
  "address": "تهران، خیابان ولیعصر"
}
```

---

## API های بیمه‌نامه

### ایجاد بیمه‌نامه

```http
POST /api/v1/policies
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "insurance_type": "vehicle",
  "start_date": "2025-01-20",
  "end_date": "2026-01-20",
  "premium_amount": 5000000,
  "dynamic_premium": true,
  "iot_enabled": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "بیمه‌نامه با موفقیت ایجاد شد",
  "data": {
    "id": 1,
    "policy_number": "POL-2025-001",
    "insurance_type": "vehicle",
    "start_date": "2025-01-20",
    "end_date": "2026-01-20",
    "premium_amount": 5000000,
    "policy_status": "active",
    "qr_code": "data:image/png;base64,..."
  }
}
```

### دریافت لیست بیمه‌نامه‌ها

```http
GET /api/v1/policies
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: شماره صفحه (پیش‌فرض: 1)
- `limit`: تعداد در هر صفحه (پیش‌فرض: 10)
- `status`: فیلتر بر اساس وضعیت
- `insurance_type`: فیلتر بر اساس نوع بیمه

**Response (200):**
```json
{
  "success": true,
  "data": {
    "policies": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### دریافت جزئیات بیمه‌نامه

```http
GET /api/v1/policies/:id
Authorization: Bearer <token>
```

### به‌روزرسانی حق بیمه پویا

```http
PATCH /api/v1/policies/:id/premium
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "risk_score": 0.75,
  "behavior_score": 0.85
}
```

---

## API های IoT

### ثبت دستگاه IoT

```http
POST /api/v1/iot/devices
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "device_uid": "DEV-123456",
  "policy_id": 1,
  "type": "obd",
  "manufacturer": "SmartDevice Co",
  "model": "OBD-II Pro",
  "firmware_version": "1.0.0",
  "connection_protocol": "MQTT"
}
```

### دریافت داده‌های حسگر

```http
POST /api/v1/iot/telemetry
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "device_uid": "DEV-123456",
  "data": [
    {
      "metric": "speed",
      "value": 65.5,
      "unit": "km/h",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "metric": "acceleration",
      "value": 0.2,
      "unit": "m/s²",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### دریافت لیست دستگاه‌ها

```http
GET /api/v1/iot/devices?policy_id=1
Authorization: Bearer <token>
```

### دریافت داده‌های تاریخی

```http
GET /api/v1/iot/devices/:deviceId/data
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date`: تاریخ شروع
- `end_date`: تاریخ پایان
- `metric`: نوع متریک
- `limit`: تعداد رکوردها

---

## API های خسارت

### ثبت حادثه

```http
POST /api/v1/incidents
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "policy_id": 1,
  "device_id": 5,
  "incident_type": "crash",
  "severity": "high",
  "description": "تصادف در بزرگراه",
  "auto_detected": true
}
```

### ثبت ادعای خسارت

```http
POST /api/v1/claims
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```
policy_id: 1
incident_id: 10
claim_amount: 3000000
description: "خسارت تصادف"
images: [file1, file2, ...]
```

**Response (201):**
```json
{
  "success": true,
  "message": "ادعای خسارت با موفقیت ثبت شد",
  "data": {
    "id": 1,
    "claim_number": "CLM-2025-001",
    "status": "under_review",
    "ai_estimated_cost": 3200000,
    "confidence": 0.94,
    "fraud_score": 0.15
  }
}
```

### دریافت لیست خسارت‌ها

```http
GET /api/v1/claims
Authorization: Bearer <token>
```

### دریافت جزئیات خسارت

```http
GET /api/v1/claims/:id
Authorization: Bearer <token>
```

### بررسی خسارت (کارشناس)

```http
PATCH /api/v1/claims/:id/review
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved",
  "approved_amount": 3000000,
  "assessment_notes": "خسارت تایید شد"
}
```

---

## API های پرداخت

### پرداخت حق بیمه

```http
POST /api/v1/payments/premium
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "policy_id": 1,
  "amount": 5000000,
  "method": "online"
}
```

### پرداخت خسارت

```http
POST /api/v1/payments/claim
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "claim_id": 1,
  "amount": 3000000,
  "method": "auto_deduct"
}
```

### دریافت تاریخچه پرداخت‌ها

```http
GET /api/v1/payments?policy_id=1&claim_id=1
Authorization: Bearer <token>
```

---

## API های هوش مصنوعی

### ارزیابی خسارت با AI

```http
POST /api/v1/ai/evaluate-damage
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "claim_id": 1,
  "images": ["url1", "url2"],
  "telemetry_data": {...}
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "estimated_cost": 3200000,
    "confidence": 0.94,
    "damage_map": {...},
    "model_version": "v2.1.0"
  }
}
```

### بررسی تقلب

```http
POST /api/v1/ai/fraud-check
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "claim_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "fraud_score": 0.15,
    "risk_level": "low",
    "reasons": [],
    "recommendation": "approve"
  }
}
```

### پیش‌بینی ریسک

```http
POST /api/v1/ai/predict-risk
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "policy_id": 1,
  "telemetry_period": "30d"
}
```

---

## API های مستندات

### آپلود مستند

```http
POST /api/v1/documents
Authorization: Bearer <token>
```

**Request (multipart/form-data):**
```
claim_id: 1
file_type: prescription
file: [binary]
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "file_path": "/uploads/documents/doc-123.pdf",
    "hash": "sha256:...",
    "digital_signature": "...",
    "verified": true
  }
}
```

### دریافت مستند

```http
GET /api/v1/documents/:id
Authorization: Bearer <token>
```

### تایید امضای دیجیتال

```http
POST /api/v1/documents/:id/verify
Authorization: Bearer <token>
```

---

## API های مدیریتی

### داشبورد مدیریت

```http
GET /api/v1/admin/dashboard
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_policies": 1250,
    "active_claims": 45,
    "pending_reviews": 12,
    "fraud_alerts": 3,
    "revenue": 625000000,
    "avg_claim_time": 120
  }
}
```

### مدیریت کاربران

```http
GET /api/v1/admin/users
POST /api/v1/admin/users
PUT /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
```

### مدیریت مدل‌های AI

```http
GET /api/v1/admin/ai-models
POST /api/v1/admin/ai-models
PUT /api/v1/admin/ai-models/:id
```

### گزارش‌های تحلیلی

```http
GET /api/v1/admin/analytics?period=30d&metric=fraud_rate
Authorization: Bearer <token>
```

---

## خطاها

### فرمت پاسخ خطا

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "اطلاعات ارسالی نامعتبر است",
    "details": [
      {
        "field": "email",
        "message": "ایمیل معتبر نیست"
      }
    ]
  }
}
```

### کدهای خطا

| کد | توضیح |
|----|-------|
| VALIDATION_ERROR | خطای اعتبارسنجی |
| AUTHENTICATION_ERROR | خطای احراز هویت |
| AUTHORIZATION_ERROR | خطای دسترسی |
| NOT_FOUND | یافت نشد |
| DUPLICATE_ENTRY | رکورد تکراری |
| PAYMENT_ERROR | خطای پرداخت |
| AI_ERROR | خطای هوش مصنوعی |
| IOT_ERROR | خطای IoT |

---

## نرخ محدودیت (Rate Limiting)

- **عمومی**: 100 درخواست در دقیقه
- **احراز هویت**: 5 درخواست در دقیقه
- **API های IoT**: 1000 درخواست در دقیقه
- **API های پرداخت**: 10 درخواست در دقیقه

---

## نسخه‌بندی

API از نسخه‌بندی URL استفاده می‌کند:
- `/api/v1/*` - نسخه فعلی
- نسخه‌های آینده: `/api/v2/*`

---

**آخرین به‌روزرسانی**: 2025-01-15

