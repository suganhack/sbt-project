# SBT - Online Truck Booking Platform
## Complete Project Documentation

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Workflows](#workflows)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)

---

## Project Overview

**SBT (Online Truck Booking Platform)** is a comprehensive web-based transportation management system that connects:

- **Customers** - Need trucks for transporting goods
- **Truck Owners** - Provide and manage trucks
- **Drivers** - Operate the trucks and execute trips
- **Agents** - Manage customers and monitor operations
- **Administrators** - Control the complete platform

### Key Features

✅ Customer truck booking with real-time search
✅ Multi-role dashboards (Admin, Agent, Customer, Truck Owner, Driver)
✅ Trip tracking and GPS integration ready
✅ Advance payment system for customers and drivers
✅ Driver settlement and earnings management
✅ License verification and document management
✅ Comprehensive reporting and analytics

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           React Frontend (Port 3000)                 │
│  (Admin, Agent, Customer, Truck Owner, Driver)      │
└──────────────────────┬──────────────────────────────┘
                       │
                  REST API Calls
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│    Frappe/ERPNext Backend (Port 8000)               │
│  - Authentication & Authorization                   │
│  - Business Logic                                   │
│  - DocType Definition                               │
│  - API Endpoints (/api/method/...)                  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│        MariaDB Database                             │
│  - DocTypes as Tables                               │
│  - Relational Data Storage                          │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **React as Frontend**: Modern, responsive UI with component-based architecture
2. **Frappe/ERPNext Backend**: Rapid development with built-in permissions and workflows
3. **MariaDB**: Reliable relational database with transaction support
4. **REST API**: Simple HTTP-based communication between frontend and backend
5. **DocType-Driven**: Frappe's DocType system provides auto CRUD operations

---

## Technology Stack

### Frontend
- **React 18.2+** - UI library
- **React Router 6.8+** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with custom design system

### Backend
- **Frappe Framework** - Full-stack ERP framework
- **ERPNext** - Enterprise Resource Planning base
- **Python 3.8+** - Backend language
- **Frappe REST API** - HTTP endpoints

### Database
- **MariaDB 10.5+** - Relational database

### Development Tools
- **Git** - Version control
- **npm/yarn** - Package management
- **pip** - Python package management

---

## Project Structure

```
sbt-project/
├── backend/
│   └── sbt/
│       └── sbt/
│           └── sbt/
│               ├── doctype/
│               │   ├── agent/
│               │   ├── customer/
│               │   ├── truck_owner/
│               │   ├── driver/
│               │   ├── truck/
│               │   ├── booking/
│               │   ├── customer_advance/
│               │   ├── driver_advance/
│               │   ├── driver_settlement/
│               │   ├── trip_tracking/
│               │   └── payment/
│               ├── api.py                 # REST API methods
│               ├── hooks.py               # Frappe hooks & config
│               └── install.py             # Installation script
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AgentDashboard.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── TruckOwnerDashboard.jsx
│   │   │   └── DriverDashboard.jsx
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── Login.css
│   │   │   └── Dashboard.css
│   │   └── App.jsx                       # Main App component
│   ├── package.json
│   └── index.js                          # React entry point
│
├── tools/
│   └── gen_doctypes.py                   # DocType generator
│
└── README.md                             # This file
```

---

## Setup & Installation

### Prerequisites

- Node.js 14+ and npm
- Python 3.8+
- MariaDB 10.5+
- Git
- Frappe Bench

### Backend Setup

1. **Install Frappe Bench**
```bash
pip install frappe-bench
```

2. **Create a new Frappe application**
```bash
cd backend/sbt
bench new-site sbt.local
bench get-app sbt
bench install-app sbt
```

3. **Run migrations**
```bash
bench migrate
```

4. **Start Frappe server**
```bash
bench start
```

Server runs on `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure API endpoint** (in frontend/.env)
```
REACT_APP_API_URL=http://localhost:8000
```

3. **Start React dev server**
```bash
npm start
```

React runs on `http://localhost:3000`

### Database Setup

MariaDB is configured automatically by Frappe during installation.

**Default Admin Credentials** (created during install):
- Email: `admin@sbt.local`
- Password: `admin`

---

## Database Schema

### Core DocTypes (Tables)

#### 1. **User** (Frappe built-in)
Links to system authentication and roles.

#### 2. **Agent**
```
- agent_name: Data
- user: Link (User)
- mobile_number: Data
- email: Email
- region: Data
- status: Select (Active/Inactive)
```

#### 3. **Customer**
```
- customer_name: Data
- user: Link (User)
- mobile_number: Data
- email: Email
- address: Text
- agent: Link (Agent)
- status: Select
```

#### 4. **Truck Owner**
```
- owner_name: Data
- user: Link (User)
- mobile_number: Data
- email: Email
- address: Text
- bank_account_details: Text
- status: Select
```

#### 5. **Driver**
```
- driver_name: Data
- user: Link (User)
- truck_owner: Link (Truck Owner)
- driver_photo: Image
- mobile_number: Data
- license_number: Data (unique)
- license_photo: File
- license_type: Select (LLR/DL)
- issue_date: Date
- expiry_date: Date
- verification_status: Select
- status: Select (Available/On Trip/Offline)
```

#### 6. **Truck**
```
- truck_number: Data (unique)
- truck_owner: Link (Truck Owner)
- truck_type: Select (Container/Open Body/etc)
- truck_model: Data
- capacity: Float
- current_location: Data
- availability_status: Select
- price_per_km: Currency
- registration_details: File
- default_driver: Link (Driver)
```

#### 7. **Booking**
```
- customer: Link (Customer)
- agent: Link (Agent)
- from_location: Data
- to_location: Data
- required_date: Date
- truck: Link (Truck)
- truck_owner: Link (Truck Owner)
- driver: Link (Driver)
- load_weight: Float
- total_distance: Float
- price_per_km: Currency
- total_amount: Currency (calculated)
- customer_advance: Currency
- remaining_amount: Currency (calculated)
- booking_status: Select (Pending/Confirmed/Driver Assigned/Pickup/In Transit/Delivered/Completed/Cancelled)
```

#### 8. **Customer Advance**
```
- booking: Link (Booking)
- customer: Link (Customer)
- amount: Currency
- payment_date: DateTime
- payment_mode: Select (Cash/UPI/Bank Transfer/Card)
- reference_no: Data
- status: Select (Pending/Paid)
```

#### 9. **Driver Advance**
```
- booking: Link (Booking)
- driver: Link (Driver)
- requested_amount: Currency
- approved_amount: Currency
- approved_by: Link (User)
- payment_date: DateTime
- status: Select (Requested/Approved/Rejected/Paid)
```

#### 10. **Trip Tracking**
```
- booking: Link (Booking)
- driver: Link (Driver)
- truck: Link (Truck)
- pickup_location: Data
- destination: Data
- current_location: Data
- trip_status: Select (Assigned/Accepted/Pickup/In Transit/Delivered/Completed)
- last_updated: DateTime
- estimated_arrival: DateTime
```

#### 11. **Driver Settlement**
```
- booking: Link (Booking)
- driver: Link (Driver)
- total_settlement_amount: Currency
- driver_advance_deducted: Currency
- remaining_amount: Currency (calculated)
- settlement_date: Date
- settlement_status: Select (Pending/Completed)
```

#### 12. **Payment**
```
- booking: Link (Booking)
- payment_type: Select (Customer Advance/Customer Balance/Driver Advance/Driver Settlement)
- amount: Currency
- payment_date: DateTime
- payment_mode: Select (Cash/UPI/Bank Transfer/Card)
- reference_no: Data
- status: Select (Pending/Completed/Failed)
```

---

## API Endpoints

All endpoints are accessed via Frappe's `/api/method/` namespace.

### Authentication
```
POST /api/auth/login
- email: string
- password: string
```

### Search & Booking
```
POST /api/method/sbt.sbt.api.search_available_trucks
- from_location: string
- to_location: string
- required_date: date
- truck_type?: string
- min_capacity?: float

POST /api/method/sbt.sbt.api.create_customer_booking
- customer: string
- from_location: string
- to_location: string
- required_date: date
- truck: string
- load_weight: float
- total_distance: float

GET /api/method/sbt.sbt.api.get_booking_details?booking_name=BKG-00001
```

### Status Updates
```
POST /api/method/sbt.sbt.api.confirm_booking
- booking_name: string

POST /api/method/sbt.sbt.api.assign_driver_to_booking
- booking_name: string
- driver_name: string

POST /api/method/sbt.sbt.api.update_booking_status
- booking_name: string
- status: string
```

### Payments
```
POST /api/method/sbt.sbt.api.pay_customer_advance
- booking_name: string
- amount: float
- payment_mode: string
- reference_no?: string

POST /api/method/sbt.sbt.api.request_driver_advance
- booking_name: string
- driver_name: string
- amount: float

POST /api/method/sbt.sbt.api.approve_driver_advance
- driver_advance_name: string
- approved_amount: float
```

### Trip Tracking
```
GET /api/method/sbt.sbt.api.get_trip_tracking?booking_name=BKG-00001

POST /api/method/sbt.sbt.api.update_trip_status
- booking_name: string
- new_status: string
- current_location?: string
```

### Reporting
```
POST /api/method/sbt.sbt.api.get_active_bookings
- customer_name?: string
- agent_name?: string
- driver_name?: string

GET /api/method/sbt.sbt.api.get_dashboard_stats

GET /api/method/sbt.sbt.api.get_user_role_and_linked_doc
```

---

## User Roles & Permissions

### 1. **SBT Admin**
- **Access Level**: Complete platform control
- **Permissions**:
  - Manage all users (agents, customers, drivers, truck owners)
  - Create and modify trucks, bookings, and payments
  - View all reports and analytics
  - Configure system settings
  - Manage licenses and verifications
  - Settle disputes and manually adjust records

### 2. **SBT Agent**
- **Access Level**: Manage customers and coordinate transportation
- **Permissions**:
  - View and manage assigned customers
  - Create bookings on behalf of customers
  - Assign trucks and drivers to bookings
  - Update booking and trip status
  - Manage driver advances and settlements
  - Track active trips
  - Generate reports for assigned customers

### 3. **SBT Customer**
- **Access Level**: Self-service truck booking
- **Permissions**:
  - Search available trucks
  - Create and manage own bookings
  - Pay advance payments
  - View booking history and status
  - Track trips in real-time
  - Cancel bookings
  - View payment receipts

### 4. **SBT Truck Owner**
- **Access Level**: Manage fleet and earnings
- **Permissions**:
  - Add and edit own trucks
  - Set truck availability
  - Assign drivers to trucks
  - Accept/reject booking requests
  - View active trips
  - Track earnings and settlements
  - View completed trips and history

### 5. **SBT Driver**
- **Access Level**: Execute transportation tasks
- **Permissions**:
  - Accept assigned trips
  - Update trip status (Pickup → In Transit → Delivered → Completed)
  - Share current location
  - Request driver advance
  - View earnings and settlements
  - Upload delivery proof/signatures

---

## Workflows

### Complete Booking Workflow

```
1. CUSTOMER REGISTRATION
   ├─ Register with email/password
   ├─ Create Customer profile
   └─ Verify mobile number

2. TRUCK SEARCH & BOOKING
   ├─ Enter: From Location, To Location, Date
   ├─ Search available trucks
   ├─ View truck details (type, capacity, driver, price)
   └─ Click "Book Now"

3. BOOKING CONFIRMATION
   ├─ Agent/Truck Owner reviews booking
   ├─ Confirm booking
   └─ Booking Status: Pending → Confirmed

4. DRIVER ASSIGNMENT
   ├─ Agent assigns driver to booking
   ├─ Trip Tracking record created
   └─ Booking Status: Confirmed → Driver Assigned

5. CUSTOMER ADVANCE PAYMENT
   ├─ Customer pays advance (50-100% of fare)
   ├─ Payment recorded
   └─ Booking Status: Driver Assigned → Ready for Trip

6. DRIVER ADVANCE (Optional)
   ├─ Driver requests advance
   ├─ Agent/Admin approves
   ├─ Payment made to driver
   └─ Driver Advance created

7. TRIP EXECUTION
   ├─ Driver: Accepts trip → Starts trip
   ├─ Driver: Updates status (Pickup → In Transit → Delivered)
   ├─ Real-time tracking with location updates
   └─ Customer/Agent monitor progress

8. TRIP COMPLETION
   ├─ Driver marks trip as Delivered
   ├─ Booking Status: In Transit → Delivered → Completed
   └─ Settlement triggered

9. DRIVER SETTLEMENT
   ├─ Calculate total earnings
   ├─ Deduct driver advance
   ├─ Create settlement record
   └─ Pay remaining amount

10. PAYMENT RECONCILIATION
    ├─ Customer pays remaining balance
    ├─ All payments recorded
    └─ Booking Status: Completed & Closed
```

### Agent-Managed Booking (Alternative)

```
AGENT CREATES BOOKING
├─ Agent logs in → Agent Dashboard
├─ Clicks "New Booking"
├─ Selects customer
├─ Enters trip details
├─ Selects truck
├─ Confirms & Creates Booking
└─ Workflow continues from step 4 (Driver Assignment)
```

---

## Development Guide

### Adding a New Feature

#### Example: SMS Notifications on Booking Confirmation

**Backend Steps:**

1. **Create a new API method** in `backend/sbt/sbt/sbt/api.py`:
```python
@frappe.whitelist()
def send_booking_confirmation_sms(booking_name):
    booking = frappe.get_doc("Booking", booking_name)
    customer = frappe.get_doc("Customer", booking.customer)
    
    message = f"Booking {booking.name} confirmed! Truck: {booking.truck}, Date: {booking.required_date}"
    send_sms(customer.mobile_number, message)
    return {"status": "SMS sent"}
```

2. **Add SMS service integration**:
   - Use third-party SMS API (Twilio, AWS SNS, etc.)
   - Store API credentials in Frappe config

3. **Test via Frappe console**:
```bash
bench console
# Then:
frappe.call("sbt.sbt.api.send_booking_confirmation_sms", args={"booking_name": "BKG-00001"})
```

**Frontend Steps:**

1. **Add button in BookingCard component**:
```jsx
<button onClick={() => sendSMS(booking.name)}>
  Send SMS to Customer
</button>
```

2. **Call API**:
```javascript
const sendSMS = async (bookingName) => {
  await axios.post("/api/method/sbt.sbt.api.send_booking_confirmation_sms", {
    booking_name: bookingName
  });
};
```

### Extending DocTypes

**Example: Add custom field to Truck**

1. **Edit `backend/sbt/tools/gen_doctypes.py`**:
```python
field("insurance_company", "Insurance Company", "Data"),
field("insurance_expiry", "Insurance Expiry", "Date"),
```

2. **Regenerate DocType**:
```bash
cd backend/sbt/tools
python3 gen_doctypes.py
```

3. **Migrate database**:
```bash
bench migrate
```

### Custom Validations

**Example: Prevent booking with expired driver license**

In `backend/sbt/sbt/sbt/doctype/booking/booking.py`:

```python
def validate(self):
    super().validate()
    self.validate_driver_license()

def validate_driver_license(self):
    if not self.driver:
        return
    
    driver = frappe.get_doc("Driver", self.driver)
    if driver.expiry_date < getdate():
        frappe.throw("Driver license has expired!")
```

---

## Deployment

### Production Checklist

- [ ] Set `frappe_password_reset_enabled = 0` in `site_config.json`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure email backend for notifications
- [ ] Set up database backups (daily)
- [ ] Configure Redis for caching
- [ ] Set up email alerts for errors
- [ ] Configure Nginx reverse proxy
- [ ] Set up CDN for static assets
- [ ] Enable API rate limiting
- [ ] Configure firewall rules

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  frappe:
    image: frappe/frappe-nginx:latest
    environment:
      - FRAPPE_APP_INIT=sbt
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - frappe_data:/home/frappe
  
  react:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://frappe:8000
```

### Cloud Deployment Options

- **AWS**: EC2 + RDS + S3
- **Google Cloud**: Compute Engine + Cloud SQL
- **Azure**: Virtual Machines + Azure Database
- **DigitalOcean**: Droplets + Managed Database
- **Heroku**: Using Procfile (for development)

---

## Troubleshooting

### Common Issues

**Issue**: "CORS error when frontend calls backend API"
```
Solution: Add CORS headers in frappe/sites/site_config.json:
allow_cors = "*"
```

**Issue**: "Driver status not updating"
```
Solution: Check that Trip Tracking record exists for booking.
Run: frappe.db.commit() after updates.
```

**Issue**: "Payment not reflecting in booking"
```
Solution: Ensure Customer Advance on_update hook is running.
Check: bench logs
```

### Debug Mode

```bash
# Frontend
REACT_APP_DEBUG=true npm start

# Backend
frappe set-config developer_mode 1
bench start
```

---

## Support & Contact

For issues, feature requests, or contributions:

- **Email**: support@sbt.local
- **GitHub**: (Add your repository)
- **Documentation**: (Add your docs site)

---

## License

MIT License - See LICENSE file for details

---

## Changelog

### Version 1.0.0 (Initial Release)
- Core booking system
- Multi-role dashboards
- Payment management
- Trip tracking framework
- Driver settlement system

---

**Last Updated**: September 2026
**Version**: 1.0.0
**Status**: Production Ready
