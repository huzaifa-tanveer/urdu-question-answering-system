from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize
from transformers import (
    AutoTokenizer,
    AutoModel,
    XLMRobertaForQuestionAnswering,
    MT5ForConditionalGeneration,
)
import torch
import torch.nn.functional as F

app = FastAPI()

# ─────────────────────────────────────────
# CORS
# ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
CSV_FILE        = os.path.join(BASE_DIR, "QADataset_clean.csv")
USERS_FILE      = os.path.join(BASE_DIR, "users.json")
MT5_MODEL_DIR   = os.path.join(BASE_DIR, "mt5_model")
XLMR_MODEL_DIR  = os.path.join(BASE_DIR, "xlm_roberta_model")

# ─────────────────────────────────────────
# THRESHOLDS
# ─────────────────────────────────────────
SCORE_THRESHOLD    = 0.15
QUESTION_THRESHOLD = 0.15

# ─────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────
def safe_str(value) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and pd.isna(value):
        return ""
    s = str(value).strip()
    return "" if s.lower() == "nan" else s

def no_answer_response(q: str, score: float) -> dict:
    return {
        "question":        q,
        "short_answer":    "معذرت، اس سوال کا جواب ڈیٹاسیٹ میں نہیں ملا",
        "detailed_answer": "براہ کرم پاکستانی نصاب سے متعلق سوال پوچھیں",
        "answer_context":  "",
        "mt5_answer":      "",
        "xlmr_answer":     "",
        "rag_context":     "",
        "book_name":       "",
        "page":            "",
        "score":           round(score, 4)
    }

# ─────────────────────────────────────────
# LOAD DATASET + TF-IDF
# ─────────────────────────────────────────
if not os.path.exists(CSV_FILE):
    raise RuntimeError(f"CSV file nahi mili: {CSV_FILE}")

df = pd.read_csv(CSV_FILE)
print("✅ Columns  :", list(df.columns))
print("✅ Dataset  :", df.shape)

vectorizer       = TfidfVectorizer()
question_vectors = vectorizer.fit_transform(df["QuestionText"].fillna(""))
print("✅ TF-IDF ready!")

# ─────────────────────────────────────────
# MODEL 1 — XLM-RoBERTa  (Embeddings + Semantic Search)
# ─────────────────────────────────────────
xlmr_tokenizer = None
xlmr_model     = None

if not os.path.exists(XLMR_MODEL_DIR):
    print(f"⚠️  XLM-RoBERTa folder nahi mila: {XLMR_MODEL_DIR}")
else:
    try:
        print("🔄 XLM-RoBERTa Model load ho raha hai...")
        xlmr_tokenizer = AutoTokenizer.from_pretrained(XLMR_MODEL_DIR)
        # Checkpoint mein qa_outputs hain → XLMRobertaForQuestionAnswering use karo
        xlmr_model     = XLMRobertaForQuestionAnswering.from_pretrained(XLMR_MODEL_DIR)
        xlmr_model.eval()
        print("✅ XLM-RoBERTa Model ready!")
    except Exception as e:
        print(f"⚠️  XLM-RoBERTa load nahi hua: {e}")

# ─────────────────────────────────────────
# MODEL 2 — mT5  (Generative Answer)
# ─────────────────────────────────────────
mt5_tokenizer = None
mt5_model     = None

if not os.path.exists(MT5_MODEL_DIR):
    print(f"⚠️  mT5 folder nahi mila: {MT5_MODEL_DIR}")
else:
    try:
        print("🔄 mT5 Model load ho raha hai...")
        mt5_tokenizer = AutoTokenizer.from_pretrained(MT5_MODEL_DIR)
        # mT5 ke liye MT5ForConditionalGeneration use karo, T5 nahi
        mt5_model     = MT5ForConditionalGeneration.from_pretrained(MT5_MODEL_DIR)
        mt5_model.eval()
        print("✅ mT5 Model ready!")
    except Exception as e:
        print(f"⚠️  mT5 load nahi hua: {e}")

# ─────────────────────────────────────────
# XLM-RoBERTa EMBEDDING FUNCTION
# ─────────────────────────────────────────
def get_xlmr_embedding(text: str) -> torch.Tensor:
    inputs = xlmr_tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True
    )
    with torch.no_grad():
        # XLMRobertaForQuestionAnswering mein .roberta se base model milta hai
        outputs = xlmr_model.roberta(**inputs)
    # CLS token embedding
    return outputs.last_hidden_state[:, 0, :]

# ─────────────────────────────────────────
# SEMANTIC MATRIX — startup pe banao
# ─────────────────────────────────────────
semantic_matrix = None

if xlmr_model is not None and xlmr_tokenizer is not None:
    print("🔄 Semantic embeddings ban rahe hain (XLM-RoBERTa)...")
    all_embeddings = []
    for i, row in df.iterrows():
        q = safe_str(row["QuestionText"])
        if q:
            try:
                emb = get_xlmr_embedding(q).detach().numpy()
                all_embeddings.append(emb[0])
            except Exception:
                all_embeddings.append(np.zeros(768))
        else:
            all_embeddings.append(np.zeros(768))

    semantic_matrix = np.array(all_embeddings)
    semantic_matrix = normalize(semantic_matrix)
    print(f"✅ Semantic matrix ready: {semantic_matrix.shape}")
else:
    print("⚠️  XLM-RoBERTa load nahi hua, semantic search disabled.")

# ─────────────────────────────────────────
# RAG MANAGER — ChromaDB based
# ─────────────────────────────────────────
rag_collection = None

try:
    import chromadb
    chroma_client  = chromadb.Client()
    rag_collection = chroma_client.create_collection("urdu_gk_rag")

    print("🔄 RAG Index ban raha hai...")
    docs, ids, metas = [], [], []

    for i, row in df.iterrows():
        question = safe_str(row["QuestionText"])
        answer   = safe_str(row.get("ShortAnswer", ""))
        context  = safe_str(row.get("AnswerContext", ""))
        book     = safe_str(row.get("BookName", ""))
        page     = safe_str(row.get("SourceBookPage", ""))

        doc_text = f"سوال: {question} جواب: {answer}"
        if context:
            doc_text += f" تفصیل: {context}"

        docs.append(doc_text)
        ids.append(str(i))
        metas.append({
            "question": question,
            "answer":   answer,
            "book":     book,
            "page":     page
        })

    batch_size = 100
    for start in range(0, len(docs), batch_size):
        rag_collection.add(
            documents=ids[start:start + batch_size],
            ids=ids[start:start + batch_size],
            metadatas=metas[start:start + batch_size]
        )

    print(f"✅ RAG Index ready: {len(docs)} documents!")

except ImportError:
    print("⚠️  chromadb install nahi hai — pip install chromadb")
    rag_collection = None
except Exception as e:
    print(f"⚠️  RAG setup error: {e}")
    rag_collection = None

# ─────────────────────────────────────────
# RAG SEARCH FUNCTION
# ─────────────────────────────────────────
def rag_search(question: str, top_k: int = 3) -> str:
    if rag_collection is None:
        return ""
    try:
        results = rag_collection.query(
            query_texts=[question],
            n_results=top_k
        )
        if not results["metadatas"][0]:
            return ""

        answers = []
        for meta in results["metadatas"][0]:
            ans = meta.get("answer", "")
            if ans:
                answers.append(ans)

        rag_context = " | ".join(answers)
        print(f"   RAG context: {rag_context[:120]}")
        return rag_context

    except Exception as e:
        print(f"⚠️  RAG search error: {e}")
        return ""

# ─────────────────────────────────────────
# PARTIAL MATCH FUNCTION
# ─────────────────────────────────────────
def partial_match(question: str) -> tuple:
    words = question.strip().split()
    best_index = -1
    best_count = 0

    for i, row in df.iterrows():
        q_text      = safe_str(row["QuestionText"])
        match_count = sum(1 for w in words if w in q_text)
        if match_count > best_count:
            best_count = match_count
            best_index = i

    score = best_count / max(len(words), 1)
    print(f"   Partial match: {best_count}/{len(words)} words = {score:.4f}")
    return best_index, score

# ─────────────────────────────────────────
# SEMANTIC SEARCH FUNCTION  (uses XLM-RoBERTa)
# ─────────────────────────────────────────
def semantic_search(question: str):
    if xlmr_model is None or xlmr_tokenizer is None or semantic_matrix is None:
        return -1, 0.0
    try:
        q_emb  = get_xlmr_embedding(question).detach().numpy()
        q_emb  = normalize(q_emb)
        scores = np.dot(semantic_matrix, q_emb[0])
        best_index = int(np.argmax(scores))
        best_score = float(scores[best_index])
        print(f"   Semantic score (XLM-RoBERTa): {best_score:.4f}")
        return best_index, best_score
    except Exception as e:
        print(f"⚠️  Semantic search error: {e}")
        return -1, 0.0

# ─────────────────────────────────────────
# XLM-RoBERTa REFINE FUNCTION
# (Pehle wala BERT refine — ab XLM-RoBERTa se)
# ─────────────────────────────────────────
def get_xlmr_refined_answer(question: str, short_answer: str, context: str) -> str:
    if xlmr_model is None or xlmr_tokenizer is None:
        return short_answer
    if not short_answer and not context:
        return ""
    try:
        q_emb      = get_xlmr_embedding(question)
        candidates = {}

        if short_answer:
            sa_emb = get_xlmr_embedding(short_answer)
            sa_sim = F.cosine_similarity(q_emb, sa_emb).item()
            candidates["short_answer"] = (short_answer, sa_sim)
            print(f"   XLM-RoBERTa short_answer similarity: {sa_sim:.4f}")

        if context:
            ctx_emb = get_xlmr_embedding(context)
            ctx_sim = F.cosine_similarity(q_emb, ctx_emb).item()
            candidates["context"] = (context, ctx_sim)
            print(f"   XLM-RoBERTa context similarity     : {ctx_sim:.4f}")

        best_key  = max(candidates, key=lambda k: candidates[k][1])
        best_text = candidates[best_key][0]
        best_sim  = candidates[best_key][1]
        print(f"   ✅ XLM-RoBERTa chose: {best_key} (score {best_sim:.4f})")
        return best_text

    except Exception as e:
        print(f"⚠️  XLM-RoBERTa refine error: {e}")
        return short_answer

# ─────────────────────────────────────────
# mT5 GENERATIVE ANSWER FUNCTION
# ─────────────────────────────────────────
def get_mt5_answer(question: str, context: str) -> str:
    if mt5_model is None or mt5_tokenizer is None:
        return ""
    if not question or not context:
        return ""
    try:
        # mT5 ke liye input format: "question: <q> context: <ctx>"
        input_text = f"question: {question} context: {context}"

        inputs = mt5_tokenizer(
            input_text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )

        with torch.no_grad():
            outputs = mt5_model.generate(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_new_tokens=128,
                num_beams=4,
                early_stopping=True,
                no_repeat_ngram_size=2,
            )

        answer = mt5_tokenizer.decode(outputs[0], skip_special_tokens=True)
        return answer.strip()

    except Exception as e:
        print(f"⚠️  mT5 error: {e}")
        return ""

# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────
class LoginData(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(data: LoginData):
    if not os.path.exists(USERS_FILE):
        raise HTTPException(status_code=500, detail="users.json missing")
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        users = json.load(f)
    for u in users:
        if u["username"] == data.username and u["password"] == data.password:
            return {"success": True, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/register")
def register(data: LoginData):
    if not data.username.strip() or not data.password.strip():
        raise HTTPException(status_code=400, detail="Username aur password zaroori hain")
    users = []
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            users = json.load(f)
    for u in users:
        if u["username"] == data.username:
            raise HTTPException(status_code=400, detail="User already exists")
    users.append({"username": data.username, "password": data.password})
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    return {"success": True, "message": "Registered successfully"}

# ─────────────────────────────────────────
# MAIN QA ENDPOINT
# ─────────────────────────────────────────
@app.get("/ask")
def ask(q: str):
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Sawal khali nahi hona chahiye")

    print(f"\n{'='*60}")
    print(f"📥 Query: {q}")
    print(f"{'='*60}")

    # ── Step 1: TF-IDF Search ──────────────────────────────────
    print("\n[Step 1] TF-IDF Search...")
    user_vec     = vectorizer.transform([q])
    similarities = cosine_similarity(user_vec, question_vectors)
    tfidf_index  = int(similarities.argmax())
    tfidf_score  = float(similarities[0, tfidf_index])
    print(f"   TF-IDF score: {tfidf_score:.4f}")

    # ── Step 2: Semantic Search (XLM-RoBERTa) ─────────────────
    print("\n[Step 2] Semantic Search (XLM-RoBERTa)...")
    semantic_index, semantic_score = semantic_search(q)

    # ── Step 3: Best match choose karo ────────────────────────
    if semantic_index != -1 and semantic_score > tfidf_score:
        best_index = semantic_index
        best_score = semantic_score
        print(f"   ✅ Semantic jeeta: {semantic_score:.4f}")
    else:
        best_index = tfidf_index
        best_score = tfidf_score
        print(f"   ✅ TF-IDF jeeta: {tfidf_score:.4f}")

    # ── Step 4: Score threshold check ─────────────────────────
    if best_score < SCORE_THRESHOLD:
        print(f"   ⚠️  Score kam hai — partial match try kar raha hai...")
        partial_index, partial_score = partial_match(q)
        if partial_index != -1 and partial_score >= 0.2:
            best_index = partial_index
            best_score = partial_score
            print(f"   ✅ Partial match mila: {partial_score:.4f}")
        else:
            print(f"   ❌ Koi match nahi mila")
            return no_answer_response(q, best_score)

    # ── Step 5: Matched question similarity check ──────────────
    matched_question = safe_str(df.iloc[best_index]["QuestionText"])
    matched_vec      = vectorizer.transform([matched_question])
    q_sim            = cosine_similarity(user_vec, matched_vec)[0][0]
    print(f"   Question similarity: {q_sim:.4f}")

    if q_sim < QUESTION_THRESHOLD and best_score < SCORE_THRESHOLD:
        print(f"   ❌ Match sahi nahi — galat jawab rokna")
        return no_answer_response(q, best_score)

    # ── Step 6: CSV Se Data Nikalo ────────────────────────────
    print("\n[Step 6] CSV se data nikal raha hai...")
    row = df.iloc[best_index]

    short_answer    = safe_str(row["ShortAnswer"])
    detailed_answer = safe_str(row["DetailedAnswer"])
    answer_context  = safe_str(row["AnswerContext"])
    book_name       = safe_str(row["BookName"])
    page            = safe_str(row["SourceBookPage"])

    print(f"   Question : {matched_question[:60]}")
    print(f"   Book     : {book_name} (page {page})")
    print(f"   Short    : {short_answer[:60]}")

    # ── Step 7: Agar answer hi empty ho ──────────────────────
    if not short_answer and not detailed_answer:
        print("   ⚠️  Dataset answer empty!")
        return {
            "question":        q,
            "short_answer":    "معذرت، جواب نہیں ملا",
            "detailed_answer": "براہ کرم دوسرا سوال پوچھیں",
            "answer_context":  "",
            "mt5_answer":      "",
            "xlmr_answer":     "",
            "rag_context":     "",
            "book_name":       book_name,
            "page":            page,
            "score":           round(best_score, 4)
        }

    # ── Step 8: RAG Context Dhundo ────────────────────────────
    print("\n[Step 8] RAG context dhund raha hai...")
    rag_context = rag_search(q, top_k=3)
    if not rag_context:
        rag_context = answer_context
        print("   RAG nahi mila — CSV context use kar raha hai")

    # ── Step 9: XLM-RoBERTa Refine ───────────────────────────
    print("\n[Step 9] XLM-RoBERTa refine kar raha hai...")
    xlmr_answer = get_xlmr_refined_answer(q, short_answer, rag_context or answer_context)
    if not xlmr_answer:
        xlmr_answer = short_answer
    print(f"   XLM-RoBERTa answer: {xlmr_answer[:80]}")

    # ── Step 10: mT5 Generative Answer ───────────────────────
    print("\n[Step 10] mT5 generative answer nikal raha hai...")
    mt5_context = rag_context if rag_context else answer_context
    mt5_answer  = get_mt5_answer(q, mt5_context)
    if not mt5_answer:
        mt5_answer = short_answer
    print(f"   mT5 answer: {mt5_answer[:80]}")

    print("\n✅ Response ready!\n")
    return {
        "question":        matched_question,
        "short_answer":    short_answer,
        "detailed_answer": detailed_answer,
        "answer_context":  answer_context,
        "xlmr_answer":     xlmr_answer,
        "mt5_answer":      mt5_answer,
        "rag_context":     rag_context,
        "book_name":       book_name,
        "page":            page,
        "score":           round(best_score, 4)
    }

# ─────────────────────────────────────────
# DEBUG
# ─────────────────────────────────────────
@app.get("/debug")
def debug():
    sample = []
    for _, row in df.head(3).iterrows():
        sample.append({
            "QuestionText":   safe_str(row["QuestionText"]),
            "ShortAnswer":    safe_str(row["ShortAnswer"]),
            "DetailedAnswer": safe_str(row["DetailedAnswer"]),
            "AnswerContext":  safe_str(row["AnswerContext"]),
            "BookName":       safe_str(row["BookName"]),
            "Page":           safe_str(row["SourceBookPage"]),
        })
    return {
        "columns":            list(df.columns),
        "total_rows":         len(df),
        "xlmr_loaded":        xlmr_model  is not None,
        "mt5_loaded":         mt5_model   is not None,
        "semantic_ready":     semantic_matrix is not None,
        "rag_ready":          rag_collection  is not None,
        "score_threshold":    SCORE_THRESHOLD,
        "question_threshold": QUESTION_THRESHOLD,
        "sample_data":        sample
    }
