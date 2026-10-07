"""
Email notification service for IdeaHub.

Sends transactional emails via the Microsoft Graph Mail.Send API.
All failures are logged and swallowed so they never block the main
request path — idea submission succeeds even if the email fails.

Required configuration:
  GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_TENANT_ID  — Graph app credentials
  GRAPH_MAIL_SENDER                                       — From mailbox (licensed Exchange)
  FRONTEND_URL                                            — used to build the review link

Required Graph app permission: Mail.Send
"""

import structlog

from app.core.config import settings
from app.integrations.graph_client import graph_client

logger = structlog.get_logger(__name__)


def _idea_submitted_html(
    manager_name: str,
    submitter_name: str,
    submitter_email: str,
    submission_number: str,
    category: str,
    idea_title: str | None,
    problem: str,
    idea_description: str,
    review_url: str,
) -> str:
    title_row = (
        f"<tr><td style='{_LABEL}'> Idea Title</td>"
        f"<td style='{_VALUE}'>{_esc(idea_title)}</td></tr>"
        if idea_title else ""
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;
                    box-shadow:0 1px 4px rgba(0,0,0,.12);">

        <!-- Header -->
        <tr>
          <td style="background:#FBF8F9;padding:24px 32px;border-top:4px solid #A97388;">
            <span style="color:#76505F;font-size:20px;font-weight:700;
                         letter-spacing:.5px;">&#128161; IdeaHub</span>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:15px;color:#333;">
            Hi <strong>{_esc(manager_name)}</strong>,
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            <strong>{_esc(submitter_name)}</strong>
            ({_esc(submitter_email)}) has submitted a new idea that is
            awaiting your review and approval.
          </p>

          <!-- Idea details table -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #e5e7eb;border-radius:6px;
                        border-collapse:collapse;font-size:14px;">
            <tr style="background:#f9fafb;">
              <td colspan="2" style="padding:10px 16px;font-weight:700;
                                     color:#111;border-bottom:1px solid #e5e7eb;">
                Idea Details &nbsp;
                <span style="font-weight:400;color:#6b7280;">
                  {_esc(submission_number)}
                </span>
              </td>
            </tr>
            <tr>
              <td style="{_LABEL}">Category</td>
              <td style="{_VALUE}">{_esc(category)}</td>
            </tr>
            {title_row}
            <tr>
              <td style="{_LABEL}">Problem Statement</td>
              <td style="{_VALUE}">{_esc(problem)}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="{_LABEL}">Proposed Solution</td>
              <td style="{_VALUE}">{_esc(idea_description)}</td>
            </tr>
          </table>

          <!-- CTA button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
            <tr><td align="center">
              <a href="{review_url}"
                 style="display:inline-block;padding:12px 32px;
                        border:1px solid #7c5363;;color:#A97388;
                        font-size:15px;font-weight:600;
                        text-decoration:none;border-radius:6px;
                        letter-spacing:.3px;">
                Review &amp; Approve Idea &#8594;
              </a>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
            Or copy this link into your browser:<br/>
            <a href="{review_url}" style="color:#6b7280;">{review_url}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#FBF8F9;padding:16px 32px;
                     border-top:1px solid #A97388;
                     font-size:12px;color:#9ca3af;text-align:center;">
            This is an automated message from IdeaHub. Please do not reply.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


_LABEL = "padding:10px 16px;color:#6b7280;font-weight:600;width:170px;vertical-align:top;border-top:1px solid #e5e7eb;"
_VALUE = "padding:10px 16px;color:#111;vertical-align:top;border-top:1px solid #e5e7eb;"


def _esc(text: str | None) -> str:
    """Minimal HTML escaping for user-supplied strings."""
    if not text:
        return ""
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
    )


def _manager_approved_html(
    lead_name: str,
    submitter_name: str,
    submitter_email: str,
    submission_number: str,
    category: str,
    idea_title: str | None,
    problem: str,
    idea_description: str,
    manager_name: str,
    reviewer_comment: str,
    review_url: str,
) -> str:
    title_row = (
        f"<tr><td style='{_LABEL}'>Idea Title</td>"
        f"<td style='{_VALUE}'>{_esc(idea_title)}</td></tr>"
        if idea_title else ""
    )
    comment_row = (
        f"<tr><td style='{_LABEL}'>Manager's Comment</td>"
        f"<td style='{_VALUE}'>{_esc(reviewer_comment)}</td></tr>"
        if reviewer_comment else ""
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;
                    box-shadow:0 1px 4px rgba(0,0,0,.12);">

        <!-- Header -->
        <tr>
          <td style="background:#FBF8F9;padding:24px 32px;border-top:4px solid #A97388;">
            <span style="color:#76505F;font-size:20px;font-weight:700;
                         letter-spacing:.5px;">&#128161; IdeaHub</span>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:15px;color:#333;">
            Hi <strong>{_esc(lead_name)}</strong>,
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            <strong>{_esc(manager_name)}</strong> has approved an idea submitted by
            <strong>{_esc(submitter_name)}</strong> ({_esc(submitter_email)}).
            It is now ready for committee review.
          </p>

          <!-- Idea details table -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #e5e7eb;border-radius:6px;
                        border-collapse:collapse;font-size:14px;">
            <tr style="background:#f9fafb;">
              <td colspan="2" style="padding:10px 16px;font-weight:700;
                                     color:#111;border-bottom:1px solid #e5e7eb;">
                Idea Details &nbsp;
                <span style="font-weight:400;color:#6b7280;">
                  {_esc(submission_number)}
                </span>
              </td>
            </tr>
            <tr>
              <td style="{_LABEL}">Category</td>
              <td style="{_VALUE}">{_esc(category)}</td>
            </tr>
            {title_row}
            <tr>
              <td style="{_LABEL}">Problem Statement</td>
              <td style="{_VALUE}">{_esc(problem)}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="{_LABEL}">Proposed Solution</td>
              <td style="{_VALUE}">{_esc(idea_description)}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="{_LABEL}">Approved By</td>
              <td style="{_VALUE}">{_esc(manager_name)}</td>
            </tr>
            {comment_row}
          </table>

          <!-- CTA button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
            <tr><td align="center">
              <a href="{review_url}"
                 style="display:inline-block;padding:12px 32px;
                        border:1px solid #7c5363;color:#A97388;
                        font-size:15px;font-weight:600;
                        text-decoration:none;border-radius:6px;
                        letter-spacing:.3px;">
                Review Idea as Committee &#8594;
              </a>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
            Or copy this link into your browser:<br/>
            <a href="{review_url}" style="color:#6b7280;">{review_url}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#FBF8F9;padding:16px 32px;
                     border-top:1px solid #A97388;
                     font-size:12px;color:#9ca3af;text-align:center;">
            This is an automated message from IdeaHub. Please do not reply.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


async def notify_committee_lead_of_approval(
    *,
    category: str,
    submitter_name: str,
    submitter_email: str,
    submission_number: str,
    idea_title: str | None,
    problem: str,
    idea_description: str,
    manager_name: str,
    reviewer_comment: str,
) -> None:
    """
    Send the category committee lead an email when a manager approves an idea.

    Looks up the committee lead from the CategoryCommittee collection.
    Silently logs and returns on any failure so the approval is never blocked.
    """
    if not settings.GRAPH_CLIENT_ID or not settings.GRAPH_MAIL_SENDER:
        logger.debug(
            "notification.skipped",
            reason="Graph credentials or GRAPH_MAIL_SENDER not configured",
        )
        return

    from app.models.category_committee import CategoryCommittee

    try:
        committee = await CategoryCommittee.find_one(
            CategoryCommittee.category_name == category
        )
        if not committee or not committee.committee_lead:
            logger.debug(
                "notification.skipped",
                reason="no committee lead for category",
                category=category,
            )
            return

        lead = committee.committee_lead
        review_url = f"{settings.FRONTEND_URL}/review?mode=management"

        html = _manager_approved_html(
            lead_name=lead.name,
            submitter_name=submitter_name,
            submitter_email=submitter_email,
            submission_number=submission_number,
            category=category,
            idea_title=idea_title,
            problem=problem,
            idea_description=idea_description,
            manager_name=manager_name,
            reviewer_comment=reviewer_comment,
            review_url=review_url,
        )

        await graph_client.send_mail(
            sender=settings.GRAPH_MAIL_SENDER,
            to_email=lead.email,
            to_name=lead.name,
            subject=f"Manager Approved an Idea for Committee Review — {submission_number}",
            html_body=html,
        )

        logger.info(
            "notification.sent",
            submission_number=submission_number,
            committee_lead_email=lead.email,
            category=category,
        )

    except Exception as exc:
        logger.warning(
            "notification.failed",
            submission_number=submission_number,
            category=category,
            error=str(exc),
        )


async def notify_manager_of_new_idea(
    *,
    submitter_id: str,
    submitter_name: str,
    submitter_email: str,
    manager_email: str,
    submission_number: str,
    category: str,
    idea_title: str | None,
    problem: str,
    idea_description: str,
) -> None:
    """
    Send the manager a notification email when a new idea is submitted.

    Resolves the manager's display name from Graph (falls back to email).
    Silently logs and returns on any failure so submission is never blocked.
    """
    if not settings.GRAPH_CLIENT_ID or not settings.GRAPH_MAIL_SENDER:
        logger.debug(
            "notification.skipped",
            reason="Graph credentials or GRAPH_MAIL_SENDER not configured",
        )
        return

    if not manager_email:
        logger.debug("notification.skipped", reason="manager email unknown", submitter=submitter_email)
        return

    try:
        # Try to get the manager's display name from Graph
        manager_info = await graph_client.get_user_manager(submitter_id)
        manager_name = manager_info["name"] if manager_info else manager_email

        review_url = f"{settings.FRONTEND_URL}/review?mode=manager"

        html = _idea_submitted_html(
            manager_name=manager_name,
            submitter_name=submitter_name,
            submitter_email=submitter_email,
            submission_number=submission_number,
            category=category,
            idea_title=idea_title,
            problem=problem,
            idea_description=idea_description,
            review_url=review_url,
        )

        await graph_client.send_mail(
            sender=settings.GRAPH_MAIL_SENDER,
            to_email=manager_email,
            to_name=manager_name,
            subject=f"New Idea Submitted for Your Review — {submission_number}",
            html_body=html,
        )

        logger.info(
            "notification.sent",
            submission_number=submission_number,
            manager_email=manager_email,
        )

    except Exception as exc:
        logger.warning(
            "notification.failed",
            submission_number=submission_number,
            manager_email=manager_email,
            error=str(exc),
        )
