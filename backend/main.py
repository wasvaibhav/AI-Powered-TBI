import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime, timezone
from dotenv import load_dotenv
import google.generativeai as genai

# Beanie and Motor imports
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

# Model and Auth imports
from models import User, Advisory, ChatMessage, ChatMessageResponse, UserResponse
from auth_utils import get_current_user, get_password_hash
from routers.auth import router as auth_router
from routers.advisories import router as advisories_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agri-allied-backend")

load_dotenv()

# Google Gemini API Key
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logger.warning("GEMINI_API_KEY is not set in the environment or .env file.")

genai.configure(api_key=gemini_api_key or "")

# Seeding function
async def seed_database():
    user_count = await User.count()
    if user_count == 0:
        logger.info("Database is empty. Seeding test supervisor and crop advisories...")
        
        # Create test supervisor
        hashed_pwd = get_password_hash("password123")
        test_user = User(
            name="Uttarakhand Supervisor",
            email="supervisor@agriallied.org",
            phone="9876543210",
            hashed_password=hashed_pwd
        )
        await test_user.insert()
        user_id_str = str(test_user.id)
        
        # Create 5 crop advisories
        samples = [
            {
                "query": "My Munsyari Rajma leaves have brown circular spots with yellow halos. What is this?",
                "crop": "Munsyari Rajma (Kidney Beans)",
                "advice": "This indicates Anthracnose, a common fungal disease in high-altitude, humid climates. Treatment: 1. Remove and destroy infected plant parts immediately. 2. Spray dilute copper hydroxide or a home-made bio-fungicide (Panchagavya or sour buttermilk spray) weekly. 3. Ensure proper spacing to improve ventilation under terraced rain conditions.",
                "status": "open",
                "createdAt": datetime(2026, 6, 15, 9, 30, 0, tzinfo=timezone.utc)
            },
            {
                "query": "How can I prevent codling moth infestations in my Ramgarh apple orchards organically?",
                "crop": "Apple",
                "advice": "To manage Codling Moth organically in Uttarakhand: 1. Deploy pheromone traps at 10-12 traps per acre to monitor and disrupt mating. 2. Wrap tree trunks with corrugated cardboard bands in July to trap pupating larvae; remove and burn them in winter. 3. Apply Neem Seed Kernel Extract (NSKE 5%) or spinosad sprays during peak larval activity (petal fall stage).",
                "status": "resolved",
                "createdAt": datetime(2026, 6, 20, 14, 15, 0, tzinfo=timezone.utc)
            },
            {
                "query": "Finger millet (Mandua) is developing white mold patches during storage. What is the solution?",
                "crop": "Mandua (Finger Millet)",
                "advice": "Storage mold is caused by high moisture content. Action plan: 1. Immediately spread the affected Mandua grains under the sun until the moisture level drops below 10-12%. 2. Store grains in airtight containers or metal bins rather than damp jute bags. 3. Mix in dried neem leaves or clean ash at a ratio of 1:100 to prevent insect and mold build-up.",
                "status": "resolved",
                "createdAt": datetime(2026, 6, 25, 11, 0, 0, tzinfo=timezone.utc)
            },
            {
                "query": "High-altitude tomatoes are showing dark brown spots on lower leaves, spreading upwards.",
                "crop": "Tomato",
                "advice": "This symptom points to Early Blight. To manage: 1. Prune the lower branches up to 1 foot from the ground to prevent soil-borne splash transmission. 2. Spray a biological fungicide containing Trichoderma viride or Bacillus subtilis. 3. Avoid overhead irrigation; water at the base to keep foliage dry.",
                "status": "open",
                "createdAt": datetime(2026, 7, 1, 8, 45, 0, tzinfo=timezone.utc)
            },
            {
                "query": "Gahat (Horsegram) leaves are turning yellow and growth is stunted on terraced slopes.",
                "crop": "Gahat (Horsegram)",
                "advice": "Yellowing and stunting in horsegram on sloped terraces often indicates nitrogen deficiency or root rot from poor drainage. Solutions: 1. Ensure terrace contour channels are clear so rainwater does not pool. 2. Apply well-rotted farmyard manure (FYM) mixed with bio-fertilizers like Rhizobium to fix nitrogen. 3. Avoid overwatering; horsegram is highly drought-tolerant and sensitive to waterlogging.",
                "status": "open",
                "createdAt": datetime(2026, 7, 3, 16, 20, 0, tzinfo=timezone.utc)
            }
        ]
        
        for sample in samples:
            adv = Advisory(
                userId=user_id_str,
                query=sample["query"],
                crop=sample["crop"],
                advice=sample["advice"],
                status=sample["status"],
                createdAt=sample["createdAt"]
            )
            await adv.insert()
        logger.info("Successfully seeded database with supervisor account and 5 advisories.")

# Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retrieve MONGO_URI
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        logger.error("MONGO_URI is missing from environmental variables or .env file.")
        raise Exception("MONGO_URI environment variable is not set")
    
    # Initialize Motor client and Beanie ODM
    logger.info("Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_uri)
    db = client["agri_allied"]
    await init_beanie(database=db, document_models=[User, Advisory, ChatMessage])
    logger.info("Connected to MongoDB, initialized Beanie documents.")
    
    # Seed database
    await seed_database()
    
    yield
    client.close()
    logger.info("MongoDB client connection closed.")

app = FastAPI(title="Agri-Allied Backend API", version="1.0", lifespan=lifespan)

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

# Include Routers
app.include_router(auth_router)
app.include_router(advisories_router)

# Chat Advisory Proxy logic with persistence per user
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
async def chat_endpoint(request: ChatRequest, current_user: User = Depends(get_current_user)):
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
        
        # PERSIST the exchange in MongoDB
        # 1. Save user's question
        user_message_text = request.messages[-1].content
        user_msg = ChatMessage(
            userId=str(current_user.id),
            role="user",
            content=user_message_text
        )
        await user_msg.insert()
        
        # 2. Save AI's response
        ai_msg = ChatMessage(
            userId=str(current_user.id),
            role="assistant",
            content=ai_reply
        )
        await ai_msg.insert()
        
        return {"reply": ai_reply}
        
    except Exception as e:
        logger.error(f"Error communicating with Gemini API or persisting message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to communicate with the agricultural advisory AI: {str(e)}"
        )

@app.get("/api/chat/history", response_model=List[ChatMessageResponse])
async def get_chat_history(current_user: User = Depends(get_current_user)):
    """
    Retrieve past chat logs for the authenticated supervisor, sorted chronologically (ascending).
    """
    chat_logs = await ChatMessage.find(ChatMessage.userId == str(current_user.id)).sort(ChatMessage.createdAt).to_list()
    return [ChatMessageResponse.from_mongo(msg) for msg in chat_logs]

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "api_key_configured": bool(gemini_api_key)
    }
