import frappe
from frappe.model.document import Document


class Booking(Document):
    def validate(self):
        self.fetch_truck_details()
        self.calculate_amounts()
        self.validate_advance()

    def fetch_truck_details(self):
        if self.truck and not self.price_per_km:
            self.price_per_km = frappe.db.get_value("Truck", self.truck, "price_per_km")
        if self.truck and not self.truck_owner:
            self.truck_owner = frappe.db.get_value("Truck", self.truck, "truck_owner")
        if self.truck and not self.driver:
            self.driver = frappe.db.get_value("Truck", self.truck, "default_driver")

    def calculate_amounts(self):
        distance = self.total_distance or 0
        rate = self.price_per_km or 0
        self.total_amount = round(distance * rate, 2)
        advance = self.customer_advance or 0
        self.remaining_amount = round(self.total_amount - advance, 2)

    def validate_advance(self):
        if self.customer_advance and self.total_amount:
            if self.customer_advance > self.total_amount:
                frappe.throw("Customer Advance cannot be greater than the Total Amount")

    def on_update(self):
        # Once a driver is assigned, make sure a Trip Tracking record exists
        # so the customer / agent / driver can all see live progress.
        if self.driver and self.booking_status in (
            "Driver Assigned", "Pickup", "In Transit", "Delivered", "Completed"
        ):
            self.ensure_trip_tracking()
        if self.truck:
            self.sync_truck_availability()

    def ensure_trip_tracking(self):
        existing = frappe.db.exists("Trip Tracking", {"booking": self.name})
        if existing:
            return
        frappe.get_doc({
            "doctype": "Trip Tracking",
            "booking": self.name,
            "trip_status": "Assigned",
        }).insert(ignore_permissions=True)

    def sync_truck_availability(self):
        status_map = {
            "Confirmed": "Booked",
            "Driver Assigned": "Booked",
            "Pickup": "On Trip",
            "In Transit": "On Trip",
            "Delivered": "On Trip",
            "Completed": "Available",
            "Cancelled": "Available",
        }
        new_status = status_map.get(self.booking_status)
        if new_status:
            frappe.db.set_value("Truck", self.truck, "availability_status", new_status)
