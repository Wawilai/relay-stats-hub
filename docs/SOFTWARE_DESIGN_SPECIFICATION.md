# Software Design Specification (SDS)
## Email Tracking and Monitoring System

**เวอร์ชัน:** 1.0  
**วันที่:** 15 ตุลาคม 2025  
**ผู้จัดทำ:** Development Team

---

## สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [สถาปัตยกรรมระบบ](#2-สถาปัตยกรรมระบบ)
3. [การออกแบบฐานข้อมูล](#3-การออกแบบฐานข้อมูล)
4. [API Endpoints](#4-api-endpoints)
5. [คิวรี่ SQL](#5-คิวรี่-sql)
6. [User Interface Specifications](#6-user-interface-specifications)
7. [Security Requirements](#7-security-requirements)
8. [Performance Requirements](#8-performance-requirements)

---

## 1. ภาพรวมระบบ

### 1.1 วัตถุประสงค์
ระบบติดตามและรายงานการส่งอีเมลที่ให้ผู้ใช้สามารถ:
- ตรวจสอบสถิติการส่งอีเมลแบบเรียลไทม์
- ดูรายงานการส่งอีเมลแยกตามโดเมน
- ติดตามประวัติการส่งอีเมล
- วิเคราะห์สาเหตุที่อีเมลส่งไม่สำเร็จ
- Export ข้อมูลเป็นไฟล์ Excel

### 1.2 ฟีเจอร์หลัก
1. **Dashboard** - แสดง KPI และสถิติการส่งอีเมล
2. **Summary Report** - รายงานสรุปแยกตามโดเมนและวันที่
3. **Activity Log** - ประวัติการส่งอีเมลทั้งหมด
4. **Detailed Reports** - รายละเอียดรายการที่ส่งไม่สำเร็จ
5. **Data Export** - ส่งออกข้อมูลเป็น Excel

---

## 2. สถาปัตยกรรมระบบ

### 2.1 Technology Stack

#### Frontend
- **Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Charts:** Recharts
- **Date Handling:** date-fns
- **State Management:** TanStack Query
- **Routing:** React Router v6

#### Backend (แนะนำ)
- **Database:** PostgreSQL 14+
- **API:** RESTful API หรือ GraphQL
- **Authentication:** JWT + OAuth 2.0
- **File Storage:** S3-compatible storage
- **Caching:** Redis

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  (React + TypeScript + Tailwind CSS)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS / REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API Gateway                             │
│  (Authentication, Rate Limiting, Load Balancing)        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼────────────┐
│  Application     │    │   Background Jobs   │
│  Server          │    │   (Email Queue)     │
│  (Business Logic)│    │                     │
└───────┬──────────┘    └────────┬────────────┘
        │                        │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼────────────┐
│   PostgreSQL     │    │      Redis          │
│   Database       │    │   (Cache/Queue)     │
└──────────────────┘    └─────────────────────┘
```

---

## 3. การออกแบบฐานข้อมูล

### 3.1 Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│   email_activities      │
├─────────────────────────┤
│ id (PK)                 │
│ user_id (FK)            │
│ sender_email            │
│ sent_at                 │
│ status                  │◄─────────┐
│ total_recipients        │          │
│ success_count           │          │
│ failed_count            │          │
│ metadata                │          │
│ created_at              │          │
└────────┬────────────────┘          │
         │                           │ 1:N
         │ 1:N                       │
         │                           │
┌────────▼──────────────────┐ ┌──────┴──────────────────┐
│  email_recipients         │ │  email_failures         │
├───────────────────────────┤ ├─────────────────────────┤
│ id (PK)                   │ │ id (PK)                 │
│ activity_id (FK)          │ │ activity_id (FK)        │
│ recipient_email           │ │ recipient_email         │
│ domain                    │ │ failure_reason          │
│ status                    │ │ failure_type            │
│ delivered_at              │ │ error_code              │
│ opened_at                 │ │ occurred_at             │
│ clicked_at                │ │ metadata                │
└───────────────────────────┘ └─────────────────────────┘

┌─────────────────────────┐
│  daily_report_summary   │
├─────────────────────────┤
│ id (PK)                 │
│ report_date             │
│ domain                  │
│ success_count           │
│ block_count             │
│ reject_count            │
│ total_sent              │
│ created_at              │
└─────────────────────────┘
```

### 3.2 Database Schema

#### 3.2.1 Table: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 3.2.2 Table: email_activities
```sql
CREATE TYPE email_status AS ENUM ('success', 'block', 'reject', 'pending', 'processing');

CREATE TABLE email_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_email VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status email_status NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    block_count INTEGER NOT NULL DEFAULT 0,
    reject_count INTEGER NOT NULL DEFAULT 0,
    subject TEXT,
    campaign_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_activities_user_id ON email_activities(user_id);
CREATE INDEX idx_email_activities_sender ON email_activities(sender_email);
CREATE INDEX idx_email_activities_sent_at ON email_activities(sent_at);
CREATE INDEX idx_email_activities_status ON email_activities(status);
CREATE INDEX idx_email_activities_campaign ON email_activities(campaign_id);
```

#### 3.2.3 Table: email_recipients
```sql
CREATE TABLE email_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES email_activities(id) ON DELETE CASCADE NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    status email_status NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_recipients_activity ON email_recipients(activity_id);
CREATE INDEX idx_email_recipients_email ON email_recipients(recipient_email);
CREATE INDEX idx_email_recipients_domain ON email_recipients(domain);
CREATE INDEX idx_email_recipients_status ON email_recipients(status);
```

#### 3.2.4 Table: email_failures
```sql
CREATE TYPE failure_type AS ENUM ('spam', 'bounce', 'block', 'reject', 'timeout', 'other');

CREATE TABLE email_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES email_activities(id) ON DELETE CASCADE NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    failure_reason TEXT NOT NULL,
    failure_type failure_type NOT NULL,
    error_code VARCHAR(50),
    smtp_response TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_email_failures_activity ON email_failures(activity_id);
CREATE INDEX idx_email_failures_type ON email_failures(failure_type);
CREATE INDEX idx_email_failures_email ON email_failures(recipient_email);
CREATE INDEX idx_email_failures_occurred ON email_failures(occurred_at);
```

#### 3.2.5 Table: daily_report_summary
```sql
CREATE TABLE daily_report_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    success_count INTEGER NOT NULL DEFAULT 0,
    block_count INTEGER NOT NULL DEFAULT 0,
    reject_count INTEGER NOT NULL DEFAULT 0,
    total_sent INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_date, domain)
);

CREATE INDEX idx_daily_report_date ON daily_report_summary(report_date);
CREATE INDEX idx_daily_report_domain ON daily_report_summary(domain);
```

### 3.3 Database Functions

#### 3.3.1 Calculate Success Rate
```sql
CREATE OR REPLACE FUNCTION calculate_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    NEW.success_rate := CASE 
        WHEN NEW.total_sent > 0 THEN 
            ROUND((NEW.success_count::DECIMAL / NEW.total_sent::DECIMAL) * 100, 2)
        ELSE 0 
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_success_rate
BEFORE INSERT OR UPDATE ON daily_report_summary
FOR EACH ROW
EXECUTE FUNCTION calculate_success_rate();
```

#### 3.3.2 Update Activity Counts
```sql
CREATE OR REPLACE FUNCTION update_activity_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE email_activities
    SET 
        success_count = (SELECT COUNT(*) FROM email_recipients WHERE activity_id = NEW.activity_id AND status = 'success'),
        failed_count = (SELECT COUNT(*) FROM email_failures WHERE activity_id = NEW.activity_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.activity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_activity_counts
AFTER INSERT ON email_failures
FOR EACH ROW
EXECUTE FUNCTION update_activity_counts();
```

---

## 4. API Endpoints

### 4.1 Authentication APIs

#### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### 4.2 Dashboard APIs

#### GET /api/dashboard/kpis
**Description:** ดึงข้อมูล KPI สำหรับ Dashboard

**Query Parameters:**
- `start_date` (required): วันที่เริ่มต้น (YYYY-MM-DD)
- `end_date` (required): วันที่สิ้นสุด (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_sent": 125430,
    "success_rate": 89.5,
    "blocked_count": 8934,
    "rejected_count": 4621,
    "top_failure_reasons": [
      {
        "reason": "Spam filter",
        "count": 3456,
        "percentage": 38.7
      }
    ]
  }
}
```

#### GET /api/dashboard/email-distribution
**Description:** ดึงข้อมูลการกระจายอีเมลตามเวลา

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "hour": "00:00",
      "sent": 1234,
      "success": 1100,
      "failed": 134
    }
  ]
}
```

### 4.3 Report APIs

#### GET /api/reports/summary
**Description:** ดึงรายงานสรุปการส่งอีเมล

**Query Parameters:**
- `start_date` (required): วันที่เริ่มต้น (YYYY-MM-DD)
- `end_date` (required): วันที่สิ้นสุด (YYYY-MM-DD)
- `start_time` (optional): เวลาเริ่มต้น (HH:mm)
- `end_time` (optional): เวลาสิ้นสุด (HH:mm)
- `filter_type` (optional): day|week|month
- `page` (optional): หน้าที่ต้องการ (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "date": "2025-01-15",
        "domain": "gmail.com",
        "success": 2345,
        "block": 45,
        "reject": 12,
        "total": 2402
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "per_page": 10
    }
  }
}
```

#### GET /api/reports/details
**Description:** ดึงรายละเอียดรายการบล็อก

**Query Parameters:**
- `date` (required): วันที่
- `domain` (required): โดเมน
- `page` (optional): หน้าที่ต้องการ
- `limit` (optional): จำนวนรายการต่อหน้า (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "date": "2025-01-15",
      "domain": "gmail.com",
      "total_blocked": 45
    },
    "items": [
      {
        "email": "user1@gmail.com",
        "reason": "Spam filter",
        "occurred_at": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45,
      "per_page": 20
    }
  }
}
```

### 4.4 Activity APIs

#### GET /api/activities
**Description:** ดึงประวัติการส่งอีเมล

**Query Parameters:**
- `start_date` (optional): วันที่เริ่มต้น
- `end_date` (optional): วันที่สิ้นสุด
- `sender_email` (optional): กรองตามผู้ส่ง
- `receiver_email` (optional): กรองตามผู้รับ
- `status` (optional): กรองตามสถานะ
- `page` (optional): หน้าที่ต้องการ
- `limit` (optional): จำนวนรายการต่อหน้า (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "date": "2025-01-15 14:23:45",
        "sender": "admin@company.com",
        "status": "success",
        "total": 150,
        "failed": 0,
        "success": 150
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 100,
      "per_page": 10
    }
  }
}
```

#### GET /api/activities/:id/failures
**Description:** ดึงรายละเอียดรายการที่ส่งไม่สำเร็จ

**Query Parameters:**
- `page` (optional): หน้าที่ต้องการ
- `limit` (optional): จำนวนรายการต่อหน้า (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "uuid",
      "date": "2025-01-15 13:15:22",
      "sender": "marketing@company.com",
      "status": "block",
      "total_failed": 320
    },
    "failures": [
      {
        "email": "user1@domain.com",
        "reason": "Blocked by spam filter",
        "failure_type": "spam",
        "occurred_at": "2025-01-15T13:15:30Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 16,
      "total_items": 320,
      "per_page": 20
    }
  }
}
```

### 4.5 Export APIs

#### POST /api/export/summary
**Description:** ส่งออกรายงานสรุปเป็น Excel

**Request Body:**
```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "format": "xlsx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "https://api.example.com/downloads/report-123.xlsx",
    "expires_at": "2025-01-15T15:00:00Z"
  }
}
```

---

## 5. คิวรี่ SQL

คิวรี่ทั้งหมดจัดเรียงตามหน้าจอการใช้งาน เพื่อให้ทีมพัฒนาสามารถนำไปใช้งานได้ทันที

---

## 5.1 หน้า Dashboard

### 5.1.1 KPI Cards (ข้อมูลภาพรวม)
```sql
-- แสดงค่า KPI: Sending, Success, Block, Reject
-- ใช้สำหรับ: KPICard components ทั้ง 4 ตัว
SELECT 
    COUNT(*) as total_sending,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as total_success,
    SUM(CASE WHEN status = 'block' THEN 1 ELSE 0 END) as total_block,
    SUM(CASE WHEN status = 'reject' THEN 1 ELSE 0 END) as total_reject,
    ROUND(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as success_rate
FROM email_activities
WHERE sent_date BETWEEN $1 AND $2;
```

**Parameters:**
- `$1`: วันที่เริ่มต้น (YYYY-MM-DD)
- `$2`: วันที่สิ้นสุด (YYYY-MM-DD)

**Response:**
```json
{
  "total_sending": 15234,
  "total_success": 14567,
  "total_block": 423,
  "total_reject": 244,
  "success_rate": 95.62
}
```

---

### 5.1.2 Email Distribution Chart (Bar Chart)
```sql
-- มุมมองรายสัปดาห์ (7 วันล่าสุด)
-- ใช้สำหรับ: EmailChart component เมื่อเลือกโหมด "weekly"
SELECT 
    DATE(sent_date) as date,
    TO_CHAR(sent_date, 'Dy') as day_name, -- แปลงเป็นภาษาไทยที่ Frontend
    COUNT(*) as sending,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
    SUM(CASE WHEN status = 'block' THEN 1 ELSE 0 END) as block,
    SUM(CASE WHEN status = 'reject' THEN 1 ELSE 0 END) as reject
FROM email_activities
WHERE sent_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(sent_date), TO_CHAR(sent_date, 'Dy')
ORDER BY date;
```

```sql
-- มุมมองรายเดือน (4 สัปดาห์ล่าสุด)
-- ใช้สำหรับ: EmailChart component เมื่อเลือกโหมด "monthly"
SELECT 
    DATE_TRUNC('week', sent_date) as week_start,
    'สัปดาห์ ' || EXTRACT(WEEK FROM sent_date) as week_label,
    COUNT(*) as sending,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
    SUM(CASE WHEN status = 'block' THEN 1 ELSE 0 END) as block,
    SUM(CASE WHEN status = 'reject' THEN 1 ELSE 0 END) as reject
FROM email_activities
WHERE sent_date >= CURRENT_DATE - INTERVAL '4 weeks'
GROUP BY DATE_TRUNC('week', sent_date), EXTRACT(WEEK FROM sent_date)
ORDER BY week_start;
```

**Response (Weekly):**
```json
[
  { "date": "2025-10-08", "day_name": "จ", "sending": 2100, "success": 2000, "block": 60, "reject": 40 },
  { "date": "2025-10-09", "day_name": "อ", "sending": 2300, "success": 2200, "block": 65, "reject": 35 }
]
```

---

### 5.1.3 Time Distribution Chart (Line Chart)
```sql
-- แสดงการกระจายของการส่งอีเมลตามช่วงเวลา (แบ่งทุก 3 ชั่วโมง)
-- ใช้สำหรับ: TimeDistributionChart component
SELECT 
    CASE 
        WHEN EXTRACT(HOUR FROM sent_date) BETWEEN 0 AND 2 THEN '00:00-03:00'
        WHEN EXTRACT(HOUR FROM sent_date) BETWEEN 3 AND 5 THEN '03:00-06:00'
        WHEN EXTRACT(HOUR FROM sent_date) BETWEEN 6 AND 8 THEN '06:00-09:00'
        WHEN EXTRACT(HOUR FROM sent_date) BETWEEN 9 AND 11 THEN '09:00-12:00'
        WHEN EXTRACT(HOUR FROM sent_date) BETWEEN 12 AND 14 THEN '12:00-15:00'
        WHEN EXTRACT(HOUR FROM sent_date) BETWEEN 15 AND 17 THEN '15:00-18:00'
        WHEN EXTRACT(HOUR FROM sent_date) BETWEEN 18 AND 20 THEN '18:00-21:00'
        ELSE '21:00-24:00'
    END as time_range,
    COUNT(*) as count
FROM email_activities
WHERE sent_date BETWEEN $1 AND $2
GROUP BY time_range
ORDER BY MIN(EXTRACT(HOUR FROM sent_date));
```

**Parameters:**
- `$1`: วันที่เริ่มต้น (YYYY-MM-DD HH:MM:SS)
- `$2`: วันที่สิ้นสุด (YYYY-MM-DD HH:MM:SS)

**Response:**
```json
[
  { "time_range": "00:00-03:00", "count": 324 },
  { "time_range": "03:00-06:00", "count": 156 },
  { "time_range": "06:00-09:00", "count": 1823 }
]
```

---

### 5.1.4 Top Failure Reasons Table
```sql
-- แสดง Top 5 domains ที่มีปัญหาการส่งอีเมลมากที่สุด
-- ใช้สำหรับ: TopFailureTable component
SELECT 
    er.recipient_domain as destination,
    COUNT(*) as failures
FROM email_recipients er
JOIN email_activities ea ON er.activity_id = ea.id
WHERE er.status IN ('block', 'reject')
  AND ea.sent_date BETWEEN $1 AND $2
GROUP BY er.recipient_domain
ORDER BY failures DESC
LIMIT 5;
```

**Parameters:**
- `$1`: วันที่เริ่มต้น
- `$2`: วันที่สิ้นสุด

**Response:**
```json
[
  { "destination": "gmail.com", "failures": 145 },
  { "destination": "yahoo.com", "failures": 98 },
  { "destination": "hotmail.com", "failures": 87 }
]
```

---

## 5.2 หน้า Summary Report (Report)

### 5.2.1 Report List with Pagination and Search
```sql
-- แสดงรายการรายงานสรุปรายวัน พร้อม pagination และการค้นหา
-- ใช้สำหรับ: หน้า Report (ตารางรายการรายงาน)
SELECT 
    r.id,
    r.report_date,
    r.total_sending,
    r.total_success,
    r.total_block,
    r.total_reject,
    r.success_rate,
    r.created_at
FROM daily_report_summary r
WHERE 
    ($1::varchar IS NULL OR 
     TO_CHAR(r.report_date, 'YYYY-MM-DD') ILIKE '%' || $1 || '%')
ORDER BY r.report_date DESC
LIMIT $2 OFFSET $3;

-- นับจำนวนรายการทั้งหมดสำหรับ pagination
SELECT COUNT(*) as total
FROM daily_report_summary
WHERE ($1::varchar IS NULL OR 
       TO_CHAR(report_date, 'YYYY-MM-DD') ILIKE '%' || $1 || '%');
```

**Parameters:**
- `$1`: คำค้นหา (optional)
- `$2`: จำนวนรายการต่อหน้า (เช่น 10, 20, 50)
- `$3`: จำนวนรายการที่ข้ามไป (page_size * (page_number - 1))

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "report_date": "2025-10-14",
      "total_sending": 15234,
      "total_success": 14567,
      "total_block": 423,
      "total_reject": 244,
      "success_rate": 95.62,
      "created_at": "2025-10-15T01:00:00Z"
    }
  ],
  "total": 150
}
```

---

## 5.3 หน้า Report Details (ReportDetails)

### 5.3.1 Report Details - Blocked Recipients List
```sql
-- แสดงรายการอีเมลที่ถูก Block ในวันที่เลือก พร้อม pagination
-- ใช้สำหรับ: หน้า ReportDetails (ตารางรายละเอียด)
SELECT 
    er.id,
    er.recipient_email,
    er.recipient_domain,
    er.status,
    er.bounce_type,
    er.bounce_reason,
    ea.sender_email,
    ea.subject,
    ea.sent_date
FROM email_recipients er
JOIN email_activities ea ON er.activity_id = ea.id
WHERE ea.sent_date::date = $1::date
  AND er.status = 'block'
ORDER BY ea.sent_date DESC
LIMIT $2 OFFSET $3;

-- นับจำนวนทั้งหมด
SELECT COUNT(*) as total
FROM email_recipients er
JOIN email_activities ea ON er.activity_id = ea.id
WHERE ea.sent_date::date = $1::date
  AND er.status = 'block';
```

**Parameters:**
- `$1`: วันที่ของรายงาน (YYYY-MM-DD)
- `$2`: จำนวนรายการต่อหน้า
- `$3`: (page_size * (page_number - 1))

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "recipient_email": "user@example.com",
      "recipient_domain": "example.com",
      "status": "block",
      "bounce_type": "hard",
      "bounce_reason": "Mailbox does not exist",
      "sender_email": "noreply@mycompany.com",
      "subject": "Welcome Email",
      "sent_date": "2025-10-14T09:30:00Z"
    }
  ],
  "total": 423
}
```

---

### 5.3.2 Export Report Blocked Recipients (Excel)
```sql
-- ดึงข้อมูลอีเมลที่ถูก Block ทั้งหมดสำหรับ Export เป็น Excel
-- ใช้สำหรับ: ปุ่ม Export บนหน้า ReportDetails
SELECT 
    er.recipient_email as "Email",
    ea.sender_email as "Sender",
    ea.subject as "Subject",
    er.bounce_type as "Bounce Type",
    er.bounce_reason as "Reason",
    TO_CHAR(ea.sent_date, 'YYYY-MM-DD HH24:MI:SS') as "Sent Date"
FROM email_recipients er
JOIN email_activities ea ON er.activity_id = ea.id
WHERE ea.sent_date::date = $1::date
  AND er.status = 'block'
ORDER BY ea.sent_date DESC;
```

---

## 5.4 หน้า Activity (Activity List)

### 5.4.1 Activity List with Filters and Pagination
```sql
-- แสดงรายการ email activities พร้อมการกรอง และ pagination
-- ใช้สำหรับ: หน้า Activity (ตารางกิจกรรม)
SELECT 
    ea.id,
    ea.sender_email,
    ea.subject,
    ea.sent_date,
    ea.status,
    ea.total_recipients,
    ea.success_count,
    ea.failed_count,
    ROUND((ea.success_count::numeric / NULLIF(ea.total_recipients, 0)::numeric * 100), 2) as success_rate
FROM email_activities ea
WHERE 
    ($1::email_status IS NULL OR ea.status = $1)
    AND ($2::varchar IS NULL OR ea.sender_email ILIKE '%' || $2 || '%')
    AND ($3::varchar IS NULL OR ea.subject ILIKE '%' || $3 || '%')
    AND ($4::timestamp IS NULL OR ea.sent_date >= $4)
    AND ($5::timestamp IS NULL OR ea.sent_date <= $5)
ORDER BY ea.sent_date DESC
LIMIT $6 OFFSET $7;

-- นับจำนวนทั้งหมด
SELECT COUNT(*) as total
FROM email_activities ea
WHERE 
    ($1::email_status IS NULL OR ea.status = $1)
    AND ($2::varchar IS NULL OR ea.sender_email ILIKE '%' || $2 || '%')
    AND ($3::varchar IS NULL OR ea.subject ILIKE '%' || $3 || '%')
    AND ($4::timestamp IS NULL OR ea.sent_date >= $4)
    AND ($5::timestamp IS NULL OR ea.sent_date <= $5);
```

**Parameters:**
- `$1`: สถานะ (success, block, reject) - optional
- `$2`: sender email สำหรับค้นหา - optional
- `$3`: หัวข้ออีเมลสำหรับค้นหา - optional
- `$4`: วันที่เริ่มต้น - optional
- `$5`: วันที่สิ้นสุด - optional
- `$6`: จำนวนรายการต่อหน้า
- `$7`: (page_size * (page_number - 1))

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "sender_email": "noreply@mycompany.com",
      "subject": "Welcome Email",
      "sent_date": "2025-10-14T09:30:00Z",
      "status": "success",
      "total_recipients": 100,
      "success_count": 95,
      "failed_count": 5,
      "success_rate": 95.00
    }
  ],
  "total": 1523
}
```

---

## 5.5 หน้า Activity Details (ActivityDetails)

### 5.5.1 Activity Details - Failed Recipients List
```sql
-- แสดงรายการผู้รับที่ล้มเหลว (Block + Reject) สำหรับ activity เดียว
-- ใช้สำหรับ: หน้า ActivityDetails (ตารางรายละเอียดผู้รับที่ล้มเหลว)
SELECT 
    er.id,
    er.recipient_email,
    er.recipient_domain,
    er.status,
    er.bounce_type,
    er.bounce_reason,
    er.sent_at,
    er.bounced_at
FROM email_recipients er
WHERE er.activity_id = $1
  AND er.status IN ('block', 'reject')
ORDER BY er.sent_at DESC
LIMIT $2 OFFSET $3;

-- นับจำนวนทั้งหมด
SELECT COUNT(*) as total
FROM email_recipients er
WHERE er.activity_id = $1
  AND er.status IN ('block', 'reject');
```

**Parameters:**
- `$1`: ID ของ email activity
- `$2`: จำนวนรายการต่อหน้า
- `$3`: (page_size * (page_number - 1))

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "recipient_email": "user@example.com",
      "recipient_domain": "example.com",
      "status": "block",
      "bounce_type": "hard",
      "bounce_reason": "Mailbox does not exist",
      "sent_at": "2025-10-14T09:30:00Z",
      "bounced_at": "2025-10-14T09:30:15Z"
    }
  ],
  "total": 5
}
```

---

### 5.5.2 Export Activity Failed Recipients (Excel)
```sql
-- ดึงข้อมูลผู้รับที่ล้มเหลวทั้งหมดสำหรับ Export เป็น Excel
-- ใช้สำหรับ: ปุ่ม Export บนหน้า ActivityDetails
SELECT 
    er.recipient_email as "Email",
    er.recipient_domain as "Domain",
    CASE er.status
        WHEN 'block' THEN 'Block'
        WHEN 'reject' THEN 'Reject'
    END as "Status",
    er.bounce_type as "Bounce Type",
    er.bounce_reason as "Reason",
    TO_CHAR(er.sent_at, 'YYYY-MM-DD HH24:MI:SS') as "Sent At",
    TO_CHAR(er.bounced_at, 'YYYY-MM-DD HH24:MI:SS') as "Bounced At"
FROM email_recipients er
WHERE er.activity_id = $1
  AND er.status IN ('block', 'reject')
ORDER BY er.sent_at DESC;
```

---

## 5.6 Analytics Queries (เพิ่มเติม)

### 5.6.1 Domain Performance Analysis
```sql
-- วิเคราะห์ประสิทธิภาพการส่งอีเมลแยกตาม Domain ของผู้รับ
SELECT 
    er.recipient_domain,
    COUNT(*) as total_sent,
    SUM(CASE WHEN er.status = 'success' THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN er.status = 'block' THEN 1 ELSE 0 END) as block_count,
    SUM(CASE WHEN er.status = 'reject' THEN 1 ELSE 0 END) as reject_count,
    ROUND(SUM(CASE WHEN er.status = 'success' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as success_rate
FROM email_recipients er
JOIN email_activities ea ON er.activity_id = ea.id
WHERE ea.sent_date BETWEEN $1 AND $2
GROUP BY er.recipient_domain
ORDER BY total_sent DESC;
```

### 5.6.2 Sender Performance Analysis
```sql
-- วิเคราะห์ประสิทธิภาพการส่งอีเมลแยกตาม Sender
SELECT 
    ea.sender_email,
    COUNT(*) as total_activities,
    SUM(ea.total_recipients) as total_recipients,
    SUM(ea.success_count) as total_success,
    SUM(ea.failed_count) as total_failed,
    ROUND(SUM(ea.success_count)::numeric / NULLIF(SUM(ea.total_recipients), 0)::numeric * 100, 2) as success_rate
FROM email_activities ea
WHERE ea.sent_date BETWEEN $1 AND $2
GROUP BY ea.sender_email
ORDER BY total_activities DESC;
```

### 5.6.3 Materialized Views (สำหรับ Performance)

#### 5.5.1 Daily Summary Materialized View
```sql
CREATE MATERIALIZED VIEW mv_daily_email_summary AS
SELECT 
    DATE(ea.sent_at) as report_date,
    er.domain,
    COUNT(DISTINCT ea.id) as total_campaigns,
    COUNT(er.id) as total_sent,
    SUM(CASE WHEN er.status = 'success' THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN er.status = 'block' THEN 1 ELSE 0 END) as block_count,
    SUM(CASE WHEN er.status = 'reject' THEN 1 ELSE 0 END) as reject_count,
    ROUND(
        (SUM(CASE WHEN er.status = 'success' THEN 1 ELSE 0 END)::DECIMAL / COUNT(er.id)::DECIMAL) * 100,
        2
    ) as success_rate
FROM email_activities ea
JOIN email_recipients er ON er.activity_id = ea.id
GROUP BY DATE(ea.sent_at), er.domain;

CREATE INDEX idx_mv_daily_summary_date ON mv_daily_email_summary(report_date);
CREATE INDEX idx_mv_daily_summary_domain ON mv_daily_email_summary(domain);

-- สคริปต์สำหรับ Refresh (ควรรันทุกวัน)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_email_summary;
```

---

## 6. User Interface Specifications

### 6.1 หน้า Dashboard
**Route:** `/`

**Components:**
- KPI Cards (4 cards):
  - Total Sent
  - Success Rate
  - Blocked Count
  - Rejected Count
- Email Distribution Chart (Bar Chart)
- Time Distribution Chart (Line Chart)
- Top Failure Reasons Table

**Filters:**
- Date Range Picker
- Refresh Button

### 6.2 หน้า Summary Report
**Route:** `/report`

**Components:**
- Search Form:
  - Filter Type (Day/Week/Month)
  - Start Date & Time
  - End Date & Time
  - Search Button
- Summary Table:
  - Columns: Date, Domain, Success, Block, Reject, Actions
  - Pagination
  - Export Excel Button
- Detail View Link

### 6.3 หน้า Report Details
**Route:** `/report/details`

**Components:**
- Back Button
- Summary Info
- Blocked Recipients Table:
  - Columns: #, Email, Reason
  - Pagination (20 items per page)
  - Export Excel Button

### 6.4 หน้า Activity
**Route:** `/activity`

**Components:**
- Search Form:
  - Start Date & Time
  - End Date & Time
  - Sender Email
  - Receiver Email
  - Search Button
- Activity Table:
  - Columns: Date, Sender, Status, Total, Failed, Success, Actions
  - Pagination
  - Export Excel Button
- Detail View Link

### 6.5 หน้า Activity Details
**Route:** `/activity/details`

**Components:**
- Back Button
- Activity Summary
- Failed Recipients Table:
  - Columns: #, Email, Reason
  - Pagination (20 items per page)
  - Export Excel Button

---

## 7. Security Requirements

### 7.1 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, User, Viewer)
- Session timeout: 8 hours
- Refresh token mechanism

### 7.2 API Security
- Rate limiting: 100 requests per minute per IP
- CORS configuration
- HTTPS only
- API key rotation every 90 days

### 7.3 Data Security
- Encrypt sensitive data at rest
- Use prepared statements for SQL queries
- Sanitize all user inputs
- Implement SQL injection prevention
- XSS protection

### 7.4 Row Level Security (RLS) Policies

```sql
-- Enable RLS on tables
ALTER TABLE email_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_failures ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own activities" ON email_activities
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Admins can see all data
CREATE POLICY "Admins can view all activities" ON email_activities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
```

### 7.5 Audit Logging
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 8. Performance Requirements

### 8.1 Response Time
- API Response: < 200ms (95th percentile)
- Page Load: < 2 seconds
- Database Queries: < 100ms
- Export Excel: < 5 seconds (for 10,000 records)

### 8.2 Scalability
- Support 10,000+ concurrent users
- Handle 1 million+ email records per day
- Database: Support 100GB+ data
- Horizontal scaling capability

### 8.3 Optimization Strategies

#### 8.3.1 Database Optimization
```sql
-- Partitioning by date
CREATE TABLE email_activities_2025_01 PARTITION OF email_activities
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_ea_sent_at_status 
    ON email_activities(sent_at, status) 
    WHERE status IN ('block', 'reject');

-- Partial index for failed emails
CREATE INDEX CONCURRENTLY idx_ef_recent_failures 
    ON email_failures(occurred_at, failure_type)
    WHERE occurred_at >= CURRENT_DATE - INTERVAL '30 days';
```

#### 8.3.2 Caching Strategy
```
- Cache Layer: Redis
- TTL: 5 minutes for dashboard data
- TTL: 1 hour for reports
- Cache invalidation on data update
```

#### 8.3.3 Query Optimization
```sql
-- Use EXPLAIN ANALYZE to optimize queries
EXPLAIN ANALYZE
SELECT ...;

-- Avoid N+1 queries - use JOINs
-- Use pagination always
-- Limit result sets
```

### 8.4 Monitoring & Alerts

#### Metrics to Monitor:
- API response time
- Database query time
- Error rate
- CPU & Memory usage
- Disk I/O
- Cache hit rate

#### Alerts:
- Response time > 500ms
- Error rate > 1%
- Database connections > 80%
- Disk usage > 85%

---

## 9. Data Migration & ETL

### 9.1 Initial Data Load
```sql
-- Script to load historical data
COPY email_activities FROM '/path/to/activities.csv' 
WITH (FORMAT csv, HEADER true);

-- Validate data
SELECT COUNT(*) FROM email_activities WHERE sent_at IS NULL;
```

### 9.2 Daily ETL Process
```sql
-- Aggregate daily summary (run daily at 00:30)
INSERT INTO daily_report_summary (
    report_date, domain, success_count, block_count, 
    reject_count, total_sent
)
SELECT 
    DATE(ea.sent_at) as report_date,
    er.domain,
    SUM(CASE WHEN er.status = 'success' THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN er.status = 'block' THEN 1 ELSE 0 END) as block_count,
    SUM(CASE WHEN er.status = 'reject' THEN 1 ELSE 0 END) as reject_count,
    COUNT(*) as total_sent
FROM email_activities ea
JOIN email_recipients er ON er.activity_id = ea.id
WHERE DATE(ea.sent_at) = CURRENT_DATE - INTERVAL '1 day'
GROUP BY DATE(ea.sent_at), er.domain
ON CONFLICT (report_date, domain) 
DO UPDATE SET
    success_count = EXCLUDED.success_count,
    block_count = EXCLUDED.block_count,
    reject_count = EXCLUDED.reject_count,
    total_sent = EXCLUDED.total_sent,
    updated_at = CURRENT_TIMESTAMP;
```

---

## 10. Deployment & DevOps

### 10.1 Environment Configuration

#### Development
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/email_tracking_dev
REDIS_URL=redis://localhost:6379
API_BASE_URL=http://localhost:3000
```

#### Production
```env
DATABASE_URL=postgresql://user:pass@prod-db:5432/email_tracking_prod
REDIS_URL=redis://prod-redis:6379
API_BASE_URL=https://api.example.com
```

### 10.2 Backup Strategy
- Full backup: Daily at 02:00 AM
- Incremental backup: Every 6 hours
- Retention: 30 days
- Test restore: Weekly

### 10.3 CI/CD Pipeline
```yaml
# .gitlab-ci.yml or .github/workflows/deploy.yml
stages:
  - test
  - build
  - deploy

test:
  script:
    - npm test
    - npm run lint

build:
  script:
    - docker build -t app:latest .

deploy:
  script:
    - kubectl apply -f k8s/
```

---

## 11. Appendix

### 11.1 Glossary
- **KPI**: Key Performance Indicator
- **RLS**: Row Level Security
- **ETL**: Extract, Transform, Load
- **JWT**: JSON Web Token
- **SMTP**: Simple Mail Transfer Protocol

### 11.2 References
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- React Documentation: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- shadcn/ui: https://ui.shadcn.com/

### 11.3 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-15 | Dev Team | Initial version |

---

## Contact Information

**Development Team**  
Email: dev-team@example.com  
Project Manager: pm@example.com

---

*เอกสารนี้เป็นความลับและใช้เพื่อการพัฒนาระบบเท่านั้น*
