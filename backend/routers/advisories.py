from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Literal
from bson import ObjectId
from models import Advisory, AdvisoryCreate, AdvisoryUpdate, AdvisoryResponse, User
from auth_utils import get_current_user

router = APIRouter(prefix="/api/advisories", tags=["advisories"])

@router.get("/search", response_model=List[AdvisoryResponse])
async def search_advisories(
    q: str = Query("", description="Search query matching crop, question, or advice text"),
    current_user: User = Depends(get_current_user)
):
    """
    Search crop advisories belonging only to the authenticated user.
    """
    q_clean = q.lower().strip()
    if not q_clean:
        # If query is empty, return all user's advisories
        advisories = await Advisory.find(Advisory.userId == str(current_user.id)).sort(-Advisory.createdAt).to_list()
    else:
        # Case-insensitive regex match in crop, query, or advice fields
        pattern = f"(?i){q_clean}"
        advisories = await Advisory.find(
            Advisory.userId == str(current_user.id),
            (Advisory.crop == {"$regex": pattern}) |
            (Advisory.query == {"$regex": pattern}) |
            (Advisory.advice == {"$regex": pattern})
        ).sort(-Advisory.createdAt).to_list()

    return [AdvisoryResponse.from_mongo(adv) for adv in advisories]

@router.get("/filter", response_model=List[AdvisoryResponse])
async def filter_advisories(
    status: Literal["open", "resolved"] = Query(..., description="Filter status ('open' or 'resolved')"),
    current_user: User = Depends(get_current_user)
):
    """
    Filter crop advisories by open/resolved status, belonging only to the authenticated user.
    """
    advisories = await Advisory.find(
        Advisory.userId == str(current_user.id),
        Advisory.status == status
    ).sort(-Advisory.createdAt).to_list()

    return [AdvisoryResponse.from_mongo(adv) for adv in advisories]

@router.get("", response_model=List[AdvisoryResponse])
async def list_advisories(current_user: User = Depends(get_current_user)):
    """
    List all crop advisories belonging to the authenticated user.
    """
    advisories = await Advisory.find(Advisory.userId == str(current_user.id)).sort(-Advisory.createdAt).to_list()
    return [AdvisoryResponse.from_mongo(adv) for adv in advisories]

@router.get("/{id}", response_model=AdvisoryResponse)
async def get_advisory(id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve details of a single crop advisory. Returns 404 if not found or if owned by another user.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory record not found"
        )

    advisory = await Advisory.get(ObjectId(id))
    if not advisory or advisory.userId != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory record not found"
        )

    return AdvisoryResponse.from_mongo(advisory)

@router.post("", response_model=AdvisoryResponse, status_code=status.HTTP_201_CREATED)
async def create_advisory(payload: AdvisoryCreate, current_user: User = Depends(get_current_user)):
    """
    Log a new crop advisory. Sets userId automatically to the current authenticated user.
    """
    new_adv = Advisory(
        userId=str(current_user.id),
        query=payload.query.strip(),
        crop=payload.crop.strip(),
        advice=payload.advice.strip(),
        status=payload.status
    )
    await new_adv.insert()
    return AdvisoryResponse.from_mongo(new_adv)

@router.put("/{id}", response_model=AdvisoryResponse)
async def update_advisory(id: str, payload: AdvisoryUpdate, current_user: User = Depends(get_current_user)):
    """
    Update advisory properties. Restricts access exclusively to the record owner.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory record not found"
        )

    advisory = await Advisory.get(ObjectId(id))
    if not advisory or advisory.userId != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory record not found"
        )

    # Filter out None fields to perform partial update
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided to update"
        )

    for key, value in update_data.items():
        setattr(advisory, key, value)

    await advisory.save()
    return AdvisoryResponse.from_mongo(advisory)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_advisory(id: str, current_user: User = Depends(get_current_user)):
    """
    Permanently delete an advisory record. Restricts access exclusively to the record owner.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory record not found"
        )

    advisory = await Advisory.get(ObjectId(id))
    if not advisory or advisory.userId != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory record not found"
        )

    await advisory.delete()
    return None
