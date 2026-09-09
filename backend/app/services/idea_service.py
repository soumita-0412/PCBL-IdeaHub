"""
Business logic for idea submission and retrieval.

Submitter identity is always taken from the authenticated JWT (CurrentUser),
never from the request body, so users cannot submit as someone else.
"""

from app.models.group_review import GroupReview
from app.models.idea import Idea, IdeaStatus
from app.models.manager_approval import ManagerApproval
from app.repositories.group_review_repository import GroupReviewRepository
from app.repositories.idea_repository import IdeaRepository
from app.repositories.manager_approval_repository import ManagerApprovalRepository
from app.schemas.auth import CurrentUser
from app.schemas.idea import IdeaCreate, IdeaL2ReviewUpdate, IdeaResponse, IdeaListItem, IdeaReviewUpdate, IdeaStats

_repo = IdeaRepository()
_approval_repo = ManagerApprovalRepository()
_group_review_repo = GroupReviewRepository()


async def submit_idea(payload: IdeaCreate, actor: CurrentUser) -> IdeaResponse:
    submission_number = await _repo.next_submission_number()

    idea = Idea(
        submission_number=submission_number,
        submitter_id=actor.user_id,
        submitter_name=actor.name,
        submitter_email=actor.email,
        category=payload.category,
        problem=payload.problem,
        idea_description=payload.idea_description,
        patent_search_done=payload.patent_search_done,
        patent_link=payload.patent_link if payload.patent_search_done else None,
        pcbl_function=payload.pcbl_function,
        pcbl_function_other=payload.pcbl_function_other if payload.pcbl_function == "Other" else None,
        annual_estimate=payload.annual_estimate,
        additional_info=payload.additional_info,
    )
    await idea.save_with_actor(actor.user_id)

    return _to_response(idea)


async def get_my_ideas(actor: CurrentUser) -> list[IdeaListItem]:
    ideas = await _repo.find_by_submitter(actor.user_id)
    return [_to_list_item(i) for i in ideas]


_IN_REVIEW_STATUSES = {
    IdeaStatus.SUBMITTED,
    IdeaStatus.UNDER_REVIEW_L1,
    IdeaStatus.APPROVED_L1,
    IdeaStatus.UNDER_REVIEW_L2,
}

_APPROVED_STATUSES = {
    IdeaStatus.APPROVED_L2,
    IdeaStatus.IMPLEMENTED,
}


async def get_my_stats(actor: CurrentUser) -> IdeaStats:
    ideas = await _repo.find_by_submitter(actor.user_id)
    return IdeaStats(
        total=len(ideas),
        in_review=sum(1 for i in ideas if i.status in _IN_REVIEW_STATUSES),
        approved=sum(1 for i in ideas if i.status in _APPROVED_STATUSES),
    )


async def get_all_ideas() -> list[IdeaResponse]:
    ideas = await _repo.find_all()
    return [_to_response(i) for i in ideas]


async def review_idea(idea_id: str, payload: IdeaReviewUpdate, actor: CurrentUser) -> IdeaResponse | None:
    idea = await _repo.get_by_id(idea_id)
    if idea is None:
        return None
    idea.status = payload.status
    idea.reviewer_comment = payload.reviewer_comment
    await idea.save_with_actor(actor.user_id)

    decision = "approved" if payload.status == IdeaStatus.APPROVED_L1 else "rejected"
    approval = ManagerApproval(
        idea_id=str(idea.id),
        submission_number=idea.submission_number,
        category=idea.category,
        problem=idea.problem,
        idea_description=idea.idea_description,
        additional_info=idea.additional_info,
        annual_estimate=idea.annual_estimate,
        employee_name=idea.submitter_name,
        employee_email=idea.submitter_email,
        decision=decision,
        reviewer_comment=payload.reviewer_comment,
        reviewed_by=actor.user_id,
        reviewed_by_name=actor.name,
        reviewed_by_email=actor.email,
    )
    await approval.save_with_actor(actor.user_id)

    return _to_response(idea)


_L2_DECISION_MAP = {
    IdeaStatus.APPROVED_L2: "approved",
    IdeaStatus.UNDER_REVIEW_L2: "held",
    IdeaStatus.REJECTED_L2: "declined",
}


async def l2_review_idea(idea_id: str, payload: IdeaL2ReviewUpdate, actor: CurrentUser) -> IdeaResponse | None:
    idea = await _repo.get_by_id(idea_id)
    if idea is None:
        return None
    idea.status = payload.status
    idea.l2_scores = payload.l2_scores
    idea.l2_weighted_score = payload.l2_weighted_score
    idea.l2_comment = payload.l2_comment
    await idea.save_with_actor(actor.user_id)

    manager_approval = await _approval_repo.get_by_id(payload.manager_approval_id)
    if manager_approval:
        manager_approval.l2_reviewed = True
        await manager_approval.save_with_actor(actor.user_id)

    group_review = GroupReview(
        idea_id=str(idea.id),
        submission_number=idea.submission_number,
        manager_approval_id=payload.manager_approval_id,
        category=idea.category,
        problem=idea.problem,
        idea_description=idea.idea_description,
        additional_info=idea.additional_info,
        annual_estimate=idea.annual_estimate,
        employee_name=idea.submitter_name,
        employee_email=idea.submitter_email,
        manager_who_approved_name=manager_approval.reviewed_by_name if manager_approval else "",
        manager_who_approved_email=manager_approval.reviewed_by_email if manager_approval else "",
        criteria_scores=payload.l2_scores,
        weighted_score=payload.l2_weighted_score,
        decision=_L2_DECISION_MAP.get(payload.status, "unknown"),
        qualitative_feedback=payload.l2_comment,
        next_step=payload.l2_next_step,
        expected_timeline=payload.l2_expected_timeline,
        reviewed_by=actor.user_id,
        reviewed_by_name=actor.name,
        reviewed_by_email=actor.email,
    )
    await group_review.save_with_actor(actor.user_id)

    return _to_response(idea)


async def get_idea_by_id(idea_id: str, actor: CurrentUser) -> IdeaResponse | None:
    idea = await _repo.get_by_id(idea_id)
    if idea is None:
        return None
    return _to_response(idea)


def _to_response(idea: Idea) -> IdeaResponse:
    return IdeaResponse(
        id=str(idea.id),
        submission_number=idea.submission_number,
        status=idea.status,
        category=idea.category,
        problem=idea.problem,
        idea_description=idea.idea_description,
        patent_search_done=idea.patent_search_done,
        patent_link=idea.patent_link,
        pcbl_function=idea.pcbl_function,
        pcbl_function_other=idea.pcbl_function_other,
        annual_estimate=idea.annual_estimate,
        additional_info=idea.additional_info,
        submitter_id=idea.submitter_id,
        submitter_name=idea.submitter_name,
        submitter_email=idea.submitter_email,
        reviewer_comment=idea.reviewer_comment,
        l2_scores=idea.l2_scores,
        l2_comment=idea.l2_comment,
        l2_weighted_score=idea.l2_weighted_score,
        created_at=idea.created_at,
        updated_at=idea.updated_at,
    )


def _to_list_item(idea: Idea) -> IdeaListItem:
    return IdeaListItem(
        id=str(idea.id),
        submission_number=idea.submission_number,
        status=idea.status,
        category=idea.category,
        pcbl_function=idea.pcbl_function,
        submitter_name=idea.submitter_name,
        submitter_email=idea.submitter_email,
        created_at=idea.created_at,
    )
