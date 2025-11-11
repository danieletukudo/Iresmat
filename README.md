# 🏗️ Material Search System

AI-Powered Construction Materials Search with GPT-4o

---

## ✨ Features

- 🤖 **GPT-4o Powered Search** - Intelligent material matching
- 📊 **Real-time Progress** - Streaming updates as AI works
- 📁 **File Upload** - Process Excel databases
- 🎨 **Modern UI** - Beautiful, responsive design
- ⚡ **Fast** - 3-5 second searches
- 🔐 **Secure** - API keys in environment variables

---

## 🚀 Quick Start

### Option 1: Local Development

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Add your OpenAI API key

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run
./start.sh

# 4. Open browser
open http://localhost:5001
```

### Option 2: Docker Deployment

```bash
# 1. Set API key
export OPENAI_API_KEY='your-key-here'

# 2. Run with docker-compose
docker-compose up --build

# 3. Open browser
open http://localhost:5001
```

Or with Docker directly:

```bash
docker build -t material-search .
docker run -p 5001:5001 -e OPENAI_API_KEY='your-key' material-search
```

---

## 📖 Documentation

- **[START_HERE.md](START_HERE.md)** - Quick start guide
- **[DOCKER_DEPLOY.md](DOCKER_DEPLOY.md)** - Docker deployment
- **[HOW_IT_WORKS_NOW.md](HOW_IT_WORKS_NOW.md)** - Workflow explanation
- **[API_README.md](API_README.md)** - API documentation
- **[FRONTEND_README.md](FRONTEND_README.md)** - UI documentation

---

## 🎯 How It Works

### Two-Step Workflow:

1. **Upload Materials List** (.txt file)
   - Upload your construction materials database
   - System loads into GPT matcher
   - Shows count (e.g., "1464 materials loaded")

2. **Search by Description**
   - Enter construction work description
   - GPT-4o finds best matches
   - See results with confidence scores and AI reasoning

---

## 🛠️ Technology Stack

- **Backend**: Flask 3.0.0, OpenAI GPT-4o
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Docker, Docker Compose
- **Languages**: Python 3.11+

---

## 📊 Performance

- **Load materials**: < 0.1s
- **GPT search**: 2-5s
- **Total**: ~3-5 seconds per search

10x faster than RAG-based systems!

---

## 🔐 Security

- ✅ API keys in `.env` (not committed)
- ✅ `.dockerignore` excludes sensitive files
- ✅ Environment variable configuration
- ✅ No hardcoded secrets

---

## 📞 Support

See documentation files for detailed guides.

---

## 📜 License

MIT License - See your organization's license file

---

**Repository**: https://github.com/danieletukudo/Iresmat

**Status**: ✅ Production Ready

