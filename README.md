# LinkLite

LinkLite is a blazing fast, smart URL shortener. Transform long, cluttered links into clean, shareable URLs, and track every click with powerful real-time analytics.

## Features
- **Instant Shortening**: Less than 1ms response time.
- **Custom URLs**: Choose your own short code or let the system generate one.
- **Real-Time Analytics**: Track total clicks and visual daily breakdown of usage over time.
- **Responsive UI**: A premium, fully-responsive dark mode glassmorphism dashboard featuring an Emerald Green theme, mobile-optimized floating action buttons, and beautiful calligraphy typography. Built with React and Tailwind CSS.
- **FastAPI Backend**: Powered by Python, FastAPI, and PostgreSQL.

## Quick Start

### Backend
The backend runs on port `8000`.

```bash
cd backend
# Create virtual environment and install dependencies
python -m venv env
source env/Scripts/activate  # On Windows
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload
```

*Note: For a fully dockerized environment, run `docker-compose up --build` from the root directory.*

### Frontend
The frontend runs on port `3000`. It proxies API requests (`/urls` and `/analytics`) to `http://localhost:8000`.

```bash
cd frontend
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:3000` to use the application.

## Connect with Me
If you found this project helpful or have any suggestions, feel free to connect:

- [![LinkedIn](https://img.shields.io/badge/LinkedIn-anshmnsoni-0077B5.svg?logo=linkedin)](https://www.linkedin.com/in/anshmnsoni)  
- [![GitHub](https://img.shields.io/badge/GitHub-AnshMNSoni-181717.svg?logo=github)](https://github.com/AnshMNSoni)
- [![Reddit](https://img.shields.io/badge/Reddit-u/AnshMNSoni-FF4500.svg?logo=reddit)](https://www.reddit.com/user/AnshMNSoni)
