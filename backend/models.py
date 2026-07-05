from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

class AdvisoryBase(BaseModel):
    query: str = Field(..., min_length=1, description="The supervisor's question, e.g., 'Yellow spots on beans'")
    crop: str = Field(..., min_length=1, description="The crop name, e.g., 'Beans'")
    advice: str = Field(..., min_length=1, description="The expert/AI advice text")
    status: Literal["open", "resolved"] = Field("open", description="Advisory status")

class AdvisoryCreate(AdvisoryBase):
    pass

class AdvisoryUpdate(BaseModel):
    query: Optional[str] = Field(None, min_length=1)
    crop: Optional[str] = Field(None, min_length=1)
    advice: Optional[str] = Field(None, min_length=1)
    status: Optional[Literal["open", "resolved"]] = None

class Advisory(AdvisoryBase):
    id: str = Field(..., description="UUID as a string")
    createdAt: datetime = Field(..., description="ISO 8601 creation timestamp")
