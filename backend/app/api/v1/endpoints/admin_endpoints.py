from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user, get_current_user_optional
from app.models.entities import User
from app.schemas.audit import ThresholdConfig

router = APIRouter(tags=["admin"])

_GLOBAL_THRESHOLDS = ThresholdConfig()


@router.get("/admin/thresholds", response_model=ThresholdConfig)
def get_admin_thresholds(
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    return _GLOBAL_THRESHOLDS


@router.put("/admin/thresholds", response_model=ThresholdConfig)
def update_admin_thresholds(
    new_thresholds: ThresholdConfig,
    current_user: User = Depends(get_current_user),
):
    global _GLOBAL_THRESHOLDS
    if current_user.role not in ("admin", "editor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya peran Admin atau Editor yang memiliki wewenang mengubah ambang batas sistem.",
        )
    _GLOBAL_THRESHOLDS = new_thresholds
    return _GLOBAL_THRESHOLDS
