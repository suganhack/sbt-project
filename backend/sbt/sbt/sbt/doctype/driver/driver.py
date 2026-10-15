import frappe
from frappe.model.document import Document
from frappe.utils import getdate


class Driver(Document):
    def validate(self):
        self.validate_license_dates()

    def validate_license_dates(self):
        if self.issue_date and self.expiry_date:
            if getdate(self.expiry_date) <= getdate(self.issue_date):
                frappe.throw("License Expiry Date must be after the Issue Date")
