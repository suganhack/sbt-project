"""
One-off generator used while building the SBT Frappe app.
It writes a correctly-shaped DocType JSON file for every doctype in the app,
so the hand-written field lists below are the single source of truth.

Run once with: python3 gen_doctypes.py
Output goes to backend/sbt/sbt/sbt/doctype/<scrubbed_name>/<scrubbed_name>.json
"""
import json
import os
import re

APP_DIR = os.path.join(os.path.dirname(__file__), "..", "backend", "sbt", "sbt", "sbt")
DOCTYPE_DIR = os.path.join(APP_DIR, "doctype")


def scrub(name):
    return re.sub(r"[^a-z0-9_]", "", name.lower().replace(" ", "_").replace("-", "_"))


def field(fieldname, label, fieldtype, **kwargs):
    f = {
        "fieldname": fieldname,
        "fieldtype": fieldtype,
        "label": label,
    }
    f.update(kwargs)
    return f


def make_doctype(name, fields, autoname=None, title_field=None, extra_perms_roles=None,
                  track_changes=1, quick_entry=1):
    """Build a standard DocType json dict shared by every SBT doctype."""
    permissions = [
        {
            "role": "SBT Admin",
            "read": 1, "write": 1, "create": 1, "delete": 1,
            "print": 1, "email": 1, "export": 1, "report": 1, "share": 1,
        },
    ]
    for role in (extra_perms_roles or []):
        permissions.append({
            "role": role["role"],
            "read": 1,
            "write": role.get("write", 0),
            "create": role.get("create", 0),
            "delete": 0,
            "report": 1,
        })

    doc = {
        "doctype": "DocType",
        "name": name,
        "module": "SBT",
        "custom": 0,
        "istable": 0,
        "issingle": 0,
        "is_submittable": 0,
        "track_changes": track_changes,
        "quick_entry": quick_entry,
        "sort_field": "modified",
        "sort_order": "DESC",
        "engine": "InnoDB",
        "fields": fields,
        "permissions": permissions,
    }
    if autoname:
        doc["autoname"] = autoname
    if title_field:
        doc["title_field"] = title_field
    return doc


DOCTYPES = {}

# ---------------------------------------------------------------- Agent
DOCTYPES["Agent"] = make_doctype(
    "Agent",
    fields=[
        field("agent_name", "Agent Name", "Data", reqd=1, in_list_view=1),
        field("user", "Linked User", "Link", options="User", reqd=1, unique=1),
        field("mobile_number", "Mobile Number", "Data", reqd=1, in_list_view=1),
        field("email", "Email", "Data", options="Email"),
        field("region", "Region", "Data", in_list_view=1),
        field("status", "Status", "Select", options="Active\nInactive", default="Active", in_list_view=1),
    ],
    autoname="field:agent_name",
    extra_perms_roles=[{"role": "SBT Agent", "write": 0}],
)

# ---------------------------------------------------------------- Customer
DOCTYPES["Customer"] = make_doctype(
    "Customer",
    fields=[
        field("customer_name", "Customer Name", "Data", reqd=1, in_list_view=1),
        field("user", "Linked User", "Link", options="User", reqd=1, unique=1),
        field("mobile_number", "Mobile Number", "Data", reqd=1, in_list_view=1),
        field("email", "Email", "Data", options="Email"),
        field("address", "Address", "Small Text"),
        field("agent", "Managed By Agent", "Link", options="Agent", in_list_view=1),
        field("status", "Status", "Select", options="Active\nInactive", default="Active"),
    ],
    autoname="field:customer_name",
    extra_perms_roles=[{"role": "SBT Agent", "write": 1, "create": 1},
                        {"role": "SBT Customer", "write": 1}],
)

# ---------------------------------------------------------------- Truck Owner
DOCTYPES["Truck Owner"] = make_doctype(
    "Truck Owner",
    fields=[
        field("owner_name", "Owner Name", "Data", reqd=1, in_list_view=1),
        field("user", "Linked User", "Link", options="User", reqd=1, unique=1),
        field("mobile_number", "Mobile Number", "Data", reqd=1, in_list_view=1),
        field("email", "Email", "Data", options="Email"),
        field("address", "Address", "Small Text"),
        field("bank_account_details", "Bank Account Details", "Small Text"),
        field("status", "Status", "Select", options="Active\nInactive", default="Active", in_list_view=1),
    ],
    autoname="field:owner_name",
    extra_perms_roles=[{"role": "SBT Truck Owner", "write": 1}],
)

# ---------------------------------------------------------------- Driver
DOCTYPES["Driver"] = make_doctype(
    "Driver",
    fields=[
        field("driver_name", "Driver Name", "Data", reqd=1, in_list_view=1),
        field("user", "Linked User", "Link", options="User"),
        field("truck_owner", "Truck Owner", "Link", options="Truck Owner", reqd=1, in_list_view=1),
        field("driver_photo", "Driver Photo", "Attach Image"),
        field("mobile_number", "Mobile Number", "Data", reqd=1, in_list_view=1),
        field("license_number", "License Number", "Data", reqd=1, unique=1),
        field("license_photo", "License Photo", "Attach"),
        field("license_type", "License Type", "Select", options="LLR\nDL", reqd=1),
        field("issue_date", "Issue Date", "Date", reqd=1),
        field("expiry_date", "Expiry Date", "Date", reqd=1),
        field("verification_status", "Verification Status", "Select",
              options="Pending\nVerified\nRejected", default="Pending", in_list_view=1),
        field("status", "Status", "Select",
              options="Available\nOn Trip\nOffline", default="Available", in_list_view=1),
    ],
    autoname="field:license_number",
    extra_perms_roles=[{"role": "SBT Truck Owner", "write": 1, "create": 1},
                        {"role": "SBT Agent", "write": 0},
                        {"role": "SBT Driver", "write": 1}],
)

# ---------------------------------------------------------------- Truck
DOCTYPES["Truck"] = make_doctype(
    "Truck",
    fields=[
        field("truck_number", "Truck Number", "Data", reqd=1, unique=1, in_list_view=1),
        field("truck_owner", "Truck Owner", "Link", options="Truck Owner", reqd=1, in_list_view=1),
        field("truck_type", "Truck Type", "Select",
              options="Open Body\nContainer\nTrailer\nMini Truck\nTanker\nRefrigerated",
              reqd=1, in_list_view=1),
        field("truck_model", "Truck Model", "Data"),
        field("capacity", "Capacity (Ton)", "Float", reqd=1, in_list_view=1),
        field("current_location", "Current Location", "Data"),
        field("availability_status", "Availability Status", "Select",
              options="Available\nBooked\nOn Trip\nMaintenance\nOffline",
              default="Available", in_list_view=1),
        field("price_per_km", "Price per KM", "Currency", reqd=1, in_list_view=1),
        field("registration_details", "Registration Details", "Attach"),
        field("default_driver", "Default Driver", "Link", options="Driver"),
    ],
    autoname="field:truck_number",
    extra_perms_roles=[{"role": "SBT Truck Owner", "write": 1, "create": 1},
                        {"role": "SBT Agent", "write": 0},
                        {"role": "SBT Customer", "write": 0}],
)

# ---------------------------------------------------------------- Booking
DOCTYPES["Booking"] = make_doctype(
    "Booking",
    fields=[
        field("customer", "Customer", "Link", options="Customer", reqd=1, in_list_view=1),
        field("agent", "Agent", "Link", options="Agent", fetch_from="customer.agent", in_list_view=1),
        field("column_break_1", "", "Column Break"),
        field("from_location", "From Location", "Data", reqd=1, in_list_view=1),
        field("to_location", "To Location", "Data", reqd=1, in_list_view=1),
        field("required_date", "Required Date", "Date", reqd=1, in_list_view=1),
        field("section_break_1", "Truck & Driver", "Section Break"),
        field("truck", "Truck", "Link", options="Truck", reqd=1, in_list_view=1),
        field("truck_owner", "Truck Owner", "Link", options="Truck Owner",
              fetch_from="truck.truck_owner", read_only=1),
        field("driver", "Driver", "Link", options="Driver"),
        field("load_weight", "Load Weight (Ton)", "Float", reqd=1),
        field("section_break_2", "Fare", "Section Break"),
        field("total_distance", "Total Distance (KM)", "Float", reqd=1),
        field("price_per_km", "Price per KM", "Currency", fetch_from="truck.price_per_km", read_only=1),
        field("total_amount", "Total Amount", "Currency", read_only=1, in_list_view=1),
        field("customer_advance", "Customer Advance Paid", "Currency", read_only=1, default=0),
        field("remaining_amount", "Remaining Amount", "Currency", read_only=1),
        field("section_break_3", "Status", "Section Break"),
        field("booking_status", "Booking Status", "Select",
              options="Pending\nConfirmed\nDriver Assigned\nPickup\nIn Transit\nDelivered\nCompleted\nCancelled",
              default="Pending", in_list_view=1),
    ],
    autoname="format:BKG-{#####}",
    extra_perms_roles=[{"role": "SBT Agent", "write": 1, "create": 1},
                        {"role": "SBT Customer", "write": 0, "create": 1},
                        {"role": "SBT Truck Owner", "write": 1},
                        {"role": "SBT Driver", "write": 0}],
)

# ---------------------------------------------------------------- Customer Advance
DOCTYPES["Customer Advance"] = make_doctype(
    "Customer Advance",
    fields=[
        field("booking", "Booking", "Link", options="Booking", reqd=1, in_list_view=1),
        field("customer", "Customer", "Link", options="Customer",
              fetch_from="booking.customer", read_only=1, in_list_view=1),
        field("amount", "Amount", "Currency", reqd=1, in_list_view=1),
        field("payment_date", "Payment Date", "Datetime", default="Today"),
        field("payment_mode", "Payment Mode", "Select",
              options="Cash\nUPI\nBank Transfer\nCard", reqd=1),
        field("reference_no", "Reference No", "Data"),
        field("status", "Status", "Select", options="Pending\nPaid", default="Paid", in_list_view=1),
    ],
    autoname="format:CADV-{#####}",
    extra_perms_roles=[{"role": "SBT Agent", "write": 1, "create": 1},
                        {"role": "SBT Customer", "write": 0, "create": 1}],
)

# ---------------------------------------------------------------- Driver Advance
DOCTYPES["Driver Advance"] = make_doctype(
    "Driver Advance",
    fields=[
        field("booking", "Booking", "Link", options="Booking", reqd=1, in_list_view=1),
        field("driver", "Driver", "Link", options="Driver", reqd=1, in_list_view=1),
        field("requested_amount", "Requested Amount", "Currency", reqd=1, in_list_view=1),
        field("approved_amount", "Approved Amount", "Currency"),
        field("approved_by", "Approved By", "Link", options="User", read_only=1),
        field("payment_date", "Payment Date", "Datetime"),
        field("status", "Status", "Select",
              options="Requested\nApproved\nRejected\nPaid", default="Requested", in_list_view=1),
    ],
    autoname="format:DADV-{#####}",
    extra_perms_roles=[{"role": "SBT Agent", "write": 1, "create": 1},
                        {"role": "SBT Driver", "write": 0, "create": 1}],
)

# ---------------------------------------------------------------- Driver Settlement
DOCTYPES["Driver Settlement"] = make_doctype(
    "Driver Settlement",
    fields=[
        field("booking", "Booking", "Link", options="Booking", reqd=1, unique=1, in_list_view=1),
        field("driver", "Driver", "Link", options="Driver",
              fetch_from="booking.driver", read_only=1, in_list_view=1),
        field("total_settlement_amount", "Total Settlement Amount", "Currency", reqd=1, in_list_view=1),
        field("driver_advance_deducted", "Driver Advance Deducted", "Currency", default=0),
        field("remaining_amount", "Remaining Amount", "Currency", read_only=1, in_list_view=1),
        field("settlement_date", "Settlement Date", "Date", default="Today"),
        field("settlement_status", "Settlement Status", "Select",
              options="Pending\nCompleted", default="Pending", in_list_view=1),
    ],
    autoname="format:DSET-{#####}",
    extra_perms_roles=[{"role": "SBT Agent", "write": 1, "create": 1},
                        {"role": "SBT Driver", "write": 0}],
)

# ---------------------------------------------------------------- Trip Tracking
DOCTYPES["Trip Tracking"] = make_doctype(
    "Trip Tracking",
    fields=[
        field("booking", "Booking", "Link", options="Booking", reqd=1, unique=1, in_list_view=1),
        field("driver", "Driver", "Link", options="Driver",
              fetch_from="booking.driver", read_only=1, in_list_view=1),
        field("truck", "Truck", "Link", options="Truck",
              fetch_from="booking.truck", read_only=1),
        field("pickup_location", "Pickup Location", "Data",
              fetch_from="booking.from_location", read_only=1),
        field("destination", "Destination", "Data",
              fetch_from="booking.to_location", read_only=1),
        field("current_location", "Current Location", "Data", in_list_view=1),
        field("trip_status", "Trip Status", "Select",
              options="Assigned\nAccepted\nPickup\nIn Transit\nDelivered\nCompleted",
              default="Assigned", in_list_view=1),
        field("last_updated", "Last Updated", "Datetime", read_only=1),
        field("estimated_arrival", "Estimated Arrival", "Datetime"),
    ],
    autoname="format:TRK-{#####}",
    extra_perms_roles=[{"role": "SBT Agent", "write": 1, "create": 1},
                        {"role": "SBT Customer", "write": 0},
                        {"role": "SBT Truck Owner", "write": 0},
                        {"role": "SBT Driver", "write": 1}],
)

# ---------------------------------------------------------------- Payment
DOCTYPES["Payment"] = make_doctype(
    "Payment",
    fields=[
        field("booking", "Booking", "Link", options="Booking", reqd=1, in_list_view=1),
        field("payment_type", "Payment Type", "Select",
              options="Customer Advance\nCustomer Balance\nDriver Advance\nDriver Settlement",
              reqd=1, in_list_view=1),
        field("amount", "Amount", "Currency", reqd=1, in_list_view=1),
        field("payment_date", "Payment Date", "Datetime", default="Now"),
        field("payment_mode", "Payment Mode", "Select",
              options="Cash\nUPI\nBank Transfer\nCard"),
        field("reference_no", "Reference No", "Data"),
        field("status", "Status", "Select",
              options="Pending\nCompleted\nFailed", default="Completed", in_list_view=1),
    ],
    autoname="format:PAY-{#####}",
    extra_perms_roles=[{"role": "SBT Agent", "write": 0, "create": 1},
                        {"role": "SBT Customer", "write": 0}],
)


def main():
    for name, doc in DOCTYPES.items():
        folder = os.path.join(DOCTYPE_DIR, scrub(name))
        os.makedirs(folder, exist_ok=True)
        path = os.path.join(folder, f"{scrub(name)}.json")
        with open(path, "w") as f:
            json.dump(doc, f, indent=1)
            f.write("\n")
        # __init__.py for the doctype python module
        init_path = os.path.join(folder, "__init__.py")
        if not os.path.exists(init_path):
            open(init_path, "w").close()
        print("wrote", path)


if __name__ == "__main__":
    main()
