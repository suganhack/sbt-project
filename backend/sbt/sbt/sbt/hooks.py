app_name = "sbt"
app_title = "SBT - Online Truck Booking Platform"
app_publisher = "SBT Team"
app_description = "Online Truck Booking Platform connecting customers, truck owners, drivers, and agents"
app_email = "support@sbt.local"
app_license = "MIT"
app_version = "1.0.0"

# Includes in <head>
app_include_css = [
    "/assets/sbt/css/sbt.css",
]

app_include_js = [
    "/assets/sbt/js/sbt.js",
]

# include js, css files in header of web template
web_include_css = []
web_include_js = []

# include custom scss in every page
page_css = {}

# include js in page
page_js = {}

# DocType Class
# ---------------
# override_doctype_class = {
#     "Transaction": "custom_app.overrides.CustomTransaction"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
    "Booking": {
        "on_submit": "sbt.sbt.doctype.booking.booking_events.on_booking_submit",
        "on_update": "sbt.sbt.doctype.booking.booking_events.on_booking_update",
    },
}

# Scheduled Tasks
# ---------------

scheduler_events = {
    "daily": [
        "sbt.sbt.tasks.daily_trip_status_check",
        "sbt.sbt.tasks.verify_expired_licenses",
    ],
}

# Testing
# -------

# before_tests = "sbt.install.before_tests"

# Fixtures
# --------

fixtures = [
    {
        "dt": "Role",
        "filters": [["name", "in", [
            "SBT Admin",
            "SBT Agent",
            "SBT Customer",
            "SBT Truck Owner",
            "SBT Driver",
        ]]],
    },
]

# Custom Sidebar Items
# ----

# sidebar_config = "sbt.config.get_sidebar_config"

# Desk Notifications
# ------------------

# notification_config = "sbt.notifications.get_notification_config"

# Permissions
# -----------

# permission_query_conditions = {
#     "Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }

# has_permission = {
#     "Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Dashboard Overrides
# ----

# dashboard_overrides = {
#     "Task": "sbt.task.get_dashboard_data"
# }

# Home Pages
# ----------

# application_home_page = "/app/custom-home"

# website_route_rules = [
#     {"from_route": "/blog/<blog_title>", "to_route": "Blog/<blog_title>"},
# ]

# Website user home page (by Role)
# website_home_page_for_role = {
#     "Guest": "landing-page"
# }

# Generators
# ----------

# auto_name = "naming_series:"

# username_parts = ["name", "email"]

# See Integrations Flag
# ----------------------

# Has Web Form
has_web_form = False

# Ignore these DocTypes when syncing to ON
# ----

# ignore_doctypes_on_desk = ["DocType Name"]

# Applications
# --

# default_applications = [
#     "Desktop",
#     "Website",
#     "Desk",
# ]

# Functions to run in all hooks
# Regexes allowed (use "." ~= ".*" for all apps)
# ----

# teardown functions should return nothing

# before_migrate = ["sbt.migrate.setup"]
after_migrate = ["sbt.install.after_migrate"]
