import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class TripTracking(Document):
    def on_update(self):
        self.last_updated = now_datetime()
        if self.trip_status == "Completed":
            self.sync_to_booking()

    def sync_to_booking(self):
        booking = frappe.get_doc("Booking", self.booking)
        booking.booking_status = "Completed"
        booking.save(ignore_permissions=True)
