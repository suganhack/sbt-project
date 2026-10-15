import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class DriverAdvance(Document):
    def before_save(self):
        if self.status == "Approved" and not self.approved_by:
            self.approved_by = frappe.session.user
            if not self.approved_amount:
                self.approved_amount = self.requested_amount
        if self.status == "Paid" and not self.payment_date:
            self.payment_date = now_datetime()

    def on_update(self):
        if self.status == "Paid":
            self.create_payment_record()

    def create_payment_record(self):
        if frappe.db.exists("Payment", {"booking": self.booking,
                                         "payment_type": "Driver Advance",
                                         "reference_no": self.name}):
            return
        frappe.get_doc({
            "doctype": "Payment",
            "booking": self.booking,
            "payment_type": "Driver Advance",
            "amount": self.approved_amount or self.requested_amount,
            "reference_no": self.name,
            "status": "Completed",
        }).insert(ignore_permissions=True)
