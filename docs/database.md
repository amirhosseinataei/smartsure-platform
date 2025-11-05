# مستندات پایگاه داده - بیمه‌یار هوشمند (SmartSure)

## فهرست مطالب
1. [معرفی](#معرفی)
2. [نمودار ERD](#نمودار-erd)
3. [جداول اصلی](#جداول-اصلی)
4. [رابطه‌ها](#رابطه-ها)
5. [Indexes](#indexes)
6. [Stored Procedures](#stored-procedures)
7. [Triggers](#triggers)
8. [Views](#views)
9. [Backup و Recovery](#backup-و-recovery)

---

## معرفی

پایگاه داده SmartSure از **SQL Server** استفاده می‌کند و شامل جداول اصلی برای مدیریت کاربران، بیمه‌نامه‌ها، IoT، خسارت‌ها، پرداخت‌ها و هوش مصنوعی است.

---

## نمودار ERD

نمودار کامل ERD در فایل `diagrams/erd/` موجود است.

---

## جداول اصلی

### 1. users

جدول اصلی کاربران سیستم.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY(1, 1),
  username NVARCHAR(255) UNIQUE NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'operator', 'customer', 'partner', 'analyst')),
  fullname NVARCHAR(255),
  phone NVARCHAR(50),
  email NVARCHAR(255) UNIQUE,
  address TEXT,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  last_login DATETIME2
);
```

**Indexes**:
- `idx_users_username`: ON users(username)
- `idx_users_email`: ON users(email)
- `idx_users_role`: ON users(role)

### 2. customers

اطلاعات مشتریان.

```sql
CREATE TABLE customers (
  id INT PRIMARY KEY IDENTITY(1, 1),
  user_id INT UNIQUE NOT NULL,
  national_id NVARCHAR(50) UNIQUE,
  birthdate DATE,
  gender NVARCHAR(10),
  occupation NVARCHAR(255),
  risk_profile NVARCHAR(50),
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. partners

اطلاعات شرکا (پزشک، داروخانه، تعمیرگاه).

```sql
CREATE TABLE partners (
  id INT PRIMARY KEY IDENTITY(1, 1),
  user_id INT UNIQUE NOT NULL,
  partner_type NVARCHAR(50) NOT NULL CHECK (partner_type IN ('doctor', 'pharmacy', 'mechanic', 'supplier', 'hospital', 'logistics')),
  license_number NVARCHAR(255) UNIQUE,
  organization_name NVARCHAR(255),
  address TEXT,
  verified BIT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. policies

بیمه‌نامه‌ها.

```sql
CREATE TABLE policies (
  id INT PRIMARY KEY IDENTITY(1, 1),
  policy_number NVARCHAR(255) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  insurance_type NVARCHAR(50) NOT NULL CHECK (insurance_type IN ('vehicle', 'home', 'health', 'cargo')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  premium_amount DECIMAL(12,2) NOT NULL,
  dynamic_premium BIT DEFAULT 0,
  risk_level NVARCHAR(50) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  iot_enabled BIT DEFAULT 1,
  policy_status NVARCHAR(50) NOT NULL CHECK (policy_status IN ('active', 'expired', 'canceled', 'pending_activation')) DEFAULT 'active',
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**Indexes**:
- `idx_policies_customer`: ON policies(customer_id)
- `idx_policies_status`: ON policies(policy_status)
- `idx_policies_type`: ON policies(insurance_type)

### 5. iot_devices

دستگاه‌های IoT.

```sql
CREATE TABLE iot_devices (
  id INT PRIMARY KEY IDENTITY(1, 1),
  device_uid NVARCHAR(255) UNIQUE NOT NULL,
  policy_id INT NOT NULL,
  type NVARCHAR(50) NOT NULL CHECK (type IN ('temperature', 'humidity', 'gas', 'smoke', 'motion', 'gps', 'obd', 'camera', 'wearable', 'vibration', 'shock', 'pulse', 'oxygen')),
  manufacturer NVARCHAR(255),
  model NVARCHAR(255),
  firmware_version NVARCHAR(50),
  connection_protocol NVARCHAR(50),
  status NVARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'fault', 'disconnected')) DEFAULT 'active',
  last_heartbeat DATETIME2,
  location NVARCHAR(255),
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  FOREIGN KEY (policy_id) REFERENCES policies(id)
);
```

**Indexes**:
- `idx_iot_devices_policy`: ON iot_devices(policy_id)
- `idx_iot_devices_uid`: ON iot_devices(device_uid)
- `idx_iot_devices_status`: ON iot_devices(status)

### 6. sensor_data

داده‌های حسگر (Time-Series).

```sql
CREATE TABLE sensor_data (
  id BIGINT PRIMARY KEY IDENTITY(1, 1),
  device_id INT NOT NULL,
  timestamp DATETIME2 NOT NULL,
  metric NVARCHAR(255) NOT NULL,
  value FLOAT NOT NULL,
  unit NVARCHAR(50),
  anomaly_flag BIT DEFAULT 0,
  processed BIT DEFAULT 0,
  FOREIGN KEY (device_id) REFERENCES iot_devices(id)
);
```

**Indexes**:
- `idx_sensor_data_device_time`: ON sensor_data(device_id, timestamp DESC)
- `idx_sensor_data_metric`: ON sensor_data(metric)
- `idx_sensor_data_anomaly`: ON sensor_data(anomaly_flag) WHERE anomaly_flag = 1

**نکته**: برای داده‌های حجیم، می‌توان از Partitioning استفاده کرد.

### 7. incidents

حوادث.

```sql
CREATE TABLE incidents (
  id INT PRIMARY KEY IDENTITY(1, 1),
  policy_id INT NOT NULL,
  device_id INT,
  incident_type NVARCHAR(50) NOT NULL CHECK (incident_type IN ('fire', 'crash', 'leak', 'theft', 'health_event', 'damage', 'flood', 'burglary', 'medical_emergency', 'cargo_spoilage')),
  detected_time DATETIME2 NOT NULL,
  severity NVARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  auto_detected BIT DEFAULT 0,
  verified BIT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (device_id) REFERENCES iot_devices(id)
);
```

### 8. claims

ادعاهای خسارت.

```sql
CREATE TABLE claims (
  id INT PRIMARY KEY IDENTITY(1, 1),
  policy_id INT NOT NULL,
  incident_id INT,
  claim_number NVARCHAR(255) UNIQUE NOT NULL,
  submitted_by INT NOT NULL,
  submitted_at DATETIME2 DEFAULT GETDATE(),
  status NVARCHAR(50) NOT NULL CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'auto_paid', 'disputed')) DEFAULT 'pending',
  claim_amount DECIMAL(12,2),
  approved_amount DECIMAL(12,2),
  assessment_notes TEXT,
  reviewed_by INT,
  ai_estimated_cost DECIMAL(12,2),
  auto_approved BIT DEFAULT 0,
  fraud_score DECIMAL(5,2),
  payout_reference NVARCHAR(255),
  updated_at DATETIME2,
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (incident_id) REFERENCES incidents(id),
  FOREIGN KEY (submitted_by) REFERENCES customers(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

**Indexes**:
- `idx_claims_policy`: ON claims(policy_id)
- `idx_claims_status`: ON claims(status)
- `idx_claims_submitted`: ON claims(submitted_by)
- `idx_claims_number`: ON claims(claim_number)

### 9. payments

پرداخت‌ها.

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY IDENTITY(1, 1),
  claim_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method NVARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'online', 'auto_deduct')),
  paid_at DATETIME2 DEFAULT GETDATE(),
  transaction_id NVARCHAR(255) UNIQUE,
  status NVARCHAR(50) DEFAULT 'completed',
  processor NVARCHAR(255),
  updated_at DATETIME2,
  FOREIGN KEY (claim_id) REFERENCES claims(id)
);
```

### 10. ai_models

مدل‌های هوش مصنوعی.

```sql
CREATE TABLE ai_models (
  id INT PRIMARY KEY IDENTITY(1, 1),
  name NVARCHAR(255) NOT NULL,
  type NVARCHAR(100) NOT NULL,
  version NVARCHAR(50),
  deployed_at DATETIME2 DEFAULT GETDATE(),
  accuracy DECIMAL(5,2),
  active BIT DEFAULT 1,
  description TEXT,
  updated_at DATETIME2
);
```

### 11. ai_inferences

نتیجه اجرای مدل‌های AI.

```sql
CREATE TABLE ai_inferences (
  id BIGINT PRIMARY KEY IDENTITY(1, 1),
  model_id INT NOT NULL,
  claim_id INT,
  incident_id INT,
  input_reference NVARCHAR(255),
  output_json TEXT,
  confidence DECIMAL(5,2),
  executed_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  FOREIGN KEY (model_id) REFERENCES ai_models(id),
  FOREIGN KEY (claim_id) REFERENCES claims(id),
  FOREIGN KEY (incident_id) REFERENCES incidents(id)
);
```

### 12. fraud_alerts

هشدارهای تقلب.

```sql
CREATE TABLE fraud_alerts (
  id INT PRIMARY KEY IDENTITY(1, 1),
  claim_id INT NOT NULL,
  alert_time DATETIME2 DEFAULT GETDATE(),
  severity NVARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details TEXT,
  resolved BIT DEFAULT 0,
  resolved_by INT,
  resolved_at DATETIME2,
  FOREIGN KEY (claim_id) REFERENCES claims(id),
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);
```

### 13. documents

مستندات.

```sql
CREATE TABLE documents (
  id INT PRIMARY KEY IDENTITY(1, 1),
  claim_id INT,
  customer_id INT,
  partner_id INT,
  file_path NVARCHAR(500) NOT NULL,
  file_type NVARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'pdf', 'video', 'report', 'prescription', 'invoice', 'medical_record')),
  uploaded_at DATETIME2 DEFAULT GETDATE(),
  hash NVARCHAR(255),
  digital_signature NVARCHAR(500),
  verified BIT DEFAULT 0,
  location NVARCHAR(255),
  updated_at DATETIME2,
  FOREIGN KEY (claim_id) REFERENCES claims(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);
```

### 14. notifications

اعلان‌ها.

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY IDENTITY(1, 1),
  user_id INT NOT NULL,
  title NVARCHAR(255),
  message TEXT,
  type NVARCHAR(50) NOT NULL CHECK (type IN ('alert', 'info', 'reminder', 'warning', 'promotion')),
  read BIT DEFAULT 0,
  sent_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Indexes**:
- `idx_notifications_user`: ON notifications(user_id, read, sent_at DESC)

### 15. audit_logs

لاگ‌های Audit.

```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY IDENTITY(1, 1),
  user_id INT,
  action NVARCHAR(255) NOT NULL,
  entity NVARCHAR(100),
  entity_id INT,
  timestamp DATETIME2 DEFAULT GETDATE(),
  ip_address NVARCHAR(50),
  details TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Indexes**:
- `idx_audit_logs_user`: ON audit_logs(user_id, timestamp DESC)
- `idx_audit_logs_entity`: ON audit_logs(entity, entity_id)

### 16. settings

تنظیمات سیستم.

```sql
CREATE TABLE settings (
  key NVARCHAR(255) PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at DATETIME2
);
```

---

## رابطه‌ها

### روابط اصلی

1. **users → customers** (1:1)
2. **users → partners** (1:1)
3. **customers → policies** (1:N)
4. **policies → iot_devices** (1:N)
5. **iot_devices → sensor_data** (1:N)
6. **policies → incidents** (1:N)
7. **incidents → claims** (1:N)
8. **claims → payments** (1:N)
9. **claims → documents** (1:N)
10. **ai_models → ai_inferences** (1:N)
11. **claims → ai_inferences** (1:N)
12. **claims → fraud_alerts** (1:N)

---

## Indexes

### Indexes برای Performance

```sql
-- Composite indexes برای جستجوهای ترکیبی
CREATE INDEX idx_claims_policy_status ON claims(policy_id, status);
CREATE INDEX idx_sensor_data_device_metric_time ON sensor_data(device_id, metric, timestamp DESC);
CREATE INDEX idx_incidents_policy_type ON incidents(policy_id, incident_type);
```

### Indexes برای Unique Constraints

تمام فیلدهای `UNIQUE` به صورت خودکار Index می‌شوند.

---

## Stored Procedures

### SP_CalculateDynamicPremium

محاسبه حق بیمه پویا بر اساس رفتار.

```sql
CREATE PROCEDURE SP_CalculateDynamicPremium
  @PolicyId INT,
  @RiskScore DECIMAL(5,2),
  @BehaviorScore DECIMAL(5,2)
AS
BEGIN
  DECLARE @BasePremium DECIMAL(12,2);
  DECLARE @NewPremium DECIMAL(12,2);
  
  SELECT @BasePremium = premium_amount FROM policies WHERE id = @PolicyId;
  
  SET @NewPremium = @BasePremium * (1 + (@RiskScore - 0.5) * 0.2) * (1 + (@BehaviorScore - 0.5) * 0.1);
  
  UPDATE policies 
  SET premium_amount = @NewPremium, updated_at = GETDATE()
  WHERE id = @PolicyId;
  
  SELECT @NewPremium AS new_premium;
END;
```

---

## Triggers

### TR_UpdatePolicyUpdatedAt

به‌روزرسانی خودکار `updated_at` در policies.

```sql
CREATE TRIGGER TR_UpdatePolicyUpdatedAt
ON policies
AFTER UPDATE
AS
BEGIN
  UPDATE policies
  SET updated_at = GETDATE()
  WHERE id IN (SELECT id FROM inserted);
END;
```

### TR_LogClaimStatusChange

ثبت تغییر وضعیت خسارت در Audit Log.

```sql
CREATE TRIGGER TR_LogClaimStatusChange
ON claims
AFTER UPDATE
AS
BEGIN
  IF UPDATE(status)
  BEGIN
    INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
    SELECT 
      reviewed_by,
      'claim_status_changed',
      'claims',
      id,
      'Status changed from ' + ISNULL(CAST(d.status AS NVARCHAR), 'NULL') + ' to ' + CAST(i.status AS NVARCHAR)
    FROM inserted i
    LEFT JOIN deleted d ON i.id = d.id
    WHERE i.status <> ISNULL(d.status, '');
  END
END;
```

---

## Views

### V_ActivePolicies

نمایش بیمه‌نامه‌های فعال.

```sql
CREATE VIEW V_ActivePolicies AS
SELECT 
  p.id,
  p.policy_number,
  c.fullname AS customer_name,
  p.insurance_type,
  p.start_date,
  p.end_date,
  p.premium_amount,
  p.risk_level,
  p.policy_status
FROM policies p
INNER JOIN customers c ON p.customer_id = c.id
WHERE p.policy_status = 'active' AND p.end_date >= GETDATE();
```

### V_ClaimSummary

خلاصه خسارت‌ها.

```sql
CREATE VIEW V_ClaimSummary AS
SELECT 
  c.id,
  c.claim_number,
  p.policy_number,
  c.status,
  c.claim_amount,
  c.approved_amount,
  c.fraud_score,
  c.submitted_at,
  u.fullname AS reviewed_by_name
FROM claims c
INNER JOIN policies p ON c.policy_id = p.id
LEFT JOIN users u ON c.reviewed_by = u.id;
```

---

## Backup و Recovery

### Backup Strategy

1. **Full Backup**: روزانه در ساعت 2 صبح
2. **Differential Backup**: هر 6 ساعت
3. **Transaction Log Backup**: هر 15 دقیقه

### Recovery Strategy

- **RTO (Recovery Time Objective)**: < 4 ساعت
- **RPO (Recovery Point Objective)**: < 1 ساعت

### Retention Policy

- Full Backups: 30 روز
- Differential Backups: 7 روز
- Transaction Logs: 24 ساعت

---

**آخرین به‌روزرسانی**: 2025-01-15

