# معماری سیستم - بیمه‌یار هوشمند (SmartSure)

## فهرست مطالب
1. [معماری کلی](#معماری-کلی)
2. [لایه‌های معماری](#لایه‌های-معماری)
3. [معماری بک‌اند](#معماری-بک‌اند)
4. [معماری پایگاه داده](#معماری-پایگاه-داده)
5. [معماری امنیت](#معماری-امنیت)
6. [معماری هوش مصنوعی](#معماری-هوش-مصنوعی)
7. [معماری IoT](#معماری-iot)
8. [معماری مقیاس‌پذیری](#معماری-مقیاس‌پذیری)

---

## معماری کلی

SmartSure یک پلتفرم بیمه دیجیتال است که از معماری **Microservices** و **Layered Architecture** استفاده می‌کند.

### نمودار کلی

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  (Mobile App, Web Dashboard, Partner Portal)            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST / WebSocket
┌────────────────────▼────────────────────────────────────┐
│                   API Gateway Layer                      │
│  (Express.js, Rate Limiting, Authentication)             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Application Layer (Backend)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Controllers│  │ Services │  │  Models  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Business Logic Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   AI     │  │ Payment  │  │  IoT     │             │
│  │  Engine  │  │  Gateway │  │ Manager  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Data Access Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   SQL    │  │  Time    │  │  Object  │             │
│  │  Server  │  │  Series  │  │  Storage │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## لایه‌های معماری

### 1. لایه Edge (IoT)

**مسئولیت**: جمع‌آوری داده از حسگرها، پردازش محلی، فیلترسازی

**تکنولوژی‌ها**:
- MQTT/TLS برای ارتباط
- Edge Computing برای پردازش محلی
- OTA برای به‌روزرسانی Firmware

**مزایا**:
- کاهش پهنای باند
- کاهش تأخیر
- حفظ حریم خصوصی

### 2. لایه شبکه

**مسئولیت**: ارتباط امن بین Edge و Cloud

**تکنولوژی‌ها**:
- MQTT over TLS
- NB-IoT / LTE-M
- Wi-Fi

### 3. لایه Cloud (Backend)

**مسئولیت**: پردازش منطق کسب‌وکار، مدیریت داده، اجرای AI

**تکنولوژی‌ها**:
- Node.js + Express.js
- SQL Server
- Redis (Cache)
- RabbitMQ / Kafka (Message Queue)

### 4. لایه اپلیکیشن

**مسئولیت**: رابط کاربری

**تکنولوژی‌ها**:
- React Native (Mobile)
- React.js (Web Dashboard)

---

## معماری بک‌اند

### ساختار دایرکتوری

```
src/backend/
├── config/              # تنظیمات
│   ├── database.js
│   ├── redis.js
│   └── app.js
├── models/              # کلاس‌های Model
│   ├── User.js
│   ├── Policy.js
│   ├── Claim.js
│   └── ...
├── services/            # کلاس‌های Service
│   ├── AuthService.js
│   ├── PolicyService.js
│   ├── ClaimService.js
│   └── ...
├── controllers/         # کلاس‌های Controller
│   ├── AuthController.js
│   ├── PolicyController.js
│   └── ...
├── routers/            # کلاس‌های Router
│   ├── AuthRouter.js
│   ├── PolicyRouter.js
│   └── ...
├── middlewares/        # کلاس‌های Middleware
│   ├── AuthMiddleware.js
│   ├── ValidationMiddleware.js
│   └── ...
├── utils/              # ابزارها
│   ├── Logger.js
│   ├── Encryption.js
│   └── ...
├── validators/         # اعتبارسنجی
│   └── schemas.js
└── app.js              # فایل اصلی
```

### الگوی طراحی

#### 1. Repository Pattern

```javascript
class UserRepository {
  async findById(id) { }
  async create(data) { }
  async update(id, data) { }
  async delete(id) { }
}
```

#### 2. Service Layer Pattern

```javascript
class PolicyService {
  constructor(policyRepository, iotService) {
    this.policyRepository = policyRepository;
    this.iotService = iotService;
  }
  
  async createPolicy(data) {
    // منطق کسب‌وکار
  }
}
```

#### 3. Controller Pattern

```javascript
class PolicyController {
  constructor(policyService) {
    this.policyService = policyService;
  }
  
  async create(req, res) {
    // مدیریت HTTP
  }
}
```

### جریان درخواست

```
Request → Router → Middleware → Controller → Service → Repository → Database
                                                      ↓
Response ← Router ← Middleware ← Controller ← Service ← Repository ← Database
```

---

## معماری پایگاه داده

### SQL Server

**جداول اصلی**:
- `users`, `customers`, `partners`
- `policies`, `iot_devices`, `sensor_data`
- `incidents`, `claims`, `payments`
- `documents`, `notifications`, `audit_logs`
- `ai_models`, `ai_inferences`, `fraud_alerts`

### Indexing Strategy

```sql
-- Indexes برای جستجوی سریع
CREATE INDEX idx_policies_customer ON policies(customer_id);
CREATE INDEX idx_claims_policy ON claims(policy_id);
CREATE INDEX idx_sensor_data_device_time ON sensor_data(device_id, timestamp);
CREATE INDEX idx_claims_status ON claims(status);
```

### Connection Pooling

```javascript
const pool = new sql.ConnectionPool({
  server: 'localhost',
  database: 'smartsure',
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
});
```

---

## معماری امنیت

### 1. احراز هویت

- **JWT Tokens**: برای Session Management
- **Refresh Tokens**: برای تمدید خودکار
- **2FA**: احراز هویت دو مرحله‌ای

### 2. رمزنگاری

- **HTTPS/TLS**: برای ارتباطات
- **bcrypt**: برای Hash کردن رمز عبور
- **AES-256**: برای رمزنگاری داده‌های حساس

### 3. دسترسی

- **Role-Based Access Control (RBAC)**
- **Permission-Based Access Control**

### 4. API Security

- **Rate Limiting**: جلوگیری از حملات DDoS
- **Input Validation**: جلوگیری از SQL Injection, XSS
- **CORS**: مدیریت Cross-Origin

---

## معماری هوش مصنوعی

### Pipeline پردازش

```
Input (Image/Data) 
  → Preprocessing 
  → Model Inference 
  → Post-processing 
  → Result
```

### مدل‌های AI

1. **Damage Estimation Model**
   - نوع: CNN (Convolutional Neural Network)
   - ورودی: تصاویر خسارت
   - خروجی: هزینه تخمینی

2. **Fraud Detection Model**
   - نوع: Anomaly Detection + Correlation Analysis
   - ورودی: داده‌های IoT + مدارک + تاریخچه
   - خروجی: Fraud Score

3. **Risk Prediction Model**
   - نوع: Time-Series Forecasting
   - ورودی: داده‌های تاریخی رفتار
   - خروجی: Risk Score

### استقرار

- **TensorFlow.js**: برای اجرای مدل‌ها در Node.js
- **Model Serving**: API جداگانه برای استقرار مدل‌ها
- **Batch Processing**: پردازش دسته‌ای برای داده‌های بزرگ

---

## معماری IoT

### Architecture Pattern

```
IoT Device → Gateway → MQTT Broker → Backend Service
```

### Components

1. **Device Manager**
   - ثبت دستگاه‌ها
   - مدیریت Firmware (OTA)
   - Health Monitoring

2. **Telemetry Service**
   - دریافت داده‌های حسگر
   - ذخیره در Time-Series DB
   - Real-time Processing

3. **Event Detection**
   - تشخیص ناهنجاری
   - تشخیص حادثه خودکار
   - ارسال هشدار

### Message Queue

- **MQTT Broker**: برای ارتباطات IoT
- **RabbitMQ**: برای پردازش ناهمزمان
- **Kafka**: برای داده‌های حجیم

---

## معماری مقیاس‌پذیری

### Horizontal Scaling

- **Load Balancer**: توزیع بار
- **Multiple Instances**: چند نمونه از بک‌اند
- **Database Replication**: Replication برای SQL Server

### Caching Strategy

- **Redis**: Cache برای داده‌های پرکاربرد
- **Cache Layers**:
  - Application Cache (Memory)
  - Distributed Cache (Redis)
  - Database Query Cache

### Async Processing

- **Message Queue**: برای پردازش‌های طولانی
- **Background Jobs**: برای Task‌های غیرهمزمان
- **Event-Driven**: برای Event Processing

---

## Deployment Architecture

### Production Environment

```
┌─────────────┐
│  Load      │
│  Balancer  │
└─────┬───────┘
      │
  ┌───┴───┬────────┬────────┐
  │       │        │        │
┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐
│App1│ │App2│ │App3│ │App4│
└─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
  │      │      │      │
  └──────┴──────┴──────┘
         │
    ┌────▼────┐
    │  SQL    │
    │  Server │
    │ (Master)│
    └────┬────┘
         │
    ┌────▼────┐
    │  SQL    │
    │  Server │
    │ (Slave) │
    └─────────┘
```

### Containerization

- **Docker**: برای Containerization
- **Docker Compose**: برای Development
- **Kubernetes**: برای Production (اختیاری)

---

## Monitoring & Logging

### Logging

- **Winston**: برای Logging
- **Log Levels**: error, warn, info, debug
- **Centralized Logging**: جمع‌آوری Log‌ها در یک مکان

### Monitoring

- **Health Checks**: بررسی سلامت سرویس
- **Metrics**: Prometheus برای Metrics
- **Alerting**: هشدار برای خطاها

---

## Performance Optimization

### Database

- Connection Pooling
- Query Optimization
- Indexing Strategy
- Caching

### API

- Response Compression (gzip)
- Pagination
- Field Selection
- Rate Limiting

### Code

- Async/Await
- Error Handling
- Memory Management
- Code Splitting

---

**آخرین به‌روزرسانی**: 2025-01-15

