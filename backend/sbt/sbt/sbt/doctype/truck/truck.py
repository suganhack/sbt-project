import frappe
from frappe.model.document import Document


class Truck(Document):
    def validate(self):
        if self.truck_number:
            self.truck_number = self.truck_number.upper().replace(" ", "")

    def on_update(self):
        # Keep default_driver's status roughly in sync with the truck.
        if self.default_driver and self.availability_status == "On Trip":
            frappe.db.set_value("Driver", self.default_driver, "status", "On Trip")
