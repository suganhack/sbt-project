"""
Installation and setup for the SBT app.
Called by hooks.py after_migrate.
"""
import frappe


def after_migrate():
    """Run after database migration."""
    create_roles()
    create_default_admin_user()


def create_roles():
    """Create SBT application roles if they don't exist."""
    roles_to_create = [
        {
            "role_name": "SBT Admin",
            "description": "SBT Platform Administrator - full access",
        },
        {
            "role_name": "SBT Agent",
            "description": "SBT Agent - manage customers, bookings, drivers",
        },
        {
            "role_name": "SBT Customer",
            "description": "SBT Customer - book trucks and track trips",
        },
        {
            "role_name": "SBT Truck Owner",
            "description": "SBT Truck Owner - manage trucks and drivers",
        },
        {
            "role_name": "SBT Driver",
            "description": "SBT Driver - accept trips and update status",
        },
    ]

    for role_info in roles_to_create:
        if not frappe.db.exists("Role", role_info["role_name"]):
            frappe.get_doc({
                "doctype": "Role",
                "role_name": role_info["role_name"],
                "description": role_info["description"],
            }).insert(ignore_permissions=True)
            frappe.db.commit()
            print(f"✓ Created role: {role_info['role_name']}")


def create_default_admin_user():
    """Create a default admin user for testing (admin@sbt.local / admin)."""
    if frappe.db.exists("User", "admin@sbt.local"):
        return

    admin_user = frappe.get_doc({
        "doctype": "User",
        "email": "admin@sbt.local",
        "first_name": "SBT",
        "last_name": "Admin",
        "enabled": 1,
        "user_type": "System User",
        "roles": [
            {"role": "System Manager"},
            {"role": "SBT Admin"},
        ],
    })
    admin_user.new_password = "admin"
    admin_user.insert(ignore_permissions=True)
    frappe.db.commit()
    print("✓ Created default admin user: admin@sbt.local / admin")
