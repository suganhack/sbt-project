import frappe
from frappe.model.document import Document


class Payment(Document):
    def validate(self):
        if not self.payment_date:
            from frappe.utils import now_datetime
            self.payment_date = now_datetime()
