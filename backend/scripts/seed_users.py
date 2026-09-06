#!/usr/bin/env python3
"""
Seed script — generates backend/data/users.pkl with bcrypt-hashed passwords.

Run from the backend/ directory:
    python scripts/seed_users.py

The pickle file is the Phase 1 user database.  Do NOT commit it to git.
"""

import pickle
import sys
from pathlib import Path

import bcrypt


def hash_password(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12))


DEFAULT_PASSWORD = "Password@123"

USERS: list[dict] = [
    # ── Level 1 — Employee ───────────────────────────────────
    {
        "user_id": "EMP001",
        "username": "alice.johnson",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Alice Johnson",
        "email": "alice.johnson@company.com",
        "department": "Operations",
        "function": "Supply Chain",
        "location": "New York",
        "manager": "bob.smith",
        "role": "ROLE_EMPLOYEE",
    },
    {
        "user_id": "EMP002",
        "username": "charlie.brown",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Charlie Brown",
        "email": "charlie.brown@company.com",
        "department": "Finance",
        "function": "Accounts",
        "location": "London",
        "manager": "bob.smith",
        "role": "ROLE_EMPLOYEE",
    },
    # ── Level 2 — Manager (L1 Reviewer) ─────────────────────
    {
        "user_id": "MGR001",
        "username": "bob.smith",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Bob Smith",
        "email": "bob.smith@company.com",
        "department": "Operations",
        "function": "Supply Chain",
        "location": "New York",
        "manager": "diana.prince",
        "role": "ROLE_L1_REVIEWER",
    },
    {
        "user_id": "MGR002",
        "username": "eve.carter",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Eve Carter",
        "email": "eve.carter@company.com",
        "department": "IT",
        "function": "Technology",
        "location": "Singapore",
        "manager": "diana.prince",
        "role": "ROLE_L1_REVIEWER",
    },
    # ── Level 3 — Groups ─────────────────────────────────────
    {
        "user_id": "GRP001",
        "username": "frank.miller",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Frank Miller",
        "email": "frank.miller@company.com",
        "department": "Engineering",
        "function": "Process Excellence",
        "location": "Dubai",
        "manager": "diana.prince",
        "role": "ROLE_FUNCTIONAL_REVIEWER",
    },
    {
        "user_id": "GRP002",
        "username": "grace.lee",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Grace Lee",
        "email": "grace.lee@company.com",
        "department": "Engineering",
        "function": "Quality",
        "location": "Tokyo",
        "manager": "diana.prince",
        "role": "ROLE_FUNCTIONAL_HEAD",
    },
    # ── Level 4 — Management ─────────────────────────────────
    {
        "user_id": "ADM001",
        "username": "diana.prince",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Diana Prince",
        "email": "diana.prince@company.com",
        "department": "Corporate",
        "function": "Strategy",
        "location": "New York",
        "manager": "",
        "role": "ROLE_ADMIN",
    },
    {
        "user_id": "ADM002",
        "username": "henry.ford",
        "password_hash": hash_password(DEFAULT_PASSWORD),
        "name": "Henry Ford",
        "email": "henry.ford@company.com",
        "department": "Corporate",
        "function": "IT Governance",
        "location": "New York",
        "manager": "",
        "role": "ROLE_SUPER_ADMIN",
    },
]


def main() -> None:
    # Resolve path relative to this script's location
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / "data"
    data_dir.mkdir(exist_ok=True)

    out_path = data_dir / "users.pkl"
    with open(out_path, "wb") as fh:
        pickle.dump(USERS, fh, protocol=pickle.HIGHEST_PROTOCOL)

    print(f"Seeded {len(USERS)} users → {out_path}")
    print("\nTest credentials (all users):")
    print(f"  Password: {DEFAULT_PASSWORD}")
    print("\nUsernames:")
    for u in USERS:
        print(f"  {u['username']:25s}  [{u['role']}]")


if __name__ == "__main__":
    main()
