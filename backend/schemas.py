from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class LegalChunk(BaseModel):
    chunk_id: str
    act_name: str
    section: str
    text: str
    score: Optional[float] = None

class UserQuery(BaseModel):
    query_id: str
    text: str
    language: str = "en"
    timestamp: datetime = Field(default_factory=datetime.now)

class AIResponse(BaseModel):
    query_id: str
    answer: str
    sources: List[LegalChunk]
    disclaimer: str = "Please consult a qualified lawyer before taking any legal action."
    timestamp: datetime = Field(default_factory=datetime.now)

class GuardrailLog(BaseModel):
    query_id: str
    input_text: str
    output_text: str
    safety_passed: bool
    timestamp: datetime = Field(default_factory=datetime.now)
