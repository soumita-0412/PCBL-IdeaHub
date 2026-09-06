"""
Role constants and RBAC hierarchy.

ROLE_HIERARCHY is ordered from lowest to highest privilege.
"And above" checks compare index positions in this list.
"""


class Roles:
    EMPLOYEE = "ROLE_EMPLOYEE"
    L1_REVIEWER = "ROLE_L1_REVIEWER"
    FUNCTIONAL_REVIEWER = "ROLE_FUNCTIONAL_REVIEWER"
    FUNCTIONAL_HEAD = "ROLE_FUNCTIONAL_HEAD"
    ADMIN = "ROLE_ADMIN"
    SUPER_ADMIN = "ROLE_SUPER_ADMIN"


ROLE_HIERARCHY: list[str] = [
    Roles.EMPLOYEE,
    Roles.L1_REVIEWER,
    Roles.FUNCTIONAL_REVIEWER,
    Roles.FUNCTIONAL_HEAD,
    Roles.ADMIN,
    Roles.SUPER_ADMIN,
]
