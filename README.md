# ⚖️ Legal Aid Assistant: An AI Guardian for Common People

### 🎯 The "Elite" Overview
- **The Problem**: Legal complexity in India creates a massive knowledge gap, leaving common citizens unaware of their fundamental rights.
- **The Value**: This RAG-powered dashboard translates obtuse "legalese" from the BNS and BNSS into clear, actionable advice in plain English and Hindi.
- **The AI Component**: A Retrieval-Augmented Generation (RAG) pipeline utilizing **Llama 3.3 (via Groq)** grounded in verified Indian Legal Acts via **ChromaDB**.

---

### 🌐 Live Demo
- **Frontend App**: [https://legal-aid-assistant-ten.vercel.app](https://legal-aid-assistant-ten.vercel.app)
- **Backend API**: [https://legal-aid-backend-8lg9.onrender.com](https://legal-aid-backend-8lg9.onrender.com)

---

## 🚀 Key Features

- **Scope Discipline**: A focused, working prototype specifically targeted at BNS (Criminal Law), BNSS (Procedure), and Consumer Protection.
- **Usable Artifact**: Fully containerized and ready for deployment, with verified API endpoints and a high-fidelity React UI.
- **Sensible AI**: Beyond a simple chatbot—this system retrieves specific legal clauses, cross-references them, and synthesizes a safe, grounded summary.
- **Guardrail Integration**: Every response is automatically appended with a persistent legal disclaimer to ensure ethical AI operation.

---

## 🛠️ Project Showcase

### **Automated Legal Retrieval in Action**
The following screenshot demonstrates the system retrieving **Section 35 (BNSS)** to explain arrest rights, providing the exact law source alongside an empathetic explanation.

![Legal Aid Demo](https://raw.githubusercontent.com/akashmdx2025-crypto/legal-aid-assistant/main/final_legal_assistant_response_1776198743863.png)

---

## 📂 Architecture & Integration

- **Frontend**: React + Vite + Tailwind CSS (Elite Dashboard).
- **Backend**: FastAPI + RAG Engine (LangChain & Groq).
- **Vector Memory**: ChromaDB persistent store for law indexing.
- **Deployment**: Configured for Vercel (Frontend) and Render/Railway (Backend).

---

## ⚖️ Legal Disclaimer
This application is for informational purposes only. It is intended to help common people understand the law but **does not constitute legal advice**. Always consult a qualified legal professional for legal representation or action.
