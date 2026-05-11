from sentence_transformers import SentenceTransformer, util
import re

model = SentenceTransformer('all-MiniLM-L6-v2')

def evaluate_answer(question: str, user_answer: str, reference_answer: str = "") -> dict:
    if not user_answer or len(user_answer.strip()) < 5:
        return {
            "similarity_score": 0,
            "concept_clarity": 0,
            "communication_score": 0,
            "overall_score": 0,
            "verdict": "Poor",
            "areas_to_improve": ["Provide a detailed answer", "Cover key concepts", "Structure your response"],
            "suggestions": ["Read the topic thoroughly", "Practice answering out loud"],
            "what_to_add": [],
            "feedback": "No meaningful answer provided."
        }

    # 1. Semantic similarity (if reference exists)
    similarity = 0.0
    if reference_answer and len(reference_answer.strip()) > 5:
        emb1 = model.encode(user_answer, convert_to_tensor=True)
        emb2 = model.encode(reference_answer, convert_to_tensor=True)
        similarity = float(util.cos_sim(emb1, emb2)) * 100
        similarity = max(0, min(100, similarity))

    # 2. Concept clarity - based on answer length, structure, keywords
    words = user_answer.split()
    word_count = len(words)
    sentences = [s.strip() for s in re.split(r'[.!?]', user_answer) if len(s.strip()) > 5]
    sentence_count = len(sentences)

    # Length score (20-200 words is good)
    length_score = min(100, (word_count / 150) * 100) if word_count < 150 else max(70, 100 - (word_count - 150) / 10)

    # Structure score - has intro, body
    structure_score = 50
    if sentence_count >= 2: structure_score += 20
    if sentence_count >= 4: structure_score += 15
    if any(w in user_answer.lower() for w in ['because', 'therefore', 'however', 'for example', 'such as', 'in other words']):
        structure_score += 15

    concept_clarity = (length_score * 0.4 + structure_score * 0.6)
    concept_clarity = max(0, min(100, concept_clarity))

    # 3. Communication score
    comm_score = 50
    # Penalize filler words
    filler_count = sum(user_answer.lower().count(w) for w in ['um', 'uh', 'like', 'you know', 'basically'])
    comm_score -= filler_count * 5
    # Reward clear language
    if any(w in user_answer.lower() for w in ['first', 'second', 'finally', 'in summary', 'to conclude']):
        comm_score += 20
    if word_count > 50: comm_score += 15
    if sentence_count >= 3: comm_score += 15
    comm_score = max(0, min(100, comm_score))

    # Overall
    if reference_answer and similarity > 0:
        overall = (similarity * 0.5 + concept_clarity * 0.3 + comm_score * 0.2)
    else:
        overall = (concept_clarity * 0.5 + comm_score * 0.5)

    overall = max(0, min(100, overall))

    # Verdict
    if overall >= 80:
        verdict = "Excellent"
    elif overall >= 65:
        verdict = "Good"
    elif overall >= 50:
        verdict = "Average"
    elif overall >= 35:
        verdict = "Needs Work"
    else:
        verdict = "Poor"

    # Generate feedback
    areas = []
    suggestions = []
    what_to_add = []

    if similarity < 50 and reference_answer:
        areas.append("Content accuracy and relevance")
        suggestions.append("Include more specific technical terms and key concepts")
    if concept_clarity < 50:
        areas.append("Concept explanation clarity")
        suggestions.append("Use examples and analogies to explain concepts")
    if comm_score < 50:
        areas.append("Communication structure")
        suggestions.append("Structure your answer with clear introduction, body, and conclusion")
    if word_count < 30:
        areas.append("Answer depth and coverage")
        suggestions.append("Elaborate more on your answer with details")
    if sentence_count < 2:
        areas.append("Answer organization")
        suggestions.append("Break your answer into multiple clear points")

    if not areas:
        areas = ["Minor improvements possible"]
        suggestions = ["Keep practicing to maintain consistency"]

    # What to add based on reference
    if reference_answer:
        ref_words = set(reference_answer.lower().split())
        user_words = set(user_answer.lower().split())
        missing_concepts = ref_words - user_words
        important_missing = [w for w in missing_concepts if len(w) > 5 and w.isalpha()][:3]
        if important_missing:
            what_to_add = [f"Consider covering: '{' '.join(important_missing[:5])}'"]

    return {
        "similarity_score": round(similarity, 1),
        "concept_clarity": round(concept_clarity, 1),
        "communication_score": round(comm_score, 1),
        "overall_score": round(overall, 1),
        "verdict": verdict,
        "areas_to_improve": areas,
        "suggestions": suggestions,
        "what_to_add": what_to_add,
        "feedback": f"Your answer scored {overall:.0f}% overall. {verdict} response."
    }

def generate_personalized_suggestions(sessions: list) -> dict:
    """Generate suggestions based on user's performance history"""
    if not sessions:
        return {
            "suggestions": ["Complete your first interview to get personalized feedback!"],
            "weak_areas": [],
            "resources": []
        }

    avg_score = sum(s.get('score', 0) for s in sessions) / len(sessions)
    categories = {}
    for s in sessions:
        cat = s.get('category', 'General')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(s.get('score', 0))

    weak_cats = [cat for cat, scores in categories.items() if sum(scores)/len(scores) < 60]

    suggestions = []
    resources = []

    if avg_score < 50:
        suggestions.append("Focus on understanding core concepts before attempting complex questions")
        suggestions.append("Practice structuring your answers with introduction, body, and conclusion")
    elif avg_score < 70:
        suggestions.append("Work on using specific examples and technical terminology")
        suggestions.append("Review your weak areas and study related topics systematically")
    else:
        suggestions.append("Excellent progress! Try harder difficulty questions")
        suggestions.append("Focus on edge cases and advanced concepts")

    if 'Technical' in weak_cats:
        resources.append({"name": "LeetCode", "url": "https://leetcode.com", "type": "Platform"})
        resources.append({"name": "GeeksforGeeks", "url": "https://geeksforgeeks.org", "type": "Platform"})
    if 'HR' in weak_cats:
        resources.append({"name": "STAR Method Guide", "url": "https://www.themuse.com/advice/star-interview-method", "type": "Article"})
        resources.append({"name": "Top 50 HR Questions", "url": "https://www.indiabix.com/hr-interview/questions-and-answers/", "type": "Article"})
    if 'Communication' in weak_cats:
        resources.append({"name": "TED Talks - Public Speaking", "url": "https://www.ted.com", "type": "Video"})
        resources.append({"name": "Toastmasters Tips", "url": "https://www.toastmasters.org", "type": "Guide"})

    return {
        "suggestions": suggestions,
        "weak_areas": weak_cats,
        "resources": resources,
        "avg_score": round(avg_score, 1)
    }
