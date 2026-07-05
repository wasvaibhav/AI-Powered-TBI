import os
import logging
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai

# Import the advisories router
from routers.advisories import router as advisories_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agri-allied-backend")

load_dotenv()

# Google Gemini API Key
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logger.warning("GEMINI_API_KEY is not set in the environment or .env file.")

genai.configure(api_key=gemini_api_key or "")

app = FastAPI(title="Agri-Allied Backend API", version="1.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handlers

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP exception on {request.url.path}: {exc.detail} (Status: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for error in exc.errors():
        # Build readable field path
        loc = " -> ".join(str(l) for l in error.get("loc", []))
        msg = error.get("msg")
        error_messages.append(f"{loc}: {msg}")
    
    clean_message = "Validation Error: " + "; ".join(error_messages)
    logger.warning(f"Validation error on {request.url.path}: {clean_message}")
    return JSONResponse(
        status_code=400,
        content={"detail": clean_message}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception occurred on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact the administrator."}
    )

# Include Router
app.include_router(advisories_router)

# Chat Advisory (Gemini Proxy) logic kept as-is
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

SYSTEM_PROMPT = (
    "You are an agricultural advisor for field supervisors growing mountain crops "
    "in Uttarakhand, India. Only answer questions about crop diseases, pest "
    "management, organic farming, and post-harvest handling. Give practical, "
    "step-by-step, simple advice. If asked anything unrelated to agriculture, "
    "politely decline and steer back to farming. End every answer reminding the "
    "user to verify with a licensed extension officer."
)

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not gemini_api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API Key is not configured on the server. Please set GEMINI_API_KEY in your .env file."
        )
    
    if not request.messages:
        raise HTTPException(status_code=400, detail="Conversation history cannot be empty.")
    
    # Structure conversation history for Gemini SDK
    formatted_contents = []
    for msg in request.messages:
        role = 'model' if msg.role in ['assistant', 'model'] else 'user'
        formatted_contents.append({
            'role': role,
            'parts': [msg.content]
        })
    
    try:
        logger.info(f"Sending request to Gemini API. Message count: {len(formatted_contents)}")
        
        # Try gemini-2.0-flash first
        try:
            model = genai.GenerativeModel(
                model_name='gemini-2.0-flash',
                system_instruction=SYSTEM_PROMPT
            )
            response = model.generate_content(formatted_contents)
        except Exception as e:
            logger.warning(f"Failed with gemini-2.0-flash, attempting gemini-1.5-flash fallback. Error: {str(e)}")
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=SYSTEM_PROMPT
            )
            response = model.generate_content(formatted_contents)
            
        ai_reply = response.text
        return {"reply": ai_reply}
        
    except Exception as e:
        logger.error(f"Error communicating with Gemini API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to communicate with the agricultural advisory AI: {str(e)}"
        )

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "api_key_configured": bool(gemini_api_key)
    }
