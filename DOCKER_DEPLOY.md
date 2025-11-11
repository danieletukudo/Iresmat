# 🐳 Docker Deployment Guide

## 🎯 Fixed Issues

✅ **Dockerfile fixed** - Now uses `python api.py` instead of `flask run`  
✅ **Environment variables** - Properly configured  
✅ **Port mapping** - Fixed network mode warning  

---

## 🚀 Quick Start with Docker

### Method 1: Docker Compose (Recommended)

```bash
# Build and run
OPENAI_API_KEY=your-key-here docker-compose up --build
```

Or create a `.env` file first:

```bash
# Create .env
cp .env.example .env
nano .env  # Add your API key

# Run
docker-compose up --build
```

Then open: **http://localhost:5001**

---

### Method 2: Docker Command

```bash
# Build the image
docker build -t material-search .

# Run the container
docker run -d \
  -p 5001:5001 \
  -e OPENAI_API_KEY='your-key-here' \
  --name material-search \
  material-search
```

Then open: **http://localhost:5001**

---

## 🛠️ Docker Commands

### View Logs:
```bash
docker logs -f material-search
```

### Stop Container:
```bash
docker stop material-search
```

### Remove Container:
```bash
docker rm material-search
```

### Rebuild:
```bash
docker-compose down
docker-compose up --build
```

---

## 📋 What's in the Docker Image

### Included:
✅ Python 3.11-slim base  
✅ All Python dependencies  
✅ Flask API (`api.py`)  
✅ Frontend (`index.html`, `static/`)  
✅ GPT matcher (`gpt_matcher.py`)  
✅ Materials list (`materials_list.txt`)  
✅ All necessary Python scripts  

### Excluded (via `.dockerignore`):
❌ `.git/` - Not needed in container  
❌ `__pycache__/` - Will be regenerated  
❌ `.env` - Passed via environment variable  
❌ `venv/` - Not needed  
❌ Sample/test files  

---

## ⚙️ Configuration

### Environment Variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | "" |
| `FLASK_ENV` | Flask environment | production |
| `DATABASE_PATH` | Path to Excel database | /app/correct_sample/DATABSE.xlsx |
| `MATERIALS_LIST_PATH` | Path to materials list | /app/materials_list.txt |

### Set via Docker:

```bash
docker run -d \
  -p 5001:5001 \
  -e OPENAI_API_KEY='your-key' \
  -e FLASK_ENV='production' \
  material-search
```

---

## 🔧 Troubleshooting

### Issue 1: "Could not parse .env statement"

**Problem**: `.env` file has comments or wrong format in Docker

**Solution**: Don't copy `.env` into Docker. Use environment variables:

```bash
docker run -e OPENAI_API_KEY='your-key' ...
```

Or with docker-compose:

```yaml
environment:
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

### Issue 2: "Could not locate Flask application"

**Problem**: Docker was using `flask run` command

**Solution**: ✅ Fixed! Now uses `CMD ["python", "api.py"]`

### Issue 3: "Published ports are discarded when using host network mode"

**Problem**: Docker run command used `--network host`

**Solution**: Don't use host mode. Use port mapping:

```bash
docker run -p 5001:5001 ...  # ✅ Correct
# NOT: docker run --network host ...  # ❌ Wrong
```

---

## 📦 Complete Docker Setup

### 1. Build Image:

```bash
docker build -t material-search:latest .
```

### 2. Run with Environment Variable:

```bash
docker run -d \
  -p 5001:5001 \
  -e OPENAI_API_KEY='sk-your-key-here' \
  --name material-search \
  --restart unless-stopped \
  material-search:latest
```

### 3. Check Logs:

```bash
docker logs -f material-search
```

You should see:
```
 * Serving Flask app 'api'
 * Debug mode: off
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5001
```

---

## 🎯 Docker Compose (Easiest)

### 1. Create `.env` file:

```bash
cat > .env << 'EOF'
OPENAI_API_KEY=sk-your-actual-key-here
EOF
```

### 2. Run:

```bash
docker-compose up --build -d
```

### 3. View Logs:

```bash
docker-compose logs -f
```

### 4. Stop:

```bash
docker-compose down
```

---

## 🌐 Access the Application

Once running, open:

```
http://localhost:5001
```

Or if on remote server:

```
http://your-server-ip:5001
```

---

## 📊 Production Deployment

### For Production:

```bash
# Build
docker build -t material-search:prod .

# Run with production settings
docker run -d \
  -p 80:5001 \
  -e OPENAI_API_KEY='your-production-key' \
  -e FLASK_ENV='production' \
  --name material-search-prod \
  --restart always \
  material-search:prod
```

---

## 🔐 Security Notes

### ✅ Good Practices:
- Pass API key via environment variable (not in Dockerfile)
- Use `.dockerignore` to exclude sensitive files
- Don't include `.env` in Docker image
- Use secrets management in production (Docker secrets, K8s secrets)

### ❌ Bad Practices:
- Hardcoding API keys in Dockerfile
- Copying `.env` into image
- Using `--network host` unnecessarily
- Exposing debug mode in production

---

## 🎉 Fixed and Ready!

The Dockerfile is now fixed. Run:

```bash
cd /Users/danielsamuel/PycharmProjects/RAG/Iresmat

# With docker-compose
docker-compose up --build

# Or with docker command
docker build -t material-search .
docker run -p 5001:5001 -e OPENAI_API_KEY='your-key' material-search
```

✅ **Should work perfectly now!**

