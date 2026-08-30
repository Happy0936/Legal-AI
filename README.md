# Welcome to Legal Aid

Legal Aid is a platform designed to make the Indian legal system easy to understand and accessible to everyone. Whether you're looking for legal advice, answers to common legal questions, or want to learn about your rights, Legal Aid is here to help!

---

##  Live Demo

🔹 **Frontend (Vercel)**  
👉 https://legal-aid-six.vercel.app  

🔹 **Backend API (Render)**  
👉 https://legal-aid-apgl.onrender.com  

🔹 **Admin Panel**  
👉 https://legal-aid-apgl.onrender.com/admin/


---

## Features

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
- **Backend**: Django + Django REST Framework.
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
Now run the server
```bash
python3 manage.py runserver
```



