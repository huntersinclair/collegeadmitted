# CollegeAdmitted

CollegeAdmitted is an AI-powered platform that helps students navigate the college admissions process with personalized guidance, essay reviews, and interview preparation.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: PostgreSQL
- **Hosting**: Render.com

## Development Setup

### Prerequisites

- Node.js 18.17.0 or later
- Python 3.11 or later
- PostgreSQL 15 or later

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

The backend API will be available at `http://localhost:8000`.

## Deployment

The application is deployed using Render.com:

- Frontend: Static site deployment from the `main` branch
- Backend: Web service deployment from the `main` branch
- Database: Managed PostgreSQL instance

### Environment Variables

Required environment variables for deployment:

#### Frontend
- `NODE_ENV`
- `NEXT_PUBLIC_API_URL`

#### Backend
- `ENVIRONMENT`
- `DATABASE_URL`
- `SECRET_KEY`
- `MISTRAL_API_KEY`

## Git Workflow

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. Push your branch and create a pull request to `develop`:
   ```bash
   git push origin feature/your-feature-name
   ```

4. After review and approval, merge to `develop`.

5. For releases, merge `develop` into `main`:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

## License

This project is proprietary and confidential.
