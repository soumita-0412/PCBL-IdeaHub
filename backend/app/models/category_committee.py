from typing import Annotated

from beanie import Indexed

from app.models.base import BaseDocument
from app.models.category import CommitteePerson


class CategoryCommittee(BaseDocument):
    category_name: Annotated[str, Indexed(unique=True)]
    committee_lead: CommitteePerson | None = None
    committee_members: list[CommitteePerson] = []

    class Settings:
        name = "category_committee"
        use_state_management = True
        validate_on_save = True
