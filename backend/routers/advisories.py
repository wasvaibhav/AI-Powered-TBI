from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Literal
from models import Advisory, AdvisoryCreate, AdvisoryUpdate
import store

# We do not use prefix in APIRouter if main.py specifies it, 
# but to keep it simple, let's set prefix="/api/advisories" here and include it.
router = APIRouter(prefix="/api/advisories", tags=["advisories"])

@router.get("/search", response_model=List[Advisory])
async def search_advisories(q: str = Query("", description="Search query matching crop, question, or advice text")):
    return store.search_advisories(q)

@router.get("/filter", response_model=List[Advisory])
async def filter_advisories(status: Literal["open", "resolved"] = Query(..., description="Filter status ('open' or 'resolved')")):
    return store.filter_advisories_by_status(status)

@router.get("", response_model=List[Advisory])
async def list_advisories():
    return store.get_all_advisories()

@router.get("/{id}", response_model=Advisory)
async def get_advisory(id: str):
    advisory = store.get_advisory_by_id(id)
    if not advisory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Advisory with ID '{id}' not found"
        )
    return advisory

@router.post("", response_model=Advisory, status_code=status.HTTP_201_CREATED)
async def create_advisory(payload: AdvisoryCreate):
    # Payload is automatically validated by Pydantic. 
    # Any Pydantic validation error is converted to 400 in main.py validation_exception_handler.
    return store.create_advisory(payload.model_dump())

@router.put("/{id}", response_model=Advisory)
async def update_advisory(id: str, payload: AdvisoryUpdate):
    # Filter out None fields to support partial update
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="At least one field (query, crop, advice, status) must be provided to update"
        )
        
    updated = store.update_advisory(id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Advisory with ID '{id}' not found"
        )
    return updated

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_advisory(id: str):
    deleted = store.delete_advisory(id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Advisory with ID '{id}' not found"
        )
    return None
