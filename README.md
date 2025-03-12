# College Admitted - Application Analysis Platform

A modern platform for analyzing college applications using AI to provide insights and improve admission chances.

## Tech Stack

### Frontend
- React (TypeScript)
- Material-UI for components
- React Router for navigation
- Jest and React Testing Library for tests

### Backend
- Python 3.11+
- FastAPI for API development
- PostgreSQL for database
- pytest for testing
- Mistral LLM API for document processing

### Infrastructure
- AWS/GCP for hosting
- GitHub Actions for CI/CD
- Docker for containerization

## Project Structure
```
college-admitted/
├── frontend/               # React frontend application
├── backend/               # FastAPI backend application
├── docs/                 # Project documentation
└── tests/               # Integration tests
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/collegeadmitted.git
cd collegeadmitted
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Create necessary .env files (see .env.example in each directory)

5. Start development servers:
```bash
# Backend (from backend directory)
uvicorn app.main:app --reload

# Frontend (from frontend directory)
npm run dev
```

## Environment Setup
- Development: http://localhost:3000 (frontend) and http://localhost:8000 (backend)
- UAT: [URL TBD]
- Production: [URL TBD]

## Contributing
1. Create a new branch from `dev`
2. Make your changes
3. Write/update tests
4. Create a pull request to `dev`

## Testing
- Backend: `pytest` from the backend directory
- Frontend: `npm test` from the frontend directory
- Integration: `npm run test:integration` from the root directory

## License
[License details]
