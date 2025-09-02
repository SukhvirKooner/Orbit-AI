# Nova Shop Desk

A modern e-commerce platform built with React, TypeScript, and FastAPI, featuring AI-powered navigation and a beautiful user interface.

## 👥 Team Evoke

**Nova Shop Desk** is proudly developed by **Team Evoke**, a collaborative group of passionate developers and innovators.

### Team Members
- **Sukhvir Singh** - [sukhvirkooner05@gmail.com](mailto:sukhvirkooner05@gmail.com)
- **Maayank**
- **Ishaan**
- **Hitesh**

### Contact
For project inquiries, collaboration opportunities, or technical support, please reach out to our team lead:
- **Email**: [sukhvirkooner05@gmail.com](mailto:sukhvirkooner05@gmail.com)
- **Project**: Nova Shop Desk

## 🚀 Features

- **Modern Frontend**: Built with React 18, TypeScript, and Tailwind CSS
- **AI-Powered Backend**: FastAPI backend with OpenAI integration
- **Smart Navigation**: AI-driven website navigation system
- **Responsive Design**: Mobile-first approach with shadcn/ui components
- **Vector Database**: ChromaDB for intelligent search and recommendations
- **Real-time Updates**: Hot reloading and live development experience

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn** package manager
- **OpenAI API Key** (for AI features)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd nova-shop-desk
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: http://localhost:8080

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env  # if env.example exists
# OR create .env manually
```

### 4. Environment Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Application Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
API_PORT=8000
API_HOST=0.0.0.0

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60

# Vector Database Configuration
CHROMA_PERSIST_DIRECTORY=./chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Cache Configuration
CACHE_TTL_SECONDS=300
```

### 5. Start Backend Server

```bash
# From the backend directory
python start.py

# OR manually start with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at: http://localhost:8000

## 🌐 Available Services

### Frontend (Port 8080)
- **Home Page**: Main landing page with featured products
- **Products**: Browse and search products
- **Cart**: Shopping cart management
- **Checkout**: Secure checkout process
- **AI Agent**: Intelligent navigation assistance

### Backend (Port 8000)
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **AI Navigation**: `/plan` endpoint for intelligent navigation
- **RAG System**: Vector-based search and recommendations

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend
```bash
python start.py      # Start with startup script
uvicorn main:app --reload  # Start with auto-reload
python -m pytest     # Run tests
python run_tests.py  # Run test suite
```

## 📁 Project Structure

```
nova-shop-desk/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── aiAgent/          # AI navigation system
│   ├── contexts/         # React contexts
│   └── hooks/            # Custom React hooks
├── backend/               # Backend Python code
│   ├── ai_engine.py      # AI decision engine
│   ├── rag_system.py     # RAG (Retrieval-Augmented Generation) system
│   ├── models.py         # Data models
│   ├── config.py         # Configuration settings
│   └── main.py           # FastAPI application
├── public/                # Static assets
└── dist/                  # Build output
```

## 🤖 AI Features

- **Intelligent Navigation**: AI-powered website navigation assistance
- **Smart Search**: Vector-based product search and recommendations
- **Context Awareness**: Understanding user intent and browsing history
- **Natural Language Processing**: Support for multiple languages and queries

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
python -m pytest
python run_tests.py
```

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend
```bash
# Set ENVIRONMENT=production in .env
# Use a production WSGI server like Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🔒 Security

- CORS configuration for allowed origins
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure API key management

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | - | Yes |
| `ENVIRONMENT` | Application environment | development | No |
| `API_PORT` | Backend API port | 8000 | No |
| `API_HOST` | Backend API host | 0.0.0.0 | No |
| `LOG_LEVEL` | Logging level | INFO | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:8080,3000 | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Frontend won't start:**
- Check if port 8080 is available
- Ensure all dependencies are installed with `npm install`

**Backend won't start:**
- Verify Python version (3.8+)
- Check if .env file exists and has valid values
- Ensure OpenAI API key is set correctly
- Check if port 8000 is available

**AI features not working:**
- Verify OpenAI API key is valid
- Check internet connection
- Review backend logs for errors

**Database issues:**
- Ensure ChromaDB directory has write permissions
- Check if embedding models are downloaded

### Getting Help

- Check the logs in `backend/ai_navigator.log`
- Review the API documentation at http://localhost:8000/docs
- Check the test results in `backend/TESTING_SUMMARY.md`

---

## 🏆 Team Evoke

**Nova Shop Desk** is a collaborative effort by Team Evoke, showcasing our passion for innovative e-commerce solutions and AI-powered user experiences.

**Happy coding! 🚀**
