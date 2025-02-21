# URL Shortener API

## Features
- Google Sign-In Authentication
- URL Shortening with Custom Alias
- Redirect with Analytics Tracking
- Redis Caching for Performance
- MongoDB for Storage
- Dockerized Deployment

## Setup
1. Install dependencies: `npm install && npm install moment && npm install mongoose && npm install google-auth-library && npm install mongodb && npm install dotenv`
2. Start server: `npm run dev`
3. Use `.env` to set up environment variables
4. Deploy with Docker: `docker build -t urlProject . && docker run -p 5000:5000 urlProject`
