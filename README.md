# LinkLite

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)
![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?logo=docker)

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

## Performance & Benchmarking

We benchmarked the application's redirect lookup performance under a sequential load test of 100 requests. 

Originally, Redis cache hits performed at nearly the same speed as PostgreSQL cold lookups because click logging (SELECT/INSERT) was executed synchronously. We optimized this by caching the URL database IDs in Redis and enqueuing click tracking asynchronously using FastAPI's `BackgroundTasks`.

### Results (Local Docker Environment)

| Metric | Before Optimization | After Optimization | Performance Gain |
| :--- | :--- | :--- | :--- |
| **Median Latency (Cache Hit)** | **12.47 ms** | **5.22 ms** | **-58% (Faster)** |
| **Min Latency (Cache Hit)** | **8.02 ms** | **3.83 ms** | **-52% (Faster)** |
| **Average Latency (Cache Hit)** | **14.31 ms** | **8.27 ms** | **-42% (Faster)** |

*Under identical conditions, median Redis cache hits (**5.22 ms**) are **41% faster** than PostgreSQL cold lookups (**7.36 ms**).*

### Running the Benchmark

You can measure local redirect performance using the custom HTTP benchmark client:

```bash
# Install dependencies
pip install httpx redis

# 1. Clear Redis cache
docker compose exec redis redis-cli flushall

# 2. Run sequential cache hit benchmark (1st request is cold, next 99 are warm)
python benchmark.py http://localhost:8000/mn

# 3. Run pure cold lookup benchmark (flushes Redis before every request)
python benchmark.py http://localhost:8000/mn --flush-each
```

## Project Design
<img width="1890" height="1346" alt="linklite-design" src="https://github.com/user-attachments/assets/b927c866-02ed-4dda-93af-d8a7a5ae36d5" />

## Connect with Me
If you found this project helpful or have any suggestions, feel free to connect:

- [![LinkedIn](https://img.shields.io/badge/LinkedIn-anshmnsoni-0077B5.svg?logo=linkedin)](https://www.linkedin.com/in/anshmnsoni)  
- [![GitHub](https://img.shields.io/badge/GitHub-AnshMNSoni-181717.svg?logo=github)](https://github.com/AnshMNSoni)
- [![Reddit](https://img.shields.io/badge/Reddit-u/AnshMNSoni-FF4500.svg?logo=reddit)](https://www.reddit.com/user/AnshMNSoni)
