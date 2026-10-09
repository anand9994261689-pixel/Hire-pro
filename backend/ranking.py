import numpy as np
import spacy
from model import get_embedding

# Load spaCy model for entity extraction
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def compute_cosine_similarity(vec1, vec2):
    """
    Computes the cosine similarity between two vectors.
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot_product / (norm1 * norm2))

def get_eligibility_status(score: float) -> str:
    """
    Returns eligibility status based on the score.
    """
    if score >= 0.75:
        return "Strong Match"
    elif score >= 0.5:
        return "Moderate Match"
    else:
        return "Low Match"


# ── Shared education-extraction constants & helpers ────────────────────────────

_EDU_NOISE_TOKENS = {
    "leetcode", "hackerrank", "github", "gitlab", "bitbucket",
    "geeksforgeeks", "codechef", "codeforces", "hackerearth",
    "kaggle", "stackoverflow", "linkedin", "twitter", "portfolio",
    "programming", "dsa", "coding", "skills", "projects",
}

_DEGREE_KW = [
    "b.tech", "b.e", "b.sc", "bachelor", "m.tech", "m.e", "m.sc",
    "master", "ph.d", "degree", "diploma", "b.a", "m.a", "b.com",
    "m.com", "b.ca", "mca", "bca", "b.ed", "m.ed", "engineering",
]
_HSC_KW = [
    "hsc", "12th", "xii", "higher secondary", "intermediate",
    "plus two", "+2", "class 12",
]
_SSLC_KW = [
    "sslc", "10th", "matriculation", "class 10", "secondary school leaving",
]
_INSTITUTION_KW = [
    "college", "university", "institute", "technology", "school",
    "academy", "polytechnic", "govt", "gov",
]
_GRADE_KW = ["cgpa", "gpa", "percentage", "%", "marks"]
_FALSE_POSITIVE_KW = [
    "masterclass", "bootcamp", "internship", "course",
    "training", "certificate", "workshop",
]
_ALL_LEVEL_GUARDS = [
    "hsc", "sslc", "12th", "10th", "b.tech", "b.e",
    "bachelor", "master", "degree", "diploma", "xii",
]


def _is_edu_noise(line: str) -> bool:
    """Return True if a line contains known noise tokens."""
    ll = line.lower()
    return any(tok in ll for tok in _EDU_NOISE_TOKENS)


def _clean_edu_detail(line: str) -> str:
    """Strip trailing punctuation artefacts."""
    import re
    return re.sub(r"[|•●▪\-–—]+$", "", line).strip()


def _classify_edu_line(line: str):
    """
    Returns (is_degree, is_hsc, is_sslc) booleans for a single line.
    Applies false-positive guards.
    """
    import re
    ll = line.lower()
    is_degree = any(re.search(rf"\b{re.escape(kw)}\b", ll) for kw in _DEGREE_KW)
    is_hsc    = any(re.search(rf"\b{re.escape(kw)}\b", ll) for kw in _HSC_KW)
    is_sslc   = (
        any(re.search(rf"\b{re.escape(kw)}\b", ll) for kw in _SSLC_KW)
        or bool(re.search(r"\bX\b", line))  # Roman numeral X (uppercase only)
    )
    # False-positive suppression
    if any(fp in ll for fp in _FALSE_POSITIVE_KW):
        is_degree = is_hsc = is_sslc = False
    return is_degree, is_hsc, is_sslc


def _try_merge_next(base: str, idx: int, lines: list) -> tuple:
    """
    Look ahead up to 2 lines to merge institution name and grade.
    Returns (merged_string, new_index).
    """
    import re
    result = base
    cur = idx

    if cur + 1 < len(lines):
        nxt = lines[cur + 1]
        nxt_lower = nxt.lower()
        if (
            not _is_edu_noise(nxt)
            and not any(re.search(rf"\b{re.escape(g)}\b", nxt_lower) for g in _ALL_LEVEL_GUARDS)
            and any(kw in nxt_lower for kw in _INSTITUTION_KW)
        ):
            result += " – " + _clean_edu_detail(nxt)
            cur += 1

            if cur + 1 < len(lines):
                nxt2 = lines[cur + 1]
                nxt2_lower = nxt2.lower()
                if (
                    not _is_edu_noise(nxt2)
                    and not any(re.search(rf"\b{re.escape(g)}\b", nxt2_lower) for g in _ALL_LEVEL_GUARDS)
                    and any(kw in nxt2_lower for kw in _GRADE_KW)
                ):
                    result += ", " + _clean_edu_detail(nxt2)
                    cur += 1

    return result, cur


def detect_education_lines(text: str) -> list:
    """
    Fallback: scan ALL lines for education-pattern lines.
    Returns a deduplicated list of lines that look like education entries,
    preserving surrounding context lines (institution/grade lines) needed for merging.

    Used when no Education section heading is found.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    result = []
    seen = set()

    for idx, line in enumerate(lines):
        if _is_edu_noise(line):
            continue
        is_degree, is_hsc, is_sslc = _classify_edu_line(line)
        if not (is_degree or is_hsc or is_sslc):
            continue
        # Collect this line + up to 2 following context lines
        for offset in range(3):
            j = idx + offset
            if j < len(lines) and lines[j] not in seen:
                seen.add(lines[j])
                result.append(lines[j])

    return result


def extract_education(text: str) -> list:
    """
    Two-phase education extractor:

    Phase 1 (primary):   Section-aware — only parses lines within a recognised
                         Education/Academic/Qualification heading block.

    Phase 2 (fallback):  Headingless — if Phase 1 yields nothing, runs
                         detect_education_lines() over the full text and
                         applies the same classifier + merge logic.

    This handles resumes that omit the section heading entirely.
    """
    import re

    EDUCATION_HEADINGS = {
        "education", "academic", "academics", "qualification",
        "qualifications", "educational background", "academic background",
        "educational qualification", "academic qualification",
        "academic details", "educational details",
    }
    NON_EDUCATION_HEADINGS = {
        "experience", "work experience", "professional experience",
        "employment", "internship", "internships", "work history",
        "projects", "academic projects", "skills", "technical skills",
        "certifications", "achievements", "summary", "professional summary",
        "languages", "extracurricular", "courses", "training",
        "hobbies", "interests", "references", "awards", "publications",
        "objective", "career objective",
    }

    # ── Helper: run the classifier+merger over a prepared line list ───────────
    def _parse_lines(lines: list):
        deg, hsc, sslc = [], [], []
        i = 0
        while i < len(lines):
            line = lines[i]
            if _is_edu_noise(line):
                i += 1
                continue
            is_degree, is_hsc, is_sslc = _classify_edu_line(line)
            if is_degree:
                detail, i = _try_merge_next(_clean_edu_detail(line), i, lines)
                deg.append(detail)
            elif is_hsc:
                detail, i = _try_merge_next(_clean_edu_detail(line), i, lines)
                hsc.append(detail)
            elif is_sslc:
                detail, i = _try_merge_next(_clean_edu_detail(line), i, lines)
                sslc.append(detail)
            i += 1
        return deg, hsc, sslc

    # ── Phase 1: section-aware scan ───────────────────────────────────────────
    all_lines = [l.strip() for l in text.split("\n") if l.strip()]
    edu_section_lines = []
    in_edu = False

    for line in all_lines:
        heading = line.strip().rstrip(":").lower()
        if len(line) < 60:
            if heading in NON_EDUCATION_HEADINGS:
                in_edu = False
                continue
            if heading in EDUCATION_HEADINGS:
                in_edu = True
                continue
        if in_edu:
            edu_section_lines.append(line)

    degree_details, hsc_details, sslc_details = _parse_lines(edu_section_lines)

    # ── Phase 2: headingless fallback ─────────────────────────────────────────
    if not degree_details and not hsc_details and not sslc_details:
        fallback_lines = detect_education_lines(text)
        degree_details, hsc_details, sslc_details = _parse_lines(fallback_lines)

    # ── Build output ──────────────────────────────────────────────────────────
    education_list = []
    if degree_details:
        education_list.append({"level": "Degree", "details": "; ".join(degree_details)})
    if hsc_details:
        education_list.append({"level": "12th",   "details": "; ".join(hsc_details)})
    if sslc_details:
        education_list.append({"level": "10th",   "details": "; ".join(sslc_details)})

    return education_list



def extract_experience(text: str) -> list:
    experience_list = []
    lines = [line.strip() for line in text.split('\n')]
    
    experience_headings = ["experience", "work experience", "employment", "professional experience", "internship history", "work history", "employment history", "internships", "internship"]
    boundary_headings = ["education", "projects", "academic projects", "skills", "technical skills", "certifications", "achievements", "summary", "professional summary", "languages", "extracurricular", "courses", "training"]
    
    in_experience_section = False
    
    for line in lines:
        if not line:
            continue
        line_clean = line.strip().rstrip(':')
        line_lower = line_clean.lower()
        
        # Check for boundary heading
        if any(h == line_lower for h in boundary_headings) and len(line_clean) < 30:
            in_experience_section = False
            continue
            
        # Check for experience heading
        if any(h == line_lower for h in experience_headings) and len(line_clean) < 30:
            in_experience_section = True
            continue
            
        if in_experience_section:
            import re
            date_patterns = [
                r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b",
                r"\b\d{2}/\d{4}\b",
                r"\b\d{4}\b"
            ]
            has_date = any(re.search(pat, line_clean, re.IGNORECASE) for pat in date_patterns)
            
            # Exclude training/courses/certifications
            if any(w in line_lower for w in ["course", "training", "certificate", "bootcamp", "30-day", "10-day", "virtual"]):
                continue
                
            role_indicators = ["engineer", "developer", "designer", "intern", "analyst", "consultant", "manager", "lead", "specialist", "freelancer", "coordinator", "officer", "administrator"]
            is_role_line = any(w in line_lower for w in role_indicators) or has_date
            
            if is_role_line and len(line_clean) < 100:
                role = line_clean
                company = ""
                duration = ""
                
                dates = []
                for pat in date_patterns:
                    found = re.findall(pat, line_clean, re.IGNORECASE)
                    if found:
                        dates.extend(found)
                if dates:
                    duration = " - ".join(dates)
                    
                cleaned_line = line_clean
                for d in dates:
                    cleaned_line = cleaned_line.replace(d, "")
                cleaned_line = re.sub(r"\bto\b|\bpresent\b", "", cleaned_line, flags=re.IGNORECASE)
                cleaned_line = re.sub(r"\s+", " ", cleaned_line).strip().strip('-').strip('|').strip(',').strip()
                
                parts = [p.strip() for p in re.split(r"[-|–,]", cleaned_line) if p.strip()]
                if len(parts) >= 2:
                    role = parts[0]
                    company = parts[1]
                elif len(parts) == 1:
                    role = parts[0]
                    
                experience_list.append({
                    "role": role,
                    "company": company,
                    "duration": duration
                })
                
    return experience_list


def extract_all_resume_skills(text: str, skills_list: list) -> list:
    """
    Extracts ALL skills present in the resume text by scanning against the provided
    skills_list (which serves as the master vocabulary). Case-insensitive.
    Returns skills in their original casing from skills_list.
    """
    text_lower = text.lower()
    found = []
    for skill in skills_list:
        if skill.lower() in text_lower:
            found.append(skill)
    return found


def compare_skills(resume_skills: list, jd_skills: list):
    """
    Compares resume skills against JD skills.
    Returns (matched, missing) — both lists in original JD casing.
    Matching is case-insensitive.
    """
    matched = []
    missing = []
    resume_set = set(s.lower() for s in resume_skills)
    for skill in jd_skills:
        if skill.lower() in resume_set:
            matched.append(skill)
        else:
            missing.append(skill)
    return matched, missing


def generate_strengths(matched_skills: list, resume_text: str) -> list:
    """
    Generates strength statements derived ONLY from matched skills and
    project mentions found in the resume text. No generic hardcoded lines.
    """
    import re
    strengths = []
    if not matched_skills:
        return strengths

    # Group matched skills into a readable phrase
    if len(matched_skills) == 1:
        strengths.append(f"Demonstrated experience with {matched_skills[0]}")
    elif len(matched_skills) <= 4:
        skills_str = ", ".join(matched_skills[:-1]) + " and " + matched_skills[-1]
        strengths.append(f"Hands-on experience with {skills_str}")
    else:
        # Split into two groups for readability
        first = ", ".join(matched_skills[:3])
        rest = ", ".join(matched_skills[3:])
        strengths.append(f"Strong proficiency in {first}")
        strengths.append(f"Additional skills include {rest}")

    # Check for project section in resume
    text_lower = resume_text.lower()
    project_keywords = ["built", "developed", "designed", "implemented", "created", "deployed", "integrated"]
    has_projects = any(kw in text_lower for kw in project_keywords)
    if has_projects:
        # Try to pull a relevant skill mentioned near project keywords
        for skill in matched_skills:
            pattern = rf"({'|'.join(project_keywords)}).{{0,60}}{re.escape(skill.lower())}"
            if re.search(pattern, text_lower):
                strengths.append(f"Applied {skill} in real-world project work")
                break

    return strengths


def generate_weaknesses(missing_skills: list, experience_list: list) -> list:
    """
    Generates weakness statements ONLY from missing skills and experience gaps.
    No generic hardcoded lines.
    """
    weaknesses = []
    for skill in missing_skills:
        weaknesses.append(f"Lack of experience in {skill}")
    if not experience_list:
        weaknesses.append("No professional work experience mentioned")
    return weaknesses


def extract_summary_and_skills(text: str, skills_list: list):
    """
    Extracts skills present in the resume and generates a basic text summary.
    """
    resume_skills = extract_all_resume_skills(text, skills_list)
    summary = text[:150].replace('\n', ' ') + "..." if len(text) > 150 else text.replace('\n', ' ')
    return resume_skills, summary


def rank_candidates(job_description: str, skills_list: list, resumes: list):
    """
    Ranks a list of resumes against a job description and required skills.
    resumes: list of dicts {"name": filename, "text": parsed_text}
    """
    target_embedding = get_embedding(job_description)

    results = []
    for resume in resumes:
        if not resume["text"].strip():
            results.append({
                "name": resume["name"],
                "semantic_score": 0.0,
                "skill_score": 0.0,
                "final_score": 0.0,
                "classification": "Low Match",
                "skills": [],
                "summary": "Empty resume."
            })
            continue
            
        resume_embedding = get_embedding(resume["text"])
        semantic_score = compute_cosine_similarity(target_embedding, resume_embedding)

        # Extract all skills from resume text (against the full role skill list)
        resume_skills, summary = extract_summary_and_skills(resume["text"], skills_list)
        education = extract_education(resume["text"])
        experience = extract_experience(resume["text"])

        # Compare resume skills vs. JD (role) skills to get matched/missing
        matched_skills, missing_skills = compare_skills(resume_skills, skills_list)

        # Dynamically derive strengths and weaknesses
        strengths = generate_strengths(matched_skills, resume["text"])
        weaknesses = generate_weaknesses(missing_skills, experience)

        skill_score = len(matched_skills) / len(skills_list) if skills_list else 0.0
        final_score = (semantic_score + skill_score) / 2

        cand_data = {
            "name": resume["name"],
            "semantic_score": round(semantic_score, 2),
            "skill_score": round(skill_score, 2),
            "final_score": round(final_score, 2),
            "classification": get_eligibility_status(final_score),
            "skills": resume_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "summary": summary
        }

        if education:
            cand_data["education"] = education
        if experience:
            cand_data["experience"] = experience

        results.append(cand_data)

    # Sort results in descending order by final_score
    results.sort(key=lambda x: x["final_score"], reverse=True)
    return results

