# RAG-Enhanced Legal Question Answering in Low-Resource Urdu

## Overview
This repository contains the implementation of a Retrieval-Augmented Generation (RAG) based Question Answering system for the Urdu legal domain. The project is built on the LegalUQA dataset derived from Pakistan’s Constitution and focuses on improving factual grounding and answer quality in low-resource settings.

---

## Problem Statement
Question Answering systems for low-resource languages such as Urdu remain underdeveloped, particularly in specialized domains like law. Generative models often suffer from hallucination and lack domain-specific knowledge. This project addresses these challenges through large-scale Urdu model fine-tuning and retrieval-augmented generation.

---

## Dataset
LegalUQA Dataset [Available here: [LegalUQA Dataset](https://huggingface.co/datasets/nlp-anonymous-researcher/LEGAL-UQA)]

- 619 Urdu-English parallel question-answer pairs  
- Derived from Pakistan’s 1973 Constitution  
- 305 unique constitutional articles used as context  
- Train: 495 samples  
- Validation/Test: 124 samples  

---

## Methodology

### Fine-Tuning
- Baseline: mT5-large 
- Primary model: Lughaat-1.0-8B-Instruct [Available here: [Lughaat-1.0-8B-Instruct](https://huggingface.co/muhammadnoman76/Lughaat-1.0-8B-Instruct)]
- PEFT / LoRA-based fine-tuning
- Instruction-style prompting
- Evaluation using F1, METEOR, and SacreBLEU

### Retrieval-Augmented Generation (RAG)
- Context embeddings using sentence-transformers
- FAISS index over constitutional articles
- Top-k retrieval (k = 5)
- Retrieved context injected into generation prompt
- Retrieval evaluated using Hit@k metrics

---

## Results

### Generation Performance

| Model | F1 | METEOR | SacreBLEU |
|------|----|--------|-----------|
| mT5-large | 0.532 | 0.437 | 21.23 |
| Lughaat-8B (Fine-tuned) | 0.617 | 0.674 | 50.03 |
| Lughaat-8B + RAG | 0.583 | 0.583 | 41.08 |

### Retrieval Performance

| Metric | Score |
|------|-------|
| Hit@1 | 0.691 |
| Hit@3 | 0.894 |
| Hit@5 | 0.947 |

---
## How to Run the Project

1. **Clone this repository**
   ```bash
   git clone https://github.com/Rohmaa-f/RAG-Enhanced-Legal-Q-A-in-Urdu-Language.git
   ```
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run notebooks sequentially using Jupyter Notebook**

---

## Technologies Used
- Python
- PyTorch
- Hugging Face Transformers
- PEFT / LoRA
- FAISS
- Sentence Transformers
- NLTK
- Jupyter Notebook

---
