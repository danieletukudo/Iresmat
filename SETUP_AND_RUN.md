# Setup and Run Guide

Complete guide to get the Construction Materials Search System running.

## ✅ Fixed Compatibility Issues

The PyTorch/Transformers compatibility error has been resolved. The system now uses:
- **torch**: 2.2.2
- **transformers**: 4.40.0
- **sentence-transformers**: 3.0.1
- **openai**: 1.12.0 (for GPT-4o)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install Flask, OpenAI, and all required packages.

### 2. Set OpenAI API Key (Important!)

The system uses GPT-4o for intelligent material matching. You need to set your OpenAI API key:

```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or edit the `OPENAI_API_KEY` variable in `api.py` (line 20).

### 3. Generate Materials List (Optional)

The materials list will be auto-generated on first run, but you can generate it manually:

```bash
python generate_materials_list.py
```

This creates `materials_list.txt` with all 1464 materials from the database.

### 4. Start the Server

```bash
./start.sh
```

Or directly:

```bash
python api.py
```

### 5. Open the Frontend

Open your browser to:

```
http://localhost:5001
```

## 🎯 How It Works

### Text Search (GPT-Powered)

1. **Enter Description**: Type any construction work description in Spanish
   - Example: "REPARACION DE FRENTE DE FORJADO CON PROPAM REPAR 40"
   - Example: "limpieza de alicatado cerámico"

2. **Watch Progress**: See real-time updates as the system:
   - 🔧 Initializes GPT matcher
   - ✅ Loads 1464 construction materials
   - 🔍 Analyzes your description
   - 🤖 Queries GPT-4o for best matches
   - ✨ Returns matching materials

3. **View Results**: Get materials with:
   - **Code**: Material identification code
   - **Description**: Full material description
   - **Confidence Score**: How confident the AI is (0-100%)
   - **AI Reasoning**: Explanation of why this material matches

### Why GPT Instead of RAG?

✅ **Much Faster**: No need to load heavy ML models or build embeddings  
✅ **Better Understanding**: GPT-4o understands context, synonyms, and incomplete descriptions  
✅ **Real Reasoning**: See why the AI chose each material  
✅ **Lighter System**: No ChromaDB or large embedding models required  

### File Upload

Works the same as before - upload Excel files to extract all materials.

## 📁 File Structure

```
RAG/
├── api.py                     # Flask API (GPT-powered)
├── index.html                 # Frontend HTML
├── static/
│   ├── styles.css            # Modern CSS (no rounded corners)
│   └── app.js                # JavaScript with streaming support
├── gpt_matcher.py            # GPT-4o matcher
├── generate_materials_list.py # Generate materials list
├── materials_list.txt        # All 1464 materials (auto-generated)
├── get_all_resumen.py        # Extract from Excel
└── requirements.txt          # Dependencies
```

## 🔑 Important Notes

### OpenAI API Key

The system requires an OpenAI API key to function. The key is currently hardcoded in:
- `api.py` (line 20)
- `gpt_matcher.py` (line 222)

**Security Note**: For production, use environment variables instead of hardcoding.

### Cost Considerations

Each search query uses GPT-4o tokens:
- Average query: 3000-5000 tokens
- Cost: ~$0.05-$0.10 per search (depending on result count)

The system shows token usage after each search so you can monitor costs.

### Materials List

The system uses a pre-generated text file (`materials_list.txt`) instead of loading from the database each time. This makes it:
- Faster to initialize
- Lighter on memory
- No need for heavy ML models

To update the materials list after database changes:

```bash
python generate_materials_list.py
```

## 🎨 Frontend Features

### Live Progress Display

The frontend shows real-time progress during searches:
- Progress bar (0-100%)
- Step-by-step log messages
- Animated spinner
- Professional loading overlay

### Material Cards

Each result shows:
- Material code (with color coding)
- Confidence score badge
- Full description
- AI reasoning (why it matched)
- Additional details (if available)

### Responsive Design

Works perfectly on:
- Desktop (1400px+)
- Tablet (768px-1400px)
- Mobile (320px-768px)

## 🔧 Configuration

### Change GPT Model

Edit `api.py` line 56:

```python
gpt_matcher = GPTConstructionMatcher(
    api_key=OPENAI_API_KEY,
    model="gpt-4o"  # Change to "gpt-4-turbo" or other models
)
```

### Change Number of Results

Default is 5, adjustable from 1-20 in the UI.

### Change Port

Edit `api.py` last line:

```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change port
```

## 🐛 Troubleshooting

### "OpenAI API key not found"

Set the environment variable:

```bash
export OPENAI_API_KEY='sk-...'
python api.py
```

### "materials_list.txt not found"

Run:

```bash
python generate_materials_list.py
```

### Progress not showing

Make sure your browser supports:
- Fetch API with streaming
- Server-Sent Events (SSE)

Modern browsers (Chrome 90+, Firefox 88+, Safari 14+) support this.

### Search is slow

This is normal for the first search as the system:
1. Loads the materials list (1464 items)
2. Sends request to OpenAI GPT-4o
3. Receives and processes response

Subsequent searches are faster as the matcher stays loaded.

## 📊 Performance

- **First Search**: 5-10 seconds (loading + GPT)
- **Subsequent Searches**: 3-5 seconds (GPT only)
- **File Upload**: 1-3 seconds (depending on file size)

## 🎉 What You Get

✅ Modern, professional web interface  
✅ GPT-4o powered intelligent search  
✅ Real-time progress updates  
✅ AI reasoning for each match  
✅ File upload and processing  
✅ Downloadable results  
✅ Fully responsive design  
✅ No heavy ML models to load  

Enjoy your fast, intelligent Construction Materials Search System! 🚀

