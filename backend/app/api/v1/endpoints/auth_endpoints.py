from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.models.entities import AuditSession, User
from app.schemas.audit import (
    AuthTokenResponse,
    LoginRequest,
    RegisterRequest,
    UserProfileSchema,
)

router = APIRouter(tags=["auth"])


@router.post("/auth/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == req.username) | (User.email == req.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username atau email sudah terdaftar dalam sistem.",
        )

    new_user = User(
        username=req.username,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role=req.role if req.role in ("author", "editor", "admin") else "author",
        plan_tier="Personal Plan",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.username, "role": new_user.role})
    profile = UserProfileSchema(
        user_id=new_user.user_id,
        username=new_user.username,
        email=new_user.email,
        role=new_user.role,
        plan_tier=new_user.plan_tier,
        session_quota=100,
        used_sessions=0,
    )
    return AuthTokenResponse(access_token=token, user=profile)


@router.post("/auth/login", response_model=AuthTokenResponse)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == req.username_or_email) | (User.email == req.username_or_email)
    ).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kredensial login tidak valid. Silakan periksa kembali username dan kata sandi Anda.",
        )

    token = create_access_token({"sub": user.username, "role": user.role})
    used_count = db.query(AuditSession).filter(AuditSession.user_id == user.user_id).count()
    profile = UserProfileSchema(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        role=user.role,
        plan_tier=user.plan_tier,
        session_quota=100,
        used_sessions=used_count,
    )
    return AuthTokenResponse(access_token=token, user=profile)


@router.get("/auth/me", response_model=UserProfileSchema)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    used_count = db.query(AuditSession).filter(AuditSession.user_id == current_user.user_id).count()
    return UserProfileSchema(
        user_id=current_user.user_id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        plan_tier=current_user.plan_tier,
        session_quota=100,
        used_sessions=used_count,
    )
