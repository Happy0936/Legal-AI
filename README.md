# Welcome to Legal Aid

Legal Aid is an intelligent, accessible platform designed to simplify the Indian legal system for everyone. Powered by Retrieval-Augmented Generation (RAG) and LLM architecture, it offers real-time legal Q&A, comprehensive IPC section exploration, and an interactive AI Assistant to guide users through their legal queries seamlessly.

---

##  Live Demo

🔹 **Frontend (Vercel)**  
👉 https://legal-aicom.vercel.app/

🔹 **Backend API (Render)**  
👉 

🔹 **Admin Panel**  
👉 


---

## Features

### AI Legal Chatbot (RAG-Powered)
- **Interactive Legal Queries:**: Converse with an AI assistant trained to interpret complex Indian laws..
- **Smart IPC Explanations**: Ask for explanations on any IPC section (e.g., IPC 140, IPC 302) and receive structured, easy-to-understand breakdowns.
- **- **Smart IPC Explanations**: Ask for explanations on any IPC section (e.g., IPC 140, IPC 302) and receive structured, easy-to-understand breakdowns**: Maintains real-time chat context with intelligent fallbacks and multi-turn message capabilities.

### Legal Advice/QAs
- **Trusted Information**: Get accurate answers based on real laws in India.
- **Comprehensive Database**: Access a rich repository of legal questions and answers.

### Query Searches
- **Smart Search Bar**: Quickly find answers related to:
  - Indian Penal Code (IPC)
  - Common legal issues
  - Community-submitted questions
- **Real-Time Processing**: Powered by advanced algorithms to provide accurate and relevant results.

### Learning About Laws
- **Learn About IPC**: Understand the Indian Penal Code in simple terms.
- **Know Your Rights**: Discover your legal rights and explore practical legal solutions in an easy-to-understand format.

### Community
- Ask questions.
- Read community-driven answers.

---

## Why Choose Legal Aid?
- **User-Friendly**: Designed for everyone, from legal professionals to everyday citizens.
- **Empowering**: Helps people make informed legal decisions with confidence.
- **Reliable**: All content is based on verified laws and expert insights.


---

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS.
- **Backend**: Python 3.8+ + Django + Django REST Framework + Django CORS Headers.
- **Database**: Groq API (LLaMA 3.3 70B Versatile) + LangChain + FAISS Vector Indexing.
- **Database**: SQLite.
- **Deployment**:
  - Frontend → Vercel
  - Backend → Render

---

## Get Started
To explore the features and start learning, visit our website or contact us for support. Whether you have a legal question or want to educate yourself about laws, Legal Aid has got you covered.

---

**Empowering justice, one query at a time.**


# Setup 

This project combines a React frontend with a Django backend. Follow the instructions below to set up and run the project.

---

## **Prerequisites**
Before starting, ensure the following are installed on your system:
- **Python** (version 3.8 or higher)
- **Node.js** (version 16 or higher)
- **Virtualenv** (or another Python environment manager)
- **Git** (for version control)

---

## **Project Structure**
```text
Legal_aid/
├── backend/
│   ├── backend/           # Django project configuration & settings
│   ├── ipc/               # Core legal & IPC database app (views, models, urls)
│   ├── rag_service.py     # RAG pipeline & LLM Integration engine
│   ├── manage.py          # Django administrative utility
│   └── requirements.txt   # Backend Python dependencies
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI component library (Shadcn/UI)
    │   ├── pages/         # Application view pages (AIChatPage, Home, Learn, etc.)
    │   ├── App.tsx        # Application root routing & layout
    │   ├── NetworkService.ts # Unified API fetch module
    │   └── main.tsx       # Vite entry point
    └── package.json       # Node dependencies & environment scripts
```

---

## **Clone the Repository**  
   Clone the repository:
   ```bash
   git clone https://github.com/Happy0836/Legal_aid.git
   cd Legal_aid
   ```

---
## **Frontend Setup (React + Vite)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## **Backend Setup (Django)**
 **Start the server**
```bash
cd backend
pip install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
```
Install Dependencies
```bash
pip install -r requirements.txt
pip install django-cors-headers groq faiss-cpu langchain-community sentence-transformers python-dotenv
```
Environment Configuration
```bash
SECRET_KEY=your_django_secret_key
DEBUG=True
GROQ_API_KEY=your_groq_api_key_here
```
Database Migrations
```bash
python3 manage.py makemigrations
python3 manage.py migrate
```
Now run the server
```bash
python3 manage.py runserver
```


