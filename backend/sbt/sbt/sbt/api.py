"""
API methods for the SBT React frontend.
Called via: /api/method/sbt.sbt.api.<method_name>
"""
import frappe
from frappe.utils import getdate, now_datetime
from datetime import timedelta


# ================================================================ TRUCK SEARCH
@frappe.whitelist()
def search_available_trucks(from_location, to_location, required_date, truck_type=None, min_capacity=None):
    """
    Search for available trucks based on booking parameters.
    Returns: [{"name", "truck_number", "type", "capacity", "driver_name", "price_per_km", "status"}]
    """
    filters = {
        "availability_status": "Available",
        "docstatus": 0,  # not submitted/cancelled
    }
    if truck_type:
        filters["truck_type"] = truck_type
    if min_capacity:
        filters["capacity"] = [">", min_capacity]

    trucks = frappe.get_list(
        "Truck",
        filters=filters,
        fields=["name", "truck_number", "truck_type", "capacity", "default_driver", "price_per_km"],
        limit_page_length=50,
    )

    result = []
    for truck in trucks:
        driver_name = ""
        if truck["default_driver"]:
            driver_name = frappe.db.get_value("Driver", truck["default_driver"], "driver_name")

        result.append({
            "name": truck["name"],
            "truck_number": truck["truck_number"],
            "type": truck["truck_type"],
            "capacity": truck["capacity"],
            "driver_name": driver_name or "Unassigned",
            "price_per_km": truck["price_per_km"],
            "status": "Available",
        })

    return result


# ================================================================ BOOKING
@frappe.whitelist()
def create_customer_booking(customer, from_location, to_location, required_date, truck, load_weight, total_distance):
    """
    Create a new booking from customer or agent.
    Returns: {"name", "total_amount", "customer_advance"}
    """
    booking = frappe.get_doc({
        "doctype": "Booking",
        "customer": customer,
        "from_location": from_location,
        "to_location": to_location,
        "required_date": required_date,
        "truck": truck,
        "load_weight": load_weight,
        "total_distance": total_distance,
        "booking_status": "Pending",
    })
    booking.insert()
    return {
        "name": booking.name,
        "total_amount": booking.total_amount,
        "remaining_amount": booking.remaining_amount,
    }


@frappe.whitelist()
def get_booking_details(booking_name):
    """Get full booking details including truck owner, driver, and trip status."""
    booking = frappe.get_doc("Booking", booking_name)
    trip = None
    if frappe.db.exists("Trip Tracking", {"booking": booking_name}):
        trip = frappe.get_doc("Trip Tracking", {"booking": booking_name})

    return {
        "booking": booking.as_dict(),
        "trip": trip.as_dict() if trip else None,
    }


@frappe.whitelist()
def update_booking_status(booking_name, status):
    """
    Update booking status: Pending → Confirmed → Driver Assigned → Pickup → In Transit → Delivered → Completed
    """
    booking = frappe.get_doc("Booking", booking_name)
    booking.booking_status = status
    booking.save()
    return {"status": status}


@frappe.whitelist()
def confirm_booking(booking_name):
    """Mark booking as Confirmed (agent/truck owner accepting)."""
    return update_booking_status(booking_name, "Confirmed")


@frappe.whitelist()
def assign_driver_to_booking(booking_name, driver_name):
    """Assign a driver to the booking and create Driver Advance record."""
    booking = frappe.get_doc("Booking", booking_name)
    booking.driver = driver_name
    booking.booking_status = "Driver Assigned"
    booking.save()

    # Auto-create a Trip Tracking record so driver can start accepting
    if not frappe.db.exists("Trip Tracking", {"booking": booking_name}):
        frappe.get_doc({
            "doctype": "Trip Tracking",
            "booking": booking_name,
            "trip_status": "Assigned",
        }).insert()

    return {"driver": driver_name}


# ================================================================ CUSTOMER ADVANCE PAYMENT
@frappe.whitelist()
def pay_customer_advance(booking_name, amount, payment_mode, reference_no=None):
    """
    Record customer advance payment.
    Returns: {"status", "remaining_amount"}
    """
    advance = frappe.get_doc({
        "doctype": "Customer Advance",
        "booking": booking_name,
        "amount": amount,
        "payment_mode": payment_mode,
        "reference_no": reference_no,
        "status": "Paid",
    })
    advance.insert()

    booking = frappe.get_doc("Booking", booking_name)
    return {
        "status": "Paid",
        "total_amount": booking.total_amount,
        "remaining_amount": booking.remaining_amount,
    }


# ================================================================ DRIVER ADVANCE
@frappe.whitelist()
def request_driver_advance(booking_name, driver_name, amount):
    """Driver requests an advance; agent approves/pays later."""
    advance = frappe.get_doc({
        "doctype": "Driver Advance",
        "booking": booking_name,
        "driver": driver_name,
        "requested_amount": amount,
        "status": "Requested",
    })
    advance.insert()
    return {"name": advance.name, "status": "Requested"}


@frappe.whitelist()
def approve_driver_advance(driver_advance_name, approved_amount):
    """Agent approves and pays driver advance."""
    advance = frappe.get_doc("Driver Advance", driver_advance_name)
    advance.approved_amount = approved_amount
    advance.status = "Paid"
    advance.save()
    return {"status": "Paid"}


# ================================================================ TRIP TRACKING
@frappe.whitelist()
def get_trip_tracking(booking_name):
    """Get real-time trip tracking info."""
    if not frappe.db.exists("Trip Tracking", {"booking": booking_name}):
        return None
    trip = frappe.get_doc("Trip Tracking", {"booking": booking_name})
    return trip.as_dict()


@frappe.whitelist()
def update_trip_status(booking_name, new_status, current_location=None):
    """
    Driver updates trip status: Assigned → Accepted → Pickup → In Transit → Delivered → Completed
    """
    if not frappe.db.exists("Trip Tracking", {"booking": booking_name}):
        frappe.throw("Trip Tracking record not found for this booking")

    trip = frappe.get_doc("Trip Tracking", {"booking": booking_name})
    trip.trip_status = new_status
    if current_location:
        trip.current_location = current_location
    trip.save()

    # Sync to booking
    booking = frappe.get_doc("Booking", booking_name)
    status_map = {
        "Accepted": "Driver Assigned",
        "Pickup": "Pickup",
        "In Transit": "In Transit",
        "Delivered": "Delivered",
        "Completed": "Completed",
    }
    if new_status in status_map:
        booking.booking_status = status_map[new_status]
        booking.save()

    return {"trip_status": new_status}


@frappe.whitelist()
def get_active_bookings(customer_name=None, agent_name=None, driver_name=None):
    """Get active/recent bookings for dashboard."""
    filters = {
        "booking_status": ["!=", "Cancelled"],
        "docstatus": 0,
    }
    if customer_name:
        filters["customer"] = customer_name
    if agent_name:
        filters["agent"] = agent_name
    if driver_name:
        filters["driver"] = driver_name

    return frappe.get_list(
        "Booking",
        filters=filters,
        fields=["name", "customer", "from_location", "to_location", "required_date", "booking_status"],
        order_by="modified desc",
        limit_page_length=20,
    )


# ================================================================ DRIVER SETTLEMENT
@frappe.whitelist()
def create_driver_settlement(booking_name, total_settlement_amount, driver_advance_deducted=0):
    """
    Create settlement record after trip completion.
    Remaining amount is calculated automatically.
    """
    settlement = frappe.get_doc({
        "doctype": "Driver Settlement",
        "booking": booking_name,
        "total_settlement_amount": total_settlement_amount,
        "driver_advance_deducted": driver_advance_deducted,
        "settlement_status": "Pending",
    })
    settlement.insert()
    return {
        "name": settlement.name,
        "remaining_amount": settlement.remaining_amount,
    }


@frappe.whitelist()
def complete_driver_settlement(settlement_name):
    """Mark settlement as completed and pay the driver."""
    settlement = frappe.get_doc("Driver Settlement", settlement_name)
    settlement.settlement_status = "Completed"
    settlement.save()
    return {"status": "Completed"}


# ================================================================ USER & ROLE HELPERS
@frappe.whitelist()
def get_user_role_and_linked_doc():
    """
    Get current user's role and linked document.
    Used by React to determine dashboard to show.
    Returns: {"email", "role", "linked_doc_type", "linked_doc_name"}
    """
    user_email = frappe.session.user
    user = frappe.get_doc("User", user_email)

    # Determine which SBT role this user has
    sbt_role = None
    linked_doc_type = None
    linked_doc_name = None

    for role in user.roles:
        if "SBT Admin" in role.role:
            sbt_role = "Admin"
            break
        elif "SBT Agent" in role.role:
            sbt_role = "Agent"
            linked_doc_type = "Agent"
        elif "SBT Customer" in role.role:
            sbt_role = "Customer"
            linked_doc_type = "Customer"
        elif "SBT Truck Owner" in role.role:
            sbt_role = "Truck Owner"
            linked_doc_type = "Truck Owner"
        elif "SBT Driver" in role.role:
            sbt_role = "Driver"
            linked_doc_type = "Driver"

    # Find linked doc
    if linked_doc_type:
        linked_doc_name = frappe.db.get_value(linked_doc_type, {"user": user_email})

    return {
        "email": user_email,
        "sbt_role": sbt_role,
        "linked_doc_type": linked_doc_type,
        "linked_doc_name": linked_doc_name,
    }


@frappe.whitelist()
def get_dashboard_stats():
    """Get high-level stats for dashboards."""
    return {
        "total_bookings": frappe.db.count("Booking"),
        "active_bookings": frappe.db.count("Booking", {"booking_status": ["in", ["Pending", "Confirmed", "Pickup", "In Transit"]]}),
        "completed_bookings": frappe.db.count("Booking", {"booking_status": "Completed"}),
        "total_trucks": frappe.db.count("Truck"),
        "available_trucks": frappe.db.count("Truck", {"availability_status": "Available"}),
        "total_customers": frappe.db.count("Customer"),
        "total_drivers": frappe.db.count("Driver"),
    }
