import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import groq
from .schemas import UserQuery, AIResponse, GuardrailLog
from .rag_engine import RAGEngine

load_dotenv()

app = FastAPI(title="Legal Aid Assistant API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
INDEX_DIR = os.path.join(BASE_DIR, "data", "processed", "chroma")

rag = RAGEngine(data_dir=DATA_DIR, persist_dir=INDEX_DIR)
client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.get("/")
def root():
    return {"status": "Legal Aid Assistant API is running", "version": "1.0"}

@app.post("/chat", response_model=AIResponse)
async def chat(user_query: UserQuery):
    try:
        # 1. Retrieve relevant law sections
        relevant_chunks = rag.query(user_query.text)
        context = "\n\n".join([f"Source: {c.act_name}\n{c.text}" for c in relevant_chunks])

        # 2. Build Prompt
        system_prompt = f"""You are a Legal Aid Assistant for common people in India. 
Your goal is to explain legal information in simple, plain language based ON THE PROVIDED CONTEXT.
If the context doesn't contain the answer, say you don't have enough specific legal information but provide general guidance based on common knowledge of Indian law.

CONTEXT:
{context}

RULES:
- Be empathetic and clear.
- Use simple terms, not legalese.
- Always cite which Act (BNS/BNSS/Consumer Protection) you are referring to.
- Support both English and Hindi logic if the user asks in those languages.
"""

        # 3. Call Groq (Llama 3.3 70B)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query.text}
            ],
            temperature=0,
            max_tokens=1000,
        )

        answer = completion.choices[0].message.content
        
        # 4. Enforce Guardrail
        disclaimer = "Please consult a qualified lawyer before taking any legal action."
        if disclaimer not in answer:
            answer += f"\n\n**Note**: {disclaimer}"

        # 5. Log the query (In a real app, use a database)
        print(f"Query: {user_query.text}")
        print(f"Log: Query {user_query.query_id} processed safely.")

        return AIResponse(
            query_id=user_query.query_id,
            answer=answer,
            sources=relevant_chunks
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "healthy"}
