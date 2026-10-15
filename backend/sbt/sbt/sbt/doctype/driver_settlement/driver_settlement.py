import frappe
from frappe.model.document import Document


class DriverSettlement(Document):
    def validate(self):
        self.calculate_settlement()

    def calculate_settlement(self):
        self.remaining_amount = round(
            (self.total_settlement_amount or 0) - (self.driver_advance_deducted or 0), 2
        )

    def on_update(self):
        if self.settlement_status == "Completed":
            self.create_settlement_payment()

    def create_settlement_payment(self):
        if frappe.db.exists("Payment", {"booking": self.booking,
                                         "payment_type": "Driver Settlement",
                                         "reference_no": self.name}):
            return
        frappe.get_doc({
            "doctype": "Payment",
            "booking": self.booking,
            "payment_type": "Driver Settlement",
            "amount": self.remaining_amount,
            "reference_no": self.name,
            "status": "Completed",
        }).insert(ignore_permissions=True)
