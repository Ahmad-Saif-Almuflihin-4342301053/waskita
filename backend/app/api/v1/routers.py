"""
Modular Monolith API v1 Contract Aggregator (`app.api.v1.routers`)
Menggabungkan sub-router domain (Auth, Audit Engine, Sessions, Admin)
serta mempertahankan simbol `search_and_scrape_competitors` untuk kontrak mock unit test.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin_endpoints,
    audit_endpoints,
    auth_endpoints,
    session_endpoints,
)
from app.services.serp_scraper import search_and_scrape_competitors

api_router = APIRouter()

api_router.include_router(auth_endpoints.router)
api_router.include_router(audit_endpoints.router)
api_router.include_router(session_endpoints.router)
api_router.include_router(admin_endpoints.router)

__all__ = [
    "api_router",
    "search_and_scrape_competitors",
]
