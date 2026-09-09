"""
Dashboard aggregate statistics across all collections.
"""

from calendar import month_abbr

from app.models.group_review import GroupReview
from app.models.idea import Idea, IdeaStatus
from app.models.manager_approval import ManagerApproval
from app.schemas.dashboard import (
    DashboardStats,
    FunnelItem,
    MonthlyCount,
    PaginatedIdeas,
    RecentIdeaItem,
)


async def get_dashboard_stats() -> DashboardStats:
    total_submitted = await Idea.count()
    manager_approved = await ManagerApproval.find(
        ManagerApproval.decision == "approved"
    ).count()
    group_approved = await GroupReview.find(
        GroupReview.decision == "approved"
    ).count()
    implemented = await Idea.find(Idea.status == IdeaStatus.IMPLEMENTED).count()

    monthly = await _monthly_submissions()
    funnel = await _by_category_funnel()

    return DashboardStats(
        total_submitted=total_submitted,
        manager_approved=manager_approved,
        group_approved=group_approved,
        implemented=implemented,
        monthly_submissions=monthly,
        by_function_funnel=funnel,
    )


async def _monthly_submissions() -> list[MonthlyCount]:
    pipeline = [
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
    ]
    results = await Idea.aggregate(pipeline).to_list()
    monthly = [
        MonthlyCount(
            month=month_abbr[r["_id"]["month"]],
            year=r["_id"]["year"],
            count=r["count"],
        )
        for r in results
    ]
    return monthly[-7:] if len(monthly) > 7 else monthly


async def _by_category_funnel() -> list[FunnelItem]:
    submitted_agg = await Idea.aggregate(
        [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    ).to_list()
    l1_agg = await ManagerApproval.aggregate(
        [
            {"$match": {"decision": "approved"}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        ]
    ).to_list()
    l2_agg = await GroupReview.aggregate(
        [
            {"$match": {"decision": "approved"}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        ]
    ).to_list()

    submitted_map = {r["_id"]: r["count"] for r in submitted_agg}
    l1_map = {r["_id"]: r["count"] for r in l1_agg}
    l2_map = {r["_id"]: r["count"] for r in l2_agg}

    categories = sorted(
        submitted_map.keys(), key=lambda c: submitted_map[c], reverse=True
    )
    return [
        FunnelItem(
            category=cat,
            submitted=submitted_map.get(cat, 0),
            l1_approved=l1_map.get(cat, 0),
            l2_approved=l2_map.get(cat, 0),
        )
        for cat in categories
    ]


async def get_recent_ideas(page: int, limit: int) -> PaginatedIdeas:
    total = await Idea.count()
    pages = max(1, (total + limit - 1) // limit)

    ideas = (
        await Idea.find()
        .sort("-created_at")
        .skip((page - 1) * limit)
        .limit(limit)
        .to_list()
    )

    if not ideas:
        return PaginatedIdeas(items=[], total=total, page=page, pages=pages)

    idea_ids = [str(idea.id) for idea in ideas]

    approvals = (
        await ManagerApproval.find({"idea_id": {"$in": idea_ids}})
        .sort("+created_at")
        .to_list()
    )
    approval_map: dict[str, ManagerApproval] = {}
    for a in approvals:
        approval_map[a.idea_id] = a  # latest overwrites

    reviews = (
        await GroupReview.find({"idea_id": {"$in": idea_ids}})
        .sort("+created_at")
        .to_list()
    )
    review_map: dict[str, GroupReview] = {}
    for r in reviews:
        review_map[r.idea_id] = r

    items = []
    for idea in ideas:
        iid = str(idea.id)
        approval = approval_map.get(iid)
        review = review_map.get(iid)
        items.append(
            RecentIdeaItem(
                id=iid,
                submission_number=idea.submission_number,
                idea_title=idea.idea_title,
                category=idea.category,
                submitter_name=idea.submitter_name,
                status=idea.status.value,
                l1_decision=approval.decision if approval else None,
                l2_score=review.weighted_score if review else None,
                created_at=idea.created_at,
            )
        )

    return PaginatedIdeas(items=items, total=total, page=page, pages=pages)
