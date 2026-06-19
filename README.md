# LinkLite

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?logo=docker)

LinkLite is a URL shortener built with FastAPI, PostgreSQL, Redis, React, and Docker.

The project explores caching, asynchronous analytics processing, and performance optimization in a read-heavy system. It implements a cache-aside architecture with Redis, asynchronous click tracking using FastAPI `BackgroundTasks`, rate limiting, and URL expiration policies.

---

## Features

* **URL Shortening** – Generate short, shareable URLs instantly.
* **Custom Short Codes** – Create your own aliases or use auto-generated codes.
* **Analytics Dashboard** – Track clicks and visualize usage trends over time.
* **Redis Cache Layer** – Cache-aside architecture for low-latency redirects.
* **Asynchronous Click Tracking** – Analytics logging moved off the request critical path using FastAPI `BackgroundTasks`.
* **Rate Limiting** – Prevent API abuse by limiting request frequencies based on IP.
* **URL Expiration** – Configure custom expiration dates and times for shortened links.
* **User Authentication & Ownership** – Secure user signup, login, and private dashboard to manage links.
* **URL Safety Verification** – Built-in verification scanner checking URLs against suspicious keywords and blocked domains to prevent malicious links.
* **Responsive React UI** – Mobile-friendly dashboard built with React, Vite, and Tailwind CSS.
* **Dockerized Development Environment** – One-command local setup.

---

## Architecture

LinkLite follows a cache-aside architecture optimized for read-heavy redirect workloads.

### Redirect Flow

1. Incoming request checks Redis for the short code.
2. Cache hits return immediately.
3. Cache misses fall back to PostgreSQL.
4. Results are stored in Redis for future requests.
5. Click analytics are recorded asynchronously after the response is sent.

### Why This Design?

Redirect endpoints are highly read-intensive. A cache layer reduces database load and improves latency, while asynchronous analytics prevent click tracking from blocking redirects.



## Quick Start

### Backend

```bash
cd backend

python -m venv env
source env/Scripts/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

### Docker

Run the full stack:

```bash
docker compose up --build
```

---

## Technical Decisions

### Why Redis?

Redirect workloads repeatedly access the same URLs. Redis reduces database load and provides faster lookups for frequently accessed links.

### Why FastAPI BackgroundTasks?

Analytics writes do not need to block redirects.

Using `BackgroundTasks` keeps the architecture simple while removing analytics latency from the request path without introducing Kafka, RabbitMQ, or Celery.

### Why PostgreSQL?

URL mappings require durable storage, indexing, and transactional consistency. PostgreSQL provides all three with minimal operational complexity.

---

## Project Design

<img width="1890" height="1346" alt="linklite-design" src="https://github.com/user-attachments/assets/b927c866-02ed-4dda-93af-d8a7a5ae36d5" />

---

## Future Improvements

* Concurrent load testing
* p95 and p99 latency measurements
* Redis failure recovery strategies
* Distributed analytics pipeline

---

## Connect

If you have suggestions, feedback, or would like to discuss system design and backend engineering:

* LinkedIn: https://www.linkedin.com/in/anshmnsoni
* GitHub: https://github.com/AnshMNSoni
* Reddit: https://www.reddit.com/user/AnshMNSoni
