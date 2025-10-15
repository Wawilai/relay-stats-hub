# Software Requirements Specification (SRS)
## Email Tracking and Monitoring System

---

### Document Information
- **Version:** 1.0
- **Date:** October 15, 2025
- **Author:** Development Team
- **Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the Email Tracking and Monitoring System. This document is intended for developers, project managers, testers, and stakeholders involved in the development and maintenance of the system.

### 1.2 Scope
The Email Tracking and Monitoring System is a web-based application designed to track, monitor, and analyze email sending activities. The system provides:
- Real-time email sending statistics and KPIs
- Historical data analysis and reporting
- Failure tracking and analysis
- Domain-specific performance metrics
- Data export capabilities

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS:** Software Requirements Specification
- **KPI:** Key Performance Indicator
- **API:** Application Programming Interface
- **UI:** User Interface
- **RLS:** Row Level Security
- **JWT:** JSON Web Token
- **CSV:** Comma-Separated Values
- **ETL:** Extract, Transform, Load

### 1.4 References
- Software Design Specification Document
- Database Schema Documentation
- API Documentation

### 1.5 Overview
This document is organized into sections covering overall description, specific requirements, system features, external interface requirements, and other non-functional requirements.

---

## 2. Overall Description

### 2.1 Product Perspective
The Email Tracking and Monitoring System is a standalone web application that integrates with email sending infrastructure to collect, store, and analyze email delivery data. The system consists of:
- Frontend web application (React-based)
- Backend API services
- PostgreSQL database
- Background processing services

### 2.2 Product Functions
Major functions include:
1. **Dashboard Analytics**
   - Display real-time KPIs (Total sent, Success rate, Failure count)
   - Visualize email trends over time
   - Show time-based distribution patterns
   - Identify top failure destinations

2. **Summary Reports**
   - Generate daily aggregated reports
   - Filter by date range and domain
   - Export reports to Excel format

3. **Activity Tracking**
   - Log all email sending activities
   - Track individual recipient status
   - Search and filter activities

4. **Failure Analysis**
   - Capture detailed error information
   - Categorize failure types
   - Generate failure reports with recipient details

5. **Data Export**
   - Export data to Excel (XLSX) format
   - Support filtered data export
   - Include detailed recipient information

### 2.3 User Characteristics
Target users include:
- **System Administrators:** Monitor overall system health and performance
- **Email Operations Team:** Analyze sending patterns and troubleshoot issues
- **Business Analysts:** Generate reports and analyze trends
- **Technical Support:** Investigate specific email delivery failures

### 2.4 Constraints
- Must support modern web browsers (Chrome, Firefox, Safari, Edge)
- Must be responsive and work on desktop and tablet devices
- Must handle at least 100,000 email records per day
- Must maintain data for at least 90 days
- Must comply with data privacy regulations

### 2.5 Assumptions and Dependencies
- Email sending infrastructure provides accurate delivery status
- Users have stable internet connection
- Database server has sufficient storage capacity
- Authentication system is properly configured

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 Dashboard (FR-DASH)

**FR-DASH-001: Display KPI Cards**
- **Priority:** High
- **Description:** System shall display three KPI cards showing Total emails, Success count, and Failure count
- **Input:** Date range selection (weekly or last 30 days)
- **Output:** Numerical values with appropriate icons and colors
- **Acceptance Criteria:**
  - Total shows sum of all emails
  - Success shows successfully delivered emails
  - Fail shows failed delivery attempts
  - Values update based on selected time range

**FR-DASH-002: Email Trend Chart**
- **Priority:** High
- **Description:** System shall display line/bar chart showing email trends over time
- **Input:** Date range selection
- **Output:** Chart with date on X-axis and count on Y-axis
- **Acceptance Criteria:**
  - Display separate lines/bars for Total, Success, and Fail
  - Support weekly view (7 days) and 30-day view
  - Chart updates when view mode changes
  - Tooltips show exact values on hover

**FR-DASH-003: Time Distribution Chart**
- **Priority:** Medium
- **Description:** System shall display bar chart showing email distribution across time ranges
- **Input:** Selected date range
- **Output:** Bar chart with 3-hour time ranges
- **Acceptance Criteria:**
  - Group emails into 8 time ranges (3-hour intervals)
  - Display count for each time range
  - Clearly label time ranges in 24-hour format

**FR-DASH-004: Top Failure Destinations Table**
- **Priority:** High
- **Description:** System shall display table of domains with highest failure counts
- **Input:** Selected date range
- **Output:** Table with domain names and failure counts
- **Acceptance Criteria:**
  - Show top 5 domains by failure count
  - Sort in descending order by failures
  - Include domain name and failure count columns

#### 3.1.2 Summary Reports (FR-REPORT)

**FR-REPORT-001: Display Daily Reports List**
- **Priority:** High
- **Description:** System shall display list of daily aggregated email reports
- **Input:** Date range filter, domain filter (optional)
- **Output:** Paginated table of daily reports
- **Acceptance Criteria:**
  - Display date, domain, total, success, and fail columns
  - Support pagination (20 records per page)
  - Allow sorting by date (newest first)
  - Show success rate percentage

**FR-REPORT-002: Filter Reports**
- **Priority:** High
- **Description:** System shall allow filtering reports by date range and domain
- **Input:** Start date, end date, domain name
- **Output:** Filtered report list
- **Acceptance Criteria:**
  - Date range filter is mandatory
  - Domain filter is optional (all domains if empty)
  - Apply filters button triggers filtering
  - Clear indication of active filters

**FR-REPORT-003: View Report Details**
- **Priority:** High
- **Description:** System shall display detailed view of selected report
- **Input:** Report selection
- **Output:** Detailed report page with recipient list
- **Acceptance Criteria:**
  - Display report summary (date, domain, totals)
  - Show list of all recipients with status
  - Include recipient email and status
  - Support pagination for recipient list

**FR-REPORT-004: Export Report to Excel**
- **Priority:** High
- **Description:** System shall allow exporting report data to Excel format
- **Input:** Report selection or filtered list
- **Output:** XLSX file download
- **Acceptance Criteria:**
  - Generate Excel file with report data
  - Include all visible columns
  - Filename includes date/time stamp
  - File downloads automatically

#### 3.1.3 Activity Log (FR-ACTIVITY)

**FR-ACTIVITY-001: Display Activity List**
- **Priority:** High
- **Description:** System shall display list of all email sending activities
- **Input:** Search term, date filter, status filter
- **Output:** Paginated activity list
- **Acceptance Criteria:**
  - Display activity ID, domain, date/time, recipient count, success count, and fail count
  - Support pagination (20 records per page)
  - Sort by date/time (newest first)
  - Show activity status (Success/Fail)

**FR-ACTIVITY-002: Search Activities**
- **Priority:** Medium
- **Description:** System shall allow searching activities by domain or activity ID
- **Input:** Search text
- **Output:** Filtered activity list
- **Acceptance Criteria:**
  - Search matches domain name or activity ID
  - Search is case-insensitive
  - Results update as user types
  - Show "no results" message if applicable

**FR-ACTIVITY-003: Filter Activities**
- **Priority:** Medium
- **Description:** System shall allow filtering activities by date and status
- **Input:** Date range, status (Success/Fail/All)
- **Output:** Filtered activity list
- **Acceptance Criteria:**
  - Support date range selection
  - Support status filtering (Success, Fail, or All)
  - Multiple filters can be applied simultaneously
  - Clear filter option available

**FR-ACTIVITY-004: View Activity Details**
- **Priority:** High
- **Description:** System shall display detailed view of selected activity
- **Input:** Activity selection
- **Output:** Detailed activity page
- **Acceptance Criteria:**
  - Display activity header (ID, domain, timestamp, totals)
  - Show list of all recipients with status
  - For failures, display error type and message
  - Support pagination for recipient list
  - Include recipient email, status, and error details

#### 3.1.4 Data Management (FR-DATA)

**FR-DATA-001: Record Email Activities**
- **Priority:** Critical
- **Description:** System shall record all email sending activities
- **Input:** Email activity data from sending system
- **Output:** Database record
- **Acceptance Criteria:**
  - Capture activity ID, domain, timestamp
  - Record all recipient addresses
  - Store delivery status for each recipient
  - Generate unique activity ID

**FR-DATA-002: Track Recipient Status**
- **Priority:** Critical
- **Description:** System shall track individual recipient delivery status
- **Input:** Recipient email, activity ID, status
- **Output:** Database record
- **Acceptance Criteria:**
  - Record status: Success or Fail
  - Store timestamp of status update
  - Link to parent activity
  - Support status updates

**FR-DATA-003: Log Failure Details**
- **Priority:** High
- **Description:** System shall capture detailed failure information
- **Input:** Recipient ID, error type, error message
- **Output:** Failure record
- **Acceptance Criteria:**
  - Categorize failure type
  - Store error message
  - Store domain of failed delivery
  - Link to recipient record

**FR-DATA-004: Generate Daily Summaries**
- **Priority:** High
- **Description:** System shall automatically generate daily summary reports
- **Input:** Daily email activity data
- **Output:** Daily summary records
- **Acceptance Criteria:**
  - Run daily aggregation job
  - Group by date and domain
  - Calculate total, success, and fail counts
  - Calculate success rate percentage
  - Store in summary table

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements (NFR-PERF)

**NFR-PERF-001: Response Time**
- Dashboard page shall load within 2 seconds
- Report list shall load within 3 seconds
- Activity list shall load within 3 seconds
- Detail pages shall load within 2 seconds
- Search/filter operations shall complete within 1 second

**NFR-PERF-002: Throughput**
- System shall handle 100,000 email records per day
- System shall support 100 concurrent users
- API shall handle 1000 requests per minute

**NFR-PERF-003: Database Performance**
- Database queries shall execute within 500ms for filtered lists
- Aggregation queries shall execute within 2 seconds
- Export operations shall complete within 10 seconds for 10,000 records

#### 3.2.2 Security Requirements (NFR-SEC)

**NFR-SEC-001: Authentication**
- System shall require user authentication for all pages
- Support email/password authentication
- Support JWT token-based authentication
- Session timeout after 24 hours of inactivity

**NFR-SEC-002: Authorization**
- Implement role-based access control
- Users can only access their own data
- Admin role can access all data

**NFR-SEC-003: Data Security**
- Implement Row Level Security (RLS) policies
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Sanitize all user inputs
- Protect against SQL injection

**NFR-SEC-004: API Security**
- Implement rate limiting (1000 requests/minute per user)
- Validate all API inputs
- Return appropriate error messages without exposing system details

#### 3.2.3 Reliability Requirements (NFR-REL)

**NFR-REL-001: Availability**
- System shall be available 99.5% of the time
- Planned maintenance windows shall be scheduled during off-peak hours
- System shall recover from failures within 15 minutes

**NFR-REL-002: Data Integrity**
- System shall maintain data consistency across all tables
- Implement database constraints and triggers
- Validate data before insertion
- Implement transaction management

**NFR-REL-003: Backup and Recovery**
- Daily automated database backups
- Retain backups for 30 days
- Ability to restore from backup within 1 hour
- Test backup/restore procedures monthly

#### 3.2.4 Usability Requirements (NFR-USE)

**NFR-USE-001: User Interface**
- Interface shall be intuitive and easy to navigate
- Consistent design across all pages
- Responsive design for desktop and tablet
- Support Thai language throughout the application

**NFR-USE-002: Accessibility**
- Follow WCAG 2.1 Level AA guidelines
- Support keyboard navigation
- Provide appropriate alt text for images
- Ensure sufficient color contrast

**NFR-USE-003: Learning Curve**
- New users shall be able to navigate basic functions within 15 minutes
- Provide tooltips for complex features
- Include help documentation

#### 3.2.5 Scalability Requirements (NFR-SCALE)

**NFR-SCALE-001: Data Volume**
- System shall handle up to 10 million email records
- Support 100,000 new records per day
- Maintain performance as data grows

**NFR-SCALE-002: User Load**
- Support up to 500 concurrent users
- Maintain response times under increased load
- Implement connection pooling

**NFR-SCALE-003: Horizontal Scaling**
- Architecture shall support horizontal scaling
- Database shall support read replicas
- API servers shall be stateless

#### 3.2.6 Maintainability Requirements (NFR-MAINT)

**NFR-MAINT-001: Code Quality**
- Follow TypeScript and React best practices
- Maintain code coverage above 80%
- Use consistent coding standards
- Document complex business logic

**NFR-MAINT-002: Monitoring**
- Implement application performance monitoring
- Log all errors and exceptions
- Track key business metrics
- Set up alerts for critical issues

**NFR-MAINT-003: Updates**
- Support zero-downtime deployments
- Implement database migration system
- Version all API endpoints

---

## 4. System Features

### 4.1 Dashboard Feature
**Description:** Provides overview of email sending statistics and trends

**Functional Requirements:**
- FR-DASH-001, FR-DASH-002, FR-DASH-003, FR-DASH-004

**Priority:** High

**Use Case:**
1. User navigates to dashboard
2. System displays KPI cards with current totals
3. User selects view mode (weekly/30 days)
4. System updates charts with selected timeframe data
5. User views time distribution and top failures

### 4.2 Summary Reports Feature
**Description:** Provides daily aggregated reports with filtering and export

**Functional Requirements:**
- FR-REPORT-001, FR-REPORT-002, FR-REPORT-003, FR-REPORT-004

**Priority:** High

**Use Case:**
1. User navigates to reports page
2. System displays list of daily reports
3. User applies date range and domain filters
4. System displays filtered results
5. User selects a report to view details
6. System displays detailed report with recipients
7. User exports report to Excel

### 4.3 Activity Log Feature
**Description:** Tracks and displays individual email sending activities

**Functional Requirements:**
- FR-ACTIVITY-001, FR-ACTIVITY-002, FR-ACTIVITY-003, FR-ACTIVITY-004

**Priority:** High

**Use Case:**
1. User navigates to activity page
2. System displays list of activities
3. User searches by domain or ID
4. User applies status filter
5. System displays filtered activities
6. User selects an activity to view details
7. System displays full recipient list with statuses and errors

### 4.4 Data Management Feature
**Description:** Backend processes for recording and aggregating email data

**Functional Requirements:**
- FR-DATA-001, FR-DATA-002, FR-DATA-003, FR-DATA-004

**Priority:** Critical

**Use Case:**
1. Email sending system sends activity data to API
2. System records activity in database
3. System records recipient statuses
4. For failures, system logs error details
5. Daily job aggregates data into summary table

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Web-based responsive interface
- Support for desktop (1920x1080 minimum)
- Support for tablets (768px minimum width)
- Modern browser support (latest 2 versions)

### 5.2 Hardware Interfaces
- Not applicable (web-based application)

### 5.3 Software Interfaces
- **Database:** PostgreSQL 14+
- **Backend API:** RESTful API with JSON responses
- **Authentication:** JWT-based authentication
- **File Storage:** S3-compatible storage for exports

### 5.4 Communication Interfaces
- **Protocol:** HTTPS
- **Data Format:** JSON
- **API Style:** RESTful
- **WebSocket:** (Optional) For real-time updates

---

## 6. Other Requirements

### 6.1 Data Requirements
- **Data Retention:** Minimum 90 days
- **Data Format:** UTF-8 encoding
- **Date/Time:** ISO 8601 format, UTC timezone
- **Privacy:** Comply with applicable data protection regulations

### 6.2 Localization Requirements
- Primary language: Thai
- Date format: DD/MM/YYYY
- Time format: 24-hour format
- Number format: Decimal point separator

### 6.3 Legal Requirements
- Comply with data privacy laws
- Maintain audit logs
- Implement data retention policies
- Support data export for user requests

---

## 7. Appendices

### Appendix A: Glossary
- **Activity:** A single email sending event that may include multiple recipients
- **Recipient:** Individual email address that received an email
- **Domain:** Email domain (e.g., gmail.com)
- **Success Rate:** Percentage of successfully delivered emails
- **Failure Type:** Category of delivery failure (e.g., bounce, timeout)

### Appendix B: Analysis Models
Refer to:
- Entity Relationship Diagram (ERD)
- Database Schema Documentation
- API Specification Document

### Appendix C: To Be Determined (TBD) List
- Real-time notification system
- Advanced analytics and ML predictions
- Multi-language support beyond Thai
- Mobile application

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Lead Developer | | | |
| QA Lead | | | |
| Stakeholder | | | |

---

**End of Document**
