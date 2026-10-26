import json
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from app.api.v1.endpoints.audit_endpoints import build_audit_execute_response
from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.entities import AuditSession, User
from app.schemas.audit import (
    AuditExecuteResponse,
    SessionListItem,
    SessionUpdatePatch,
)
from app.services.export_service import (
    export_csv_report,
    export_markdown_report,
    export_pdf_html_report,
)

router = APIRouter(tags=["sessions"])


@router.get("/sessions", response_model=List[SessionListItem])
def list_user_sessions(
    q: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    pinned: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(AuditSession)
        .options(joinedload(AuditSession.metrics))
        .filter(AuditSession.user_id == current_user.user_id)
    )
    filter_pinned = is_pinned if is_pinned is not None else pinned
    if filter_pinned is not None:
        query = query.filter(AuditSession.is_pinned == filter_pinned)
    if q:
        query = query.filter(
            (AuditSession.draft_title.ilike(f"%{q}%")) | (AuditSession.target_query.ilike(f"%{q}%"))
        )

    all_user_sessions = query.order_by(AuditSession.audit_timestamp.desc()).all()

    all_sessions_lookup = {s.session_id: s for s in all_user_sessions}
    chains: Dict[str, List[AuditSession]] = {}

    for s in all_user_sessions:
        curr = s
        visited = set()
        while (
            curr.parent_session_id
            and curr.parent_session_id in all_sessions_lookup
            and curr.parent_session_id not in visited
        ):
            visited.add(curr.session_id)
            curr = all_sessions_lookup[curr.parent_session_id]
        root_id = curr.session_id
        if root_id not in chains:
            chains[root_id] = []
        chains[root_id].append(s)

    representative_sessions = []
    for root_id, chain_sessions in chains.items():
        latest = max(chain_sessions, key=lambda item: (item.turn_number, item.audit_timestamp))
        representative_sessions.append(latest)

    representative_sessions.sort(
        key=lambda item: (not item.is_pinned, -(item.audit_timestamp.timestamp() if item.audit_timestamp else 0))
    )

    results = []
    for s in representative_sessions:
        cds = s.metrics.content_differentiation_score if s.metrics else 0.0
        results.append(
            SessionListItem(
                session_id=s.session_id,
                turn_number=s.turn_number,
                target_query=s.target_query,
                draft_title=s.draft_title,
                draft_word_count=s.draft_word_count,
                audit_timestamp=s.audit_timestamp.isoformat(),
                verdict_status=s.verdict_status,
                content_differentiation_score=cds,
                score_cds=cds,
                is_pinned=s.is_pinned,
                parent_session_id=s.parent_session_id,
            )
        )
    return results


@router.get("/sessions/{session_id}/thread", response_model=List[AuditExecuteResponse])
def get_session_thread(
    session_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Menelusuri ke atas hingga root session (parent_session_id is None),
    kumpulkan seluruh rangkaian turn secara berurutan (turn_number = 1, 2, ...),
    dan kembalikan List[AuditExecuteResponse].
    Dilengkapi verifikasi kepemilikan sesi (Anti-IDOR).
    """
    target_session = db.query(AuditSession).filter(AuditSession.session_id == session_id).first()
    if not target_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sesi audit dengan ID {session_id} tidak ditemukan.",
        )

    if current_user and target_session.user_id and target_session.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak ke sesi audit ini.",
        )

    curr = target_session
    visited_up = set()
    while curr.parent_session_id and curr.parent_session_id not in visited_up:
        visited_up.add(curr.session_id)
        parent = db.query(AuditSession).filter(AuditSession.session_id == curr.parent_session_id).first()
        if not parent:
            break
        curr = parent

    root_session = curr

    thread_nodes: List[AuditSession] = []
    queue = [root_session]
    visited_down = {root_session.session_id}

    while queue:
        node = queue.pop(0)
        thread_nodes.append(node)
        children = db.query(AuditSession).filter(AuditSession.parent_session_id == node.session_id).all()
        for child in children:
            if child.session_id not in visited_down:
                visited_down.add(child.session_id)
                queue.append(child)

    thread_nodes.sort(key=lambda item: (item.turn_number, item.audit_timestamp))

    return [build_audit_execute_response(s) for s in thread_nodes]


@router.get("/sessions/{session_id}", response_model=AuditExecuteResponse)
def get_session_detail(
    session_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    session = db.query(AuditSession).filter(AuditSession.session_id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sesi audit dengan ID {session_id} tidak ditemukan.",
        )
    if current_user and session.user_id and session.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak ke sesi audit ini.",
        )
    return build_audit_execute_response(session)


@router.patch("/sessions/{session_id}")
def update_session(
    session_id: str,
    patch: SessionUpdatePatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(AuditSession).filter(
        AuditSession.session_id == session_id,
        AuditSession.user_id == current_user.user_id,
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sesi dengan ID {session_id} tidak ditemukan.",
        )

    if patch.draft_title is not None:
        session.draft_title = patch.draft_title.strip()
    if patch.is_pinned is not None:
        session.is_pinned = patch.is_pinned

    db.commit()
    db.refresh(session)
    return {
        "status": "success",
        "session_id": session.session_id,
        "draft_title": session.draft_title,
        "is_pinned": session.is_pinned,
    }


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(AuditSession).filter(
        AuditSession.session_id == session_id,
        AuditSession.user_id == current_user.user_id,
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sesi dengan ID {session_id} tidak ditemukan.",
        )

    db.delete(session)
    db.commit()
    return {"status": "success", "message": f"Sesi {session_id} berhasil dihapus."}


@router.get("/sessions/{session_id}/export")
def export_session_report(
    session_id: str,
    format: str = "md",
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    detail = get_session_detail(session_id=session_id, current_user=current_user, db=db)
    data = detail.model_dump()

    fmt = format.lower().strip()
    if fmt == "json":
        return Response(
            content=json.dumps(data, indent=2, ensure_ascii=False),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=waskita_audit_{session_id}.json"},
        )
    elif fmt == "csv":
        csv_str = export_csv_report(data)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=waskita_audit_{session_id}.csv"},
        )
    elif fmt in ("pdf_html", "pdf"):
        html_str = export_pdf_html_report(data)
        return Response(content=html_str, media_type="text/html")
    else:
        md_str = export_markdown_report(data)
        return Response(
            content=md_str,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=waskita_audit_{session_id}.md"},
        )
