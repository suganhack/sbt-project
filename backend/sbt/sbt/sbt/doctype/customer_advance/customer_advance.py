import frappe
from frappe.model.document import Document


class CustomerAdvance(Document):
    def validate(self):
        if not self.customer and self.booking:
            self.customer = frappe.db.get_value("Booking", self.booking, "customer")

    def on_update(self):
        if self.status != "Paid":
            return
        self.apply_to_booking()
        self.create_payment_record()

    def apply_to_booking(self):
        booking = frappe.get_doc("Booking", self.booking)
        total_paid = frappe.db.sql(
            """select coalesce(sum(amount), 0) from `tabCustomer Advance`
               where booking = %s and status = 'Paid'""",
            (self.booking,),
        )[0][0]
        booking.customer_advance = total_paid
        if booking.booking_status == "Pending":
            booking.booking_status = "Confirmed"
        booking.save(ignore_permissions=True)

    def create_payment_record(self):
        if frappe.db.exists("Payment", {"booking": self.booking,
                                         "payment_type": "Customer Advance",
                                         "reference_no": self.name}):
            return
        frappe.get_doc({
            "doctype": "Payment",
            "booking": self.booking,
            "payment_type": "Customer Advance",
            "amount": self.amount,
            "payment_mode": self.payment_mode,
            "reference_no": self.name,
            "status": "Completed",
        }).insert(ignore_permissions=True)
