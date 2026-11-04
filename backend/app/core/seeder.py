import logging
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models.entities import User

logger = logging.getLogger(__name__)


def seed_initial_demo_data():
    """Membuat tabel otomatis dan melakukan verifikasi akun demo (riwayat audit dibiarkan bersih)."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed demo users
        users_to_seed = [
            ("author_demo", "author@waskita.id", "author", "Personal Plan"),
            ("editor_demo", "editor@waskita.id", "editor", "Editorial Pro"),
            ("admin_demo", "admin@waskita.id", "admin", "Enterprise Admin"),
        ]
        for uname, email, role, plan in users_to_seed:
            existing = db.query(User).filter(User.username == uname).first()
            if not existing:
                u = User(
                    username=uname,
                    email=email,
                    password_hash=get_password_hash("password123"),
                    role=role,
                    plan_tier=plan,
                )
                db.add(u)
        db.commit()
        logger.info("Demo users verified/seeded successfully (audit sessions clean for user analysis).")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding initial demo data: {e}")
    finally:
        db.close()
