from sentence_transformers import SentenceTransformer

# Load the model once globally to avoid reloading it on every request
# all-MiniLM-L6-v2 is a small, fast, and effective model for semantic similarity
print("Loading SentenceTransformer model... This might take a moment on the first run.")
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str):
    """
    Generate an embedding vector for the given text.
    """
    return model.encode(text)
