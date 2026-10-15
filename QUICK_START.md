# SBT Quick Start Guide

Get the SBT platform running in 5 minutes!

---

## ⚡ 5-Minute Quick Start

### Prerequisites
```bash
# Check Node.js version
node --version  # Should be 14+

# Check Python version  
python3 --version  # Should be 3.8+

# Check MariaDB
mysql --version  # Should be 10.5+
```

### Step 1: Clone & Navigate
```bash
cd sbt-project
```

### Step 2: Backend Setup (3 minutes)

#### Option A: Using Frappe Bench (Recommended)
```bash
# Install Frappe Bench
pip install frappe-bench

# Create bench workspace
bench init frappe-workspace
cd frappe-workspace

# Create new site
bench new-site sbt.local
bench use sbt.local

# Get SBT app
bench get-app sbt /path/to/sbt-project/backend/sbt

# Install app
bench install-app sbt

# Run migrations
bench migrate

# Start server
bench start
```

**Server URL**: http://localhost:8000
**Admin Email**: admin@sbt.local
**Admin Password**: admin

#### Option B: Quick Docker Setup
```bash
# Build and run with Docker
docker-compose up -d

# Run migrations
docker-compose exec frappe bench migrate
```

### Step 3: Frontend Setup (2 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**App URL**: http://localhost:3000

---

## 🚀 First Actions

### 1. Login
- Open http://localhost:3000
- Email: `admin@sbt.local`
- Password: `admin`

### 2. Explore Admin Dashboard
- Click on Admin dashboard
- View statistics
- Check sample data

### 3. Create Test Data

#### Create Agent
```
Go to Frappe Admin > Agent > New
- Agent Name: John Agent
- Mobile: 9876543210
- Region: North
- Save
```

#### Create Customer
```
Go to Frappe Admin > Customer > New
- Customer Name: Raj Kumar
- Mobile: 9123456789
- Save
```

#### Create Truck Owner
```
Go to Frappe Admin > Truck Owner > New
- Owner Name: Sharma Trucks
- Mobile: 9111111111
- Save
```

#### Add Truck
```
Go to Frappe Admin > Truck > New
- Truck Number: TN 38 AB 1234
- Type: Container
- Capacity: 10 Ton
- Price/KM: ₹35
- Status: Available
- Save
```

#### Create Driver
```
Go to Frappe Admin > Driver > New
- Driver Name: Kumar
- License Number: DL2345678901
- License Type: DL
- Expiry Date: 2025-12-31
- Status: Available
- Save
```

### 4. Create First Booking
```
Frontend > Customer Dashboard > Book Truck
- From: Coimbatore
- To: Chennai
- Date: 2026-09-10
- Click Search
- Select Truck TN 38 AB 1234
- Click "Book Now"
- Enter Distance: 250 KM
- Click Confirm
```

### 5. Test Full Flow
```
1. Customer books truck ✓
2. Agent confirms booking
3. Agent assigns driver
4. Customer pays advance
5. Driver accepts trip
6. Driver updates status (Pickup → In Transit → Delivered)
7. Trip completed
8. Driver settlement created
9. Payment finalized
```

---

## 📱 Role-Based Access

### Admin Dashboard
- **URL**: http://localhost:3000/admin
- **Login**: admin@sbt.local / admin
- **Access**: All platform features

### Agent Dashboard
- **URL**: http://localhost:3000/agent
- **Login**: (Create agent user first)
- **Access**: Customer & booking management

### Customer Dashboard
- **URL**: http://localhost:3000/customer
- **Login**: (Create customer user first)
- **Access**: Book trucks, track trips

### Truck Owner Dashboard
- **URL**: http://localhost:3000/truck-owner
- **Login**: (Create truck owner user first)
- **Access**: Manage trucks & drivers

### Driver Dashboard
- **URL**: http://localhost:3000/driver
- **Login**: (Create driver user first)
- **Access**: Accept trips, update status

---

## 🛠️ Create Test Users

### Create Agent User
```bash
# Via Frappe console
bench console

# Then run:
user = frappe.get_doc({
    "doctype": "User",
    "email": "agent@sbt.local",
    "first_name": "Test",
    "last_name": "Agent",
    "enabled": 1,
    "user_type": "System User",
    "roles": [{"role": "SBT Agent"}],
})
user.new_password = "agent"
user.insert(ignore_permissions=True)
frappe.db.commit()
print("Agent user created!")
```

### Create Customer User
```python
user = frappe.get_doc({
    "doctype": "User",
    "email": "customer@sbt.local",
    "first_name": "Test",
    "last_name": "Customer",
    "enabled": 1,
    "user_type": "System User",
    "roles": [{"role": "SBT Customer"}],
})
user.new_password = "customer"
user.insert(ignore_permissions=True)
frappe.db.commit()
```

### Create Truck Owner User
```python
user = frappe.get_doc({
    "doctype": "User",
    "email": "owner@sbt.local",
    "first_name": "Test",
    "last_name": "Owner",
    "enabled": 1,
    "user_type": "System User",
    "roles": [{"role": "SBT Truck Owner"}],
})
user.new_password = "owner"
user.insert(ignore_permissions=True)
frappe.db.commit()
```

### Create Driver User
```python
user = frappe.get_doc({
    "doctype": "User",
    "email": "driver@sbt.local",
    "first_name": "Test",
    "last_name": "Driver",
    "enabled": 1,
    "user_type": "System User",
    "roles": [{"role": "SBT Driver"}],
})
user.new_password = "driver"
user.insert(ignore_permissions=True)
frappe.db.commit()
```

---

## 🔍 Common URLs

| Page | URL |
|------|-----|
| Login | http://localhost:3000 |
| Admin Dashboard | http://localhost:3000/admin |
| Agent Dashboard | http://localhost:3000/agent |
| Customer Dashboard | http://localhost:3000/customer |
| Truck Owner Dashboard | http://localhost:3000/truck-owner |
| Driver Dashboard | http://localhost:3000/driver |
| Frappe Admin | http://localhost:8000/app/home |
| Frappe Desk | http://localhost:8000/desk |

---

## 📊 API Testing

### Test API with cURL

```bash
# Search trucks
curl -X POST http://localhost:8000/api/method/sbt.sbt.api.search_available_trucks \
  -H "Content-Type: application/json" \
  -d '{
    "from_location": "Coimbatore",
    "to_location": "Chennai",
    "required_date": "2026-09-10",
    "truck_type": "Container"
  }'

# Get dashboard stats
curl http://localhost:8000/api/method/sbt.sbt.api.get_dashboard_stats

# Get user info
curl http://localhost:8000/api/method/sbt.sbt.api.get_user_role_and_linked_doc
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Frontend (3000)
lsof -i :3000
kill -9 <PID>

# Backend (8000)
lsof -i :8000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check MariaDB status
mysql -u root -p
SHOW DATABASES;

# If not running:
sudo service mysql start  # Linux
brew services start mysql # macOS
```

### Module Not Found
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install

# Backend
cd backend
pip install -r requirements.txt
bench migrate
```

### Clear Cache
```bash
# Frontend
rm -rf ~/.node-gyp
npm cache clean --force

# Backend
bench clear-cache
bench clear-desk-cache
```

---

## 📚 Next Steps

1. **Customize UI**: Edit components in `frontend/src/pages/`
2. **Add Features**: Create new API methods in `backend/sbt/sbt/sbt/api.py`
3. **Configure Email**: Set up email notifications in Frappe
4. **Add Payment Gateway**: Integrate Razorpay or Stripe
5. **Deploy**: Follow deployment guide in README.md

---

## 🚨 Reset Everything

```bash
# Stop servers
pkill -f "bench start"
pkill -f "npm start"

# Reset database
bench drop-site sbt.local

# Restart
bench new-site sbt.local
bench install-app sbt
bench migrate
bench start
```

---

## 📞 Support

For issues:
1. Check logs: `bench logs`
2. Check console errors (browser DevTools)
3. Review documentation in README.md
4. Check Frappe documentation: https://frappeframework.com

---

**Happy Booking! 🚚**

Version: 1.0.0
Last Updated: September 2026
