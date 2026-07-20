# Urdu Question Answering System

An end-to-end NLP pipeline that understands and answers questions in the Urdu language, built to handle the morphological complexity of Urdu through deep learning-based text preprocessing and modeling.

## Overview

This project implements a Question Answering (QA) system for Urdu using fine-tuned transformer models. It includes both a Python backend (model inference) and a React frontend (user interface) for interactive question answering.

## Features

- Understands and answers natural language questions in Urdu
- Custom NLP pipeline with advanced tokenization for Urdu's morphological structure
- Fine-tuned transformer models (mT5, XLM-RoBERTa) for QA tasks
- Web-based interface built with React for easy interaction
- Evaluated on standard QA benchmarks with reliable accuracy

## Tech Stack

**Backend:** Python, TensorFlow, Keras, Hugging Face Transformers (mT5, XLM-RoBERTa)  
**Frontend:** React, HTML, CSS  
**NLP Tools:** NLTK, spaCy  
**Data:** Custom cleaned Urdu QA dataset

## Project Structure
## Setup & Installation

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd Frontend
npm install
npm start
```

## Results

The model was evaluated on standard Urdu QA benchmarks and achieved consistent, reliable performance across test datasets.

## Author

**Huzaifa Tanveer**  
AI Engineer | Machine Learning | NLP  
[LinkedIn](https://linkedin.com/in/HuzaifaTanveer)