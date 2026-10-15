import frappe
from frappe.model.document import Document


class Customer(Document):
    def validate(self):
        if not self.email and self.user:
            self.email = self.user
