import io
import re
from PyPDF2 import PdfReader

# Tokens that are NOT part of education, experience, or meaningful resume sections.
# These appear in skills/tools sections but can bleed into education lines after PDF extraction.
_NOISE_TOKENS = [
    "LeetCode", "HackerRank", "GitHub", "GitLab", "Bitbucket",
    "Programming", "Coding", "DSA", "GeeksforGeeks", "CodeChef",
    "Codeforces", "HackerEarth", "Kaggle", "Stack Overflow",
    "LinkedIn", "Twitter", "Portfolio", "Resume", "Curriculum Vitae",
]

def clean_resume_text(text: str) -> str:
    """
    Removes known noise tokens (skill platform names, social links, etc.) and
    normalises whitespace so education / experience extractors see clean line breaks.

    Called BEFORE any section-level parsing.
    """
    # 1. Remove noise tokens (case-sensitive match with word boundary)
    for token in _NOISE_TOKENS:
        text = re.sub(rf"\b{re.escape(token)}\b", " ", text, flags=re.IGNORECASE)

    # 2. Remove bare URLs (http/https/www)
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)

    # 3. Remove email addresses
    text = re.sub(r"\S+@\S+\.\S+", " ", text)

    # 4. Collapse multiple spaces / tabs into a single space per line
    lines = text.split("\n")
    cleaned_lines = [re.sub(r"[ \t]+", " ", line).strip() for line in lines]

    # 5. Drop lines that became empty after cleaning
    cleaned_lines = [l for l in cleaned_lines if l]

    return "\n".join(cleaned_lines)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file provided as a byte stream,
    then applies noise cleaning before returning.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
        raw = text.strip()
        return clean_resume_text(raw)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""
