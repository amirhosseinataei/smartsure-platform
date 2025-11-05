CREATE TABLE [users] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [username] nvarchar(255) UNIQUE NOT NULL,
  [password_hash] nvarchar(255) NOT NULL,
  [role] nvarchar(255) NOT NULL CHECK ([role] IN ('admin', 'operator', 'customer', 'partner', 'analyst')) NOT NULL,
  [fullname] nvarchar(255),
  [phone] nvarchar(255),
  [email] nvarchar(255) UNIQUE,
  [address] text,
  [created_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp,
  [last_login] timestamp
)
GO

CREATE TABLE [customers] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [user_id] int UNIQUE NOT NULL,
  [national_id] nvarchar(255) UNIQUE,
  [birthdate] date,
  [gender] nvarchar(255),
  [occupation] nvarchar(255),
  [risk_profile] nvarchar(255),
  [created_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp
)
GO

CREATE TABLE [partners] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [user_id] int UNIQUE NOT NULL,
  [partner_type] nvarchar(255) NOT NULL CHECK ([partner_type] IN ('doctor', 'pharmacy', 'mechanic', 'supplier', 'hospital', 'logistics')) NOT NULL,
  [license_number] nvarchar(255) UNIQUE,
  [organization_name] nvarchar(255),
  [address] text,
  [verified] boolean DEFAULT (false),
  [created_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp
)
GO

CREATE TABLE [policies] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [policy_number] nvarchar(255) UNIQUE NOT NULL,
  [customer_id] int NOT NULL,
  [insurance_type] nvarchar(255) NOT NULL CHECK ([insurance_type] IN ('vehicle', 'home', 'health', 'cargo')) NOT NULL,
  [start_date] date NOT NULL,
  [end_date] date NOT NULL,
  [premium_amount] decimal(12,2) NOT NULL,
  [dynamic_premium] boolean DEFAULT (false),
  [risk_level] nvarchar(255) NOT NULL CHECK ([risk_level] IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  [iot_enabled] boolean DEFAULT (true),
  [policy_status] nvarchar(255) NOT NULL CHECK ([policy_status] IN ('active', 'expired', 'canceled', 'pending_activation')) DEFAULT 'active',
  [created_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp
)
GO

CREATE TABLE [iot_devices] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [device_uid] nvarchar(255) UNIQUE NOT NULL,
  [policy_id] int NOT NULL,
  [type] nvarchar(255) NOT NULL CHECK ([type] IN ('temperature', 'humidity', 'gas', 'smoke', 'motion', 'gps', 'obd', 'camera', 'wearable', 'vibration', 'shock', 'pulse', 'oxygen')) NOT NULL,
  [manufacturer] nvarchar(255),
  [model] nvarchar(255),
  [firmware_version] nvarchar(255),
  [connection_protocol] nvarchar(255),
  [status] nvarchar(255) NOT NULL CHECK ([status] IN ('active', 'inactive', 'fault', 'disconnected')) DEFAULT 'active',
  [last_heartbeat] timestamp,
  [location] nvarchar(255),
  [created_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp
)
GO

CREATE TABLE [sensor_data] (
  [id] bigint PRIMARY KEY IDENTITY(1, 1),
  [device_id] int NOT NULL,
  [timestamp] timestamp NOT NULL,
  [metric] nvarchar(255) NOT NULL,
  [value] double NOT NULL,
  [unit] nvarchar(255),
  [anomaly_flag] boolean DEFAULT (false),
  [processed] boolean DEFAULT (false)
)
GO

CREATE TABLE [incidents] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [policy_id] int NOT NULL,
  [device_id] int,
  [incident_type] nvarchar(255) NOT NULL CHECK ([incident_type] IN ('fire', 'crash', 'leak', 'theft', 'health_event', 'damage', 'flood', 'burglary', 'medical_emergency', 'cargo_spoilage')) NOT NULL,
  [detected_time] timestamp NOT NULL,
  [severity] nvarchar(255) NOT NULL CHECK ([severity] IN ('low', 'medium', 'high', 'critical')),
  [description] text,
  [auto_detected] boolean DEFAULT (false),
  [verified] boolean DEFAULT (false),
  [created_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp
)
GO

CREATE TABLE [claims] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [policy_id] int NOT NULL,
  [incident_id] int,
  [claim_number] nvarchar(255) UNIQUE NOT NULL,
  [submitted_by] int NOT NULL,
  [submitted_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [status] nvarchar(255) NOT NULL CHECK ([status] IN ('pending', 'under_review', 'approved', 'rejected', 'auto_paid', 'disputed')) DEFAULT 'pending',
  [claim_amount] decimal(12,2),
  [approved_amount] decimal(12,2),
  [assessment_notes] text,
  [reviewed_by] int,
  [ai_estimated_cost] decimal(12,2),
  [auto_approved] boolean DEFAULT (false),
  [fraud_score] decimal(5,2),
  [payout_reference] nvarchar(255),
  [updated_at] timestamp
)
GO

CREATE TABLE [payments] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [claim_id] int NOT NULL,
  [amount] decimal(12,2) NOT NULL,
  [method] nvarchar(255) NOT NULL CHECK ([method] IN ('cash', 'card', 'online', 'auto_deduct')) NOT NULL,
  [paid_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [transaction_id] nvarchar(255) UNIQUE,
  [status] nvarchar(255) DEFAULT 'completed',
  [processor] nvarchar(255),
  [updated_at] timestamp
)
GO

CREATE TABLE [ai_models] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [name] nvarchar(255) NOT NULL,
  [type] nvarchar(255) NOT NULL,
  [version] nvarchar(255),
  [deployed_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [accuracy] decimal(5,2),
  [active] boolean DEFAULT (true),
  [description] text,
  [updated_at] timestamp
)
GO

CREATE TABLE [ai_inferences] (
  [id] bigint PRIMARY KEY IDENTITY(1, 1),
  [model_id] int NOT NULL,
  [claim_id] int,
  [incident_id] int,
  [input_reference] nvarchar(255),
  [output_json] text,
  [confidence] decimal(5,2),
  [executed_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp
)
GO

CREATE TABLE [fraud_alerts] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [claim_id] int NOT NULL,
  [alert_time] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [severity] nvarchar(255) NOT NULL CHECK ([severity] IN ('low', 'medium', 'high', 'critical')),
  [details] text,
  [resolved] boolean DEFAULT (false),
  [resolved_by] int,
  [resolved_at] timestamp
)
GO

CREATE TABLE [documents] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [claim_id] int,
  [customer_id] int,
  [partner_id] int,
  [file_path] nvarchar(255) NOT NULL,
  [file_type] nvarchar(255) NOT NULL CHECK ([file_type] IN ('image', 'pdf', 'video', 'report', 'prescription', 'invoice', 'medical_record')) NOT NULL,
  [uploaded_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [hash] nvarchar(255),
  [digital_signature] nvarchar(255),
  [verified] boolean DEFAULT (false),
  [location] nvarchar(255),
  [updated_at] timestamp
)
GO

CREATE TABLE [notifications] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [user_id] int NOT NULL,
  [title] nvarchar(255),
  [message] text,
  [type] nvarchar(255) NOT NULL CHECK ([type] IN ('alert', 'info', 'reminder', 'warning', 'promotion')) NOT NULL,
  [read] boolean DEFAULT (false),
  [sent_at] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [updated_at] timestamp
)
GO

CREATE TABLE [audit_logs] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [user_id] int,
  [action] nvarchar(255) NOT NULL,
  [entity] nvarchar(255),
  [entity_id] int,
  [timestamp] timestamp DEFAULT 'CURRENT_TIMESTAMP',
  [ip_address] nvarchar(255),
  [details] text
)
GO

CREATE TABLE [settings] (
  [key] nvarchar(255) PRIMARY KEY,
  [value] text,
  [description] text,
  [updated_at] timestamp
)
GO

ALTER TABLE [customers] ADD FOREIGN KEY ([user_id]) REFERENCES [users] ([id])
GO

ALTER TABLE [partners] ADD FOREIGN KEY ([user_id]) REFERENCES [users] ([id])
GO

ALTER TABLE [policies] ADD FOREIGN KEY ([customer_id]) REFERENCES [customers] ([id])
GO

ALTER TABLE [iot_devices] ADD FOREIGN KEY ([policy_id]) REFERENCES [policies] ([id])
GO

ALTER TABLE [sensor_data] ADD FOREIGN KEY ([device_id]) REFERENCES [iot_devices] ([id])
GO

ALTER TABLE [incidents] ADD FOREIGN KEY ([policy_id]) REFERENCES [policies] ([id])
GO

ALTER TABLE [incidents] ADD FOREIGN KEY ([device_id]) REFERENCES [iot_devices] ([id])
GO

ALTER TABLE [claims] ADD FOREIGN KEY ([policy_id]) REFERENCES [policies] ([id])
GO

ALTER TABLE [claims] ADD FOREIGN KEY ([incident_id]) REFERENCES [incidents] ([id])
GO

ALTER TABLE [claims] ADD FOREIGN KEY ([submitted_by]) REFERENCES [customers] ([id])
GO

ALTER TABLE [claims] ADD FOREIGN KEY ([reviewed_by]) REFERENCES [users] ([id])
GO

ALTER TABLE [payments] ADD FOREIGN KEY ([claim_id]) REFERENCES [claims] ([id])
GO

ALTER TABLE [ai_inferences] ADD FOREIGN KEY ([model_id]) REFERENCES [ai_models] ([id])
GO

ALTER TABLE [ai_inferences] ADD FOREIGN KEY ([claim_id]) REFERENCES [claims] ([id])
GO

ALTER TABLE [ai_inferences] ADD FOREIGN KEY ([incident_id]) REFERENCES [incidents] ([id])
GO

ALTER TABLE [fraud_alerts] ADD FOREIGN KEY ([claim_id]) REFERENCES [claims] ([id])
GO

ALTER TABLE [fraud_alerts] ADD FOREIGN KEY ([resolved_by]) REFERENCES [users] ([id])
GO

ALTER TABLE [documents] ADD FOREIGN KEY ([claim_id]) REFERENCES [claims] ([id])
GO

ALTER TABLE [documents] ADD FOREIGN KEY ([customer_id]) REFERENCES [customers] ([id])
GO

ALTER TABLE [documents] ADD FOREIGN KEY ([partner_id]) REFERENCES [partners] ([id])
GO

ALTER TABLE [notifications] ADD FOREIGN KEY ([user_id]) REFERENCES [users] ([id])
GO

ALTER TABLE [audit_logs] ADD FOREIGN KEY ([user_id]) REFERENCES [users] ([id])
GO
