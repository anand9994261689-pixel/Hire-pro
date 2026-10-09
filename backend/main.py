import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session

from skills import SKILL_MAPPING
from parser import extract_text_from_pdf
from ranking import rank_candidates

# Authentication and Database imports
import models
import schemas
from database import engine, get_db
from auth import hash_password, verify_password, create_access_token, get_current_user

# Initialize database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Screening API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Allow frontend origins
    allow_origin_regex=r"^https?://(?:localhost|127\.0\.0\.1)(?::\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Resume Screening API is running."}

@app.get("/api")
@app.get("/api/")
def read_api_root():
    return {"message": "AI Resume Screening API is running. Use /api/auth/register, /api/auth/login or other endpoints."}

# --- Authentication Routes ---

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user in the system.
    """
    # Check if email is already registered
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Hash password and create user
    hashed_pwd = hash_password(user_in.password)
    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user credentials and return a JWT access token.
    """
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT token with user id and email claims
    access_token = create_access_token(data={"user_id": user.id, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Retrieve profile details of the currently authenticated user.
    """
    return current_user

# --- Protected Application Routes ---

@app.get("/api/categories")
def get_categories(current_user: models.User = Depends(get_current_user)):
    """
    Returns the categories and their associated roles. (Requires authentication)
    """
    return SKILL_MAPPING

@app.post("/api/analyze")
async def analyze_resumes(
    category: str = Form(...),
    role: str = Form(...),
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(get_current_user)
):
    """
    Receives category, role, job description, and a list of PDF resumes.
    Returns a ranked list of candidates. (Requires authentication)
    """
    # Validate category and role
    if category not in SKILL_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid category selected.")
    if role not in SKILL_MAPPING[category]:
        raise HTTPException(status_code=400, detail="Invalid role selected for the given category.")

    skills_list = SKILL_MAPPING[category][role]

    resumes_data = []
    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            continue # Skip non-PDF files
            
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes)
        resumes_data.append({
            "name": file.filename,
            "text": text
        })

    if not resumes_data:
        raise HTTPException(status_code=400, detail="No valid PDF files provided.")

    ranked_candidates = rank_candidates(job_description, skills_list, resumes_data)

    return {"candidates": ranked_candidates}
