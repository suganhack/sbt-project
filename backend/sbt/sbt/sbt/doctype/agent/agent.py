import frappe
from frappe.model.document import Document


class Agent(Document):
    def validate(self):
        if not self.email and self.user:
            self.email = self.user
