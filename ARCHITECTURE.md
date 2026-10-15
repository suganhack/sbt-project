# SBT System Architecture & Data Flow

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSERS                              │
│  (Chrome, Firefox, Safari, Mobile Safari)                            │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │ REST API Calls
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────────┐        ┌──────────────────────┐
│  React Frontend      │        │ Frappe Admin Panel   │
│  (Port 3000)         │        │ (Port 8000/app)      │
│                      │        │                      │
│ ├─ Login             │        │ ├─ DocType Manager   │
│ ├─ Admin Dashboard   │        │ ├─ User Manager      │
│ ├─ Agent Dashboard   │        │ ├─ Data Entry        │
│ ├─ Customer Portal   │        │ └─ Reports           │
│ ├─ Driver App        │        │                      │
│ └─ Truck Owner Panel │        └──────────────────────┘
└──────────┬───────────┘
           │
           │ Axios HTTP Requests
           │ /api/method/sbt.sbt.api.*
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│         Frappe/ERPNext Backend (Port 8000)              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  REST API Layer                                    │ │
│  │  - Frappe API methods (api.py)                    │ │
│  │  - Authentication/Authorization                  │ │
│  │  - Request/Response handling                      │ │
│  │  - CORS & Security                                │ │
│  └────────────┬───────────────────────────────────────┘ │
│               │                                          │
│  ┌────────────▼───────────────────────────────────────┐ │
│  │  Business Logic Layer                             │ │
│  │  - DocType Controllers (Python)                  │ │
│  │  - Workflows & Hooks                             │ │
│  │  - Validations & Calculations                    │ │
│  │  - Permissions & Access Control                  │ │
│  │                                                    │ │
│  │  DocTypes:                                        │ │
│  │  ├─ Agent, Customer, Truck Owner, Driver        │ │
│  │  ├─ Truck, Booking                              │ │
│  │  ├─ Customer Advance, Driver Advance            │ │
│  │  ├─ Trip Tracking, Driver Settlement             │ │
│  │  └─ Payment                                       │ │
│  └────────────┬───────────────────────────────────────┘ │
│               │                                          │
│  ┌────────────▼───────────────────────────────────────┐ │
│  │  ORM & Database Access Layer                      │ │
│  │  - Frappe ORM                                     │ │
│  │  - Query Builder                                 │ │
│  │  - Transaction Management                        │ │
│  └────────────┬───────────────────────────────────────┘ │
└───────────────┼──────────────────────────────────────────┘
                │
                │ SQL Queries
                │ Transactions
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│            MariaDB 10.5+ Database                        │
│                                                          │
│  Tables (auto-created from DocTypes):                   │
│  ├─ `tabAgent` (with indexes on name, user)            │
│  ├─ `tabCustomer` (with foreign keys)                  │
│  ├─ `tabTruck` (with status index)                     │
│  ├─ `tabBooking` (with composite indexes)              │
│  ├─ `tabDriver` (with verification_status index)       │
│  ├─ `tabTrip Tracking` (with booking index)            │
│  ├─ `tabPayment` (with date range index)               │
│  ├─ `tabDriver Settlement`                             │
│  ├─ `tabCustomer Advance`                              │
│  ├─ `tabDriver Advance`                                │
│  └─ ... (Frappe system tables)                          │
│                                                          │
│  Features:                                              │
│  ├─ InnoDB storage engine                              │
│  ├─ ACID transactions                                  │
│  ├─ Foreign key constraints                            │
│  └─ Full-text search support                           │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Request/Response Flow

### Booking Creation Flow

```
CUSTOMER BROWSER
│
├─ Click "Book Now"
│  └─ React component captures form data
│
├─ POST /api/method/sbt.sbt.api.create_customer_booking
│  {
│    "customer": "CUST-001",
│    "from_location": "Coimbatore",
│    "to_location": "Chennai",
│    "required_date": "2026-09-10",
│    "truck": "TN 38 AB 1234",
│    "load_weight": 10.5,
│    "total_distance": 250
│  }
│
├─ FRAPPE SERVER receives request
│  ├─ Authenticate user
│  ├─ Check permissions (SBT Customer role)
│  └─ Call api.py method
│
├─ api.py: create_customer_booking()
│  ├─ Validate input data
│  ├─ Fetch truck details (truck_owner, price_per_km)
│  ├─ Create Booking doctype instance
│  │  └─ Triggers Booking.validate() hook
│  │     ├─ Validate dates
│  │     ├─ Calculate total_amount = distance × price_per_km
│  │     └─ Store customer_advance = 0
│  ├─ booking.insert() - Save to database
│  │  └─ Triggers Booking.on_update() hook
│  │     ├─ Create Trip Tracking record
│  │     └─ Update Truck availability_status
│  └─ Return response: {name: "BKG-00001", total_amount: 8750}
│
├─ REACT receives response
│  ├─ Show success message
│  ├─ Display booking details
│  └─ Navigate to "My Bookings"
│
└─ CUSTOMER sees confirmation
   └─ Booking ID: BKG-00001 | Status: Pending

DATABASE STATE:
├─ tabBooking record created
│  ├─ name: BKG-00001
│  ├─ customer: CUST-001
│  ├─ truck: TN 38 AB 1234
│  ├─ booking_status: Pending
│  ├─ total_amount: 8750
│  └─ modified: 2026-09-05 10:30:00
│
├─ tabTrip_Tracking record created
│  ├─ booking: BKG-00001
│  ├─ trip_status: Assigned
│  └─ modified: 2026-09-05 10:30:00
│
└─ tabTruck updated
   ├─ name: TN 38 AB 1234
   └─ availability_status: Booked (not Available anymore)
```

---

## 3. Driver Trip Update Flow (Real-time)

```
DRIVER SMARTPHONE
│
├─ Opens Driver Dashboard
│  └─ Loads active trips via get_active_bookings()
│
├─ Clicks "Load Trip" for BKG-00001
│  └─ Fetches trip tracking via get_trip_tracking()
│
├─ Updates Trip Status
│  ├─ Current: Assigned
│  ├─ Click "Accepted"
│  │  └─ POST /api/method/sbt.sbt.api.update_trip_status
│  │     {
│  │       "booking_name": "BKG-00001",
│  │       "new_status": "Accepted",
│  │       "current_location": "Coimbatore"
│  │     }
│  │
│  ├─ FRAPPE SERVER processes:
│  │  ├─ Fetch Trip Tracking record
│  │  ├─ Validate status transition (Assigned → Accepted is valid)
│  │  ├─ Update trip_status = "Accepted"
│  │  ├─ Update current_location = "Coimbatore"
│  │  ├─ Set last_updated = now()
│  │  ├─ Sync to Booking: booking_status = "Driver Assigned"
│  │  └─ Save to database
│  │
│  ├─ WEBSOCKET NOTIFICATION (optional)
│  │  ├─ Agent receives update
│  │  ├─ Customer receives update
│  │  └─ Real-time dashboard refresh
│  │
│  └─ API returns: {"trip_status": "Accepted"}
│
├─ Driver Starts Journey
│  ├─ Click "Pickup"
│  │  └─ Similar flow → trip_status = "Pickup"
│  │
│  ├─ Click "In Transit"
│  │  ├─ Update current_location via GPS
│  │  └─ trip_status = "In Transit"
│  │
│  └─ Every location update
│     └─ POST update_trip_status with new location
│
├─ Delivery Complete
│  ├─ Click "Delivered"
│  │  └─ trip_status = "Delivered"
│  │
│  └─ Click "Completed"
│     ├─ trip_status = "Completed"
│     ├─ Triggers Trip Tracking.on_update()
│     │  └─ Booking.booking_status = "Completed"
│     └─ Triggers Driver Settlement creation

DATABASE STATE (Progressive):
├─ Trip Tracking Progress:
│  ├─ 10:30 - trip_status: Assigned
│  ├─ 10:45 - trip_status: Accepted | current_location: Coimbatore
│  ├─ 11:00 - trip_status: Pickup | current_location: Warehouse
│  ├─ 11:15 - trip_status: In Transit | current_location: Highway KM50
│  ├─ 15:30 - trip_status: In Transit | current_location: Highway KM200
│  ├─ 16:00 - trip_status: Delivered | current_location: Chennai
│  └─ 16:15 - trip_status: Completed
│
├─ Booking Status Sync:
│  └─ booking_status: Driver Assigned → Pickup → In Transit → Delivered → Completed
│
└─ Settlement Created:
   └─ Driver Settlement record auto-created when trip completes
```

---

## 4. Data Model Relationships

```
┌─────────────┐
│   User      │ (Frappe built-in)
└──────┬──────┘
       │ 1:1
       │ user field links to:
       │
   ┌───┴────────┬────────────┬─────────────┬──────────────┐
   │            │            │             │              │
   ▼            ▼            ▼             ▼              ▼
┌───────┐  ┌──────────┐ ┌────────┐  ┌──────────┐  ┌────────────┐
│Agent  │  │Customer  │ │Truck   │  │Truck     │  │Driver      │
│       │  │          │ │Owner   │  │          │  │            │
└───────┘  └────┬─────┘ └────┬───┘  └────────┬─┘  └─────┬──────┘
                │            │               │          │
                │ N:1        │ 1:N           │ 1:N      │ 1:N
                │            │               │          │
                │            │   ┌───────────┘          │
                │            │   │                      │
                │            │   ▼                      │
                │            └─►Truck◄──────────────────┘
                │                 │
                │                 │ 1:N
                │                 │
                ▼                 ▼
           ┌──────────┐      ┌─────────────┐
           │Booking   │◄─────┤Trip Tracking│
           └────┬─────┘      └─────────────┘
                │
            ┌───┼───┬────────────────┐
            │   │   │                │
            ▼   ▼   ▼                ▼
        ┌────────┐┌─────────┐  ┌──────────────┐
        │Customer│Driver    │  │Payment       │
        │Advance │Advance   │  │              │
        └────────┘└─────────┘  └──────────────┘
            │         │
            └────┬────┘
                 │
                 ▼
        ┌──────────────────┐
        │Driver Settlement │
        └──────────────────┘

Key Relationships:
1. User 1:1 Agent
2. Agent 1:N Customer
3. Truck Owner 1:N Truck
4. Truck Owner 1:N Driver
5. Truck 1:N Booking
6. Customer 1:N Booking
7. Driver 1:N Booking
8. Booking 1:1 Trip Tracking
9. Booking 1:N Customer Advance
10. Booking 1:N Driver Advance
11. Booking 1:1 Driver Settlement
12. Booking 1:N Payment
```

---

## 5. Component Hierarchy (Frontend)

```
App
├─ Login
│  └─ Form (email, password)
│
├─ AdminDashboard
│  ├─ Header (branding, user info)
│  ├─ Navigation Tabs
│  │  ├─ Overview
│  │  │  └─ Stats Grid (KPIs)
│  │  ├─ Agents
│  │  │  └─ Agents Table
│  │  ├─ Trucks
│  │  │  └─ Trucks Table
│  │  └─ Bookings
│  │     └─ Bookings Table
│  └─ Footer
│
├─ AgentDashboard
│  ├─ Header
│  ├─ Navigation Tabs
│  │  ├─ Manage Bookings
│  │  │  ├─ Bookings Grid
│  │  │  └─ Booking Card (with assign driver modal)
│  │  ├─ Drivers
│  │  │  └─ Drivers Table
│  │  └─ Track Trips
│  └─ Footer
│
├─ CustomerDashboard
│  ├─ Header
│  ├─ Navigation Tabs
│  │  ├─ Book Truck
│  │  │  ├─ Search Form
│  │  │  └─ Trucks Grid (with book buttons)
│  │  ├─ My Bookings
│  │  │  └─ Bookings Table
│  │  └─ Track Trip
│  │     └─ Trip Tracking Card
│  └─ Footer
│
├─ TruckOwnerDashboard
│  ├─ Header
│  ├─ Navigation Tabs
│  │  ├─ My Trucks
│  │  │  ├─ Add Truck Form (conditional)
│  │  │  └─ Trucks Grid (with status selector)
│  │  ├─ Drivers
│  │  │  └─ Drivers Table
│  │  ├─ Active Trips
│  │  │  └─ Trips Grid
│  │  └─ Earnings
│  │     └─ Summary
│  └─ Footer
│
└─ DriverDashboard
   ├─ Header
   ├─ Navigation Tabs
   │  ├─ My Trip
   │  │  ├─ Trip Selector (or trip details)
   │  │  └─ Trip Controls (status buttons, location input)
   │  ├─ Trip History
   │  │  └─ Trips Table
   │  └─ Earnings
   │     └─ Settlement Summary
   └─ Footer
```

---

## 6. Database Query Patterns

### Common Queries

```python
# Search available trucks
trucks = frappe.get_list("Truck",
    filters={
        "availability_status": "Available",
        "truck_type": "Container",
        "capacity": [">", 10]
    },
    fields=["name", "truck_number", "capacity", "price_per_km"],
    limit_page_length=50
)

# Get bookings by agent
bookings = frappe.get_list("Booking",
    filters={"agent": "John Agent", "booking_status": "!= Cancelled"},
    fields=["name", "customer", "truck", "booking_status"],
    order_by="modified desc"
)

# Get trip tracking for booking
trip = frappe.get_doc("Trip Tracking", {"booking": "BKG-00001"})

# Get all payments for booking
payments = frappe.get_list("Payment",
    filters={"booking": "BKG-00001"},
    fields=["name", "amount", "payment_type", "status"],
    order_by="payment_date desc"
)

# Calculate total earnings for driver
earnings = frappe.db.sql("""
    SELECT COALESCE(SUM(ds.total_settlement_amount), 0) as total
    FROM `tabDriver Settlement` ds
    WHERE ds.driver = %s AND ds.settlement_status = 'Completed'
""", ("DRV-001",))[0][0]
```

---

## 7. Permission & Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    User Authentication                  │
│  (Session-based via Frappe)                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Role-Based Access Control                  │
│                                                         │
│  User → Role(s) → Permissions                           │
│                                                         │
│  Roles:                                                 │
│  ├─ SBT Admin (all access)                             │
│  ├─ SBT Agent (manage customers/drivers)               │
│  ├─ SBT Customer (self-service)                        │
│  ├─ SBT Truck Owner (manage fleet)                     │
│  └─ SBT Driver (execute trips)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Document-Level Permissions                   │
│                                                         │
│  Each DocType has permission matrix:                    │
│  ├─ Read (view document)                                │
│  ├─ Write (modify document)                             │
│  ├─ Create (new document)                               │
│  ├─ Delete (remove document)                            │
│  ├─ Print (export document)                             │
│  └─ Report (run report)                                 │
│                                                         │
│  Example: Booking                                       │
│  ├─ SBT Admin: full CRUD                                │
│  ├─ SBT Agent: create, read, write                      │
│  ├─ SBT Customer: create own, read own                  │
│  ├─ SBT Truck Owner: read assigned bookings             │
│  └─ SBT Driver: read assigned booking details           │
└─────────────────────────────────────────────────────────┘
```

---

## 8. API Response Structure

```javascript
// Success Response
{
  "message": {
    "name": "BKG-00001",
    "total_amount": 8750,
    "remaining_amount": 8750,
    "booking_status": "Pending",
    "customer": "CUST-001",
    "truck": "TN 38 AB 1234"
  },
  "exc": null
}

// Error Response
{
  "message": "Validation Error",
  "exc": [
    "frappe.exceptions.ValidationError",
    "Truck license has expired!"
  ]
}

// List Response
{
  "message": [
    {
      "name": "TN 38 AB 1234",
      "truck_number": "TN 38 AB 1234",
      "type": "Container",
      "capacity": 10,
      "price_per_km": 35
    },
    {
      "name": "TN 38 AB 5678",
      "truck_number": "TN 38 AB 5678",
      "type": "Open Body",
      "capacity": 15,
      "price_per_km": 28
    }
  ]
}
```

---

## 9. Caching Strategy

```
Frontend (React)
├─ Component state (in-memory)
├─ localStorage (user preferences)
└─ SessionStorage (temporary data during session)

Backend (Frappe)
├─ Redis cache (configured in Frappe)
│  ├─ Frequent queries
│  ├─ Calculated values
│  └─ Session data
│
├─ Database query cache
│  └─ Query results (TTL-based)
│
└─ HTTP cache headers
   ├─ Last-Modified
   ├─ ETag
   └─ Cache-Control
```

---

This architecture ensures:
✅ **Scalability** - Separate frontend/backend tiers
✅ **Reliability** - ACID transactions in MariaDB
✅ **Security** - Role-based access control
✅ **Maintainability** - Clean separation of concerns
✅ **Extensibility** - Easy to add new features via DocTypes and APIs
