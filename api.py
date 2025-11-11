#!/usr/bin/env python3
"""
Flask API for processing Excel files and returning resume data
"""

from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context
import os
import tempfile
import json
import time
from werkzeug.utils import secure_filename
from get_all_resumen import get_all_resumen, get_all_resumen_text_only, get_all_resumen_with_details
from gpt_matcher import GPTConstructionMatcher
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configuration
DATABASE_PATH = os.getenv('DATABASE_PATH', '/Users/danielsamuel/PycharmProjects/RAG/correct_sample/DATABSE.xlsx')
MATERIALS_LIST_PATH = os.getenv('MATERIALS_LIST_PATH', '/Users/danielsamuel/PycharmProjects/RAG/materials_list.txt')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
UPLOAD_FOLDER = tempfile.gettempdir()

# Session storage for uploaded materials lists
# In production, use Redis or database
uploaded_lists = {}

# Initialize GPT matcher (will be lazy-loaded)
gpt_matcher = None
materials_list_text = None

# Configure upload settings
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
ALLOWED_TEXT_EXTENSIONS = {'txt'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size


def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def allowed_text_file(filename):
    """Check if the file is a text file"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_TEXT_EXTENSIONS


def load_materials_list():
    """Load the materials list text file"""
    global materials_list_text
    if materials_list_text is None:
        if not os.path.exists(MATERIALS_LIST_PATH):
            # Generate it if it doesn't exist
            from generate_materials_list import generate_materials_text_file
            generate_materials_text_file(DATABASE_PATH, MATERIALS_LIST_PATH)
        
        with open(MATERIALS_LIST_PATH, 'r', encoding='utf-8') as f:
            materials_list_text = f.read()
    
    return materials_list_text


def get_gpt_matcher():
    """Lazy-load and return the GPT matcher"""
    global gpt_matcher
    if gpt_matcher is None:
        gpt_matcher = GPTConstructionMatcher(
            api_key=OPENAI_API_KEY,
            model="gpt-4.1-2025-04-14"
        )
        # Load materials list
        list_text = load_materials_list()
        gpt_matcher.parse_list(list_text)
    return gpt_matcher


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Upload an Excel file and get all resume data as text
    
    Returns:
        JSON response with resume data formatted as text
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Please upload .xlsx or .xls file'}), 400
    
    try:
        # Save file to temporary location
        filename = secure_filename(file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            temp_path = tmp_file.name
            file.save(temp_path)
        
        # Process the file
        resumenes = get_all_resumen(temp_path)
        
        # Format as text
        text_output = []
        text_output.append(f"Total materials: {len(resumenes)}")
        text_output.append("=" * 80)
        text_output.append("")
        
        for i, item in enumerate(resumenes, 1):
            text_output.append(f"{i}. Codigo: {item['codigo']}")
            text_output.append(f"   Resumen: {item['resumen']}")
            text_output.append("")
        
        result_text = "\n".join(text_output)
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        return jsonify({
            'success': True,
            'count': len(resumenes),
            'text': result_text,
            'data': resumenes
        }), 200
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        
        return jsonify({
            'error': f'Error processing file: {str(e)}'
        }), 500


@app.route('/api/upload/text-only', methods=['POST'])
def upload_file_text_only():
    """
    Upload an Excel file and get only resume text (no codes)
    
    Returns:
        JSON response with resume text only
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Please upload .xlsx or .xls file'}), 400
    
    try:
        # Save file to temporary location
        filename = secure_filename(file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            temp_path = tmp_file.name
            file.save(temp_path)
        
        # Process the file
        resumen_texts = get_all_resumen_text_only(temp_path)
        
        # Format as text
        text_output = []
        text_output.append(f"Total materials: {len(resumen_texts)}")
        text_output.append("=" * 80)
        text_output.append("")
        
        for i, resumen in enumerate(resumen_texts, 1):
            text_output.append(f"{i}. {resumen}")
            text_output.append("")
        
        result_text = "\n".join(text_output)
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        return jsonify({
            'success': True,
            'count': len(resumen_texts),
            'text': result_text,
            'data': resumen_texts
        }), 200
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        
        return jsonify({
            'error': f'Error processing file: {str(e)}'
        }), 500


@app.route('/api/upload/details', methods=['POST'])
def upload_file_with_details():
    """
    Upload an Excel file and get all resume data with full details
    
    Returns:
        JSON response with complete material details
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Please upload .xlsx or .xls file'}), 400
    
    try:
        # Save file to temporary location
        filename = secure_filename(file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            temp_path = tmp_file.name
            file.save(temp_path)
        
        # Process the file
        resumen_details = get_all_resumen_with_details(temp_path)
        
        # Format as text
        text_output = []
        text_output.append(f"Total materials: {len(resumen_details)}")
        text_output.append("=" * 80)
        text_output.append("")
        
        for i, item in enumerate(resumen_details, 1):
            text_output.append(f"{i}. Codigo: {item['codigo']}")
            text_output.append(f"   Tipo: {item['tipo']}")
            text_output.append(f"   Unidad: {item['ud']}")
            text_output.append(f"   Resumen: {item['resumen']}")
            text_output.append(f"   Precio: {item['precio']}€")
            text_output.append(f"   Sub-materials: {item['num_sub_materials']}")
            text_output.append("")
        
        result_text = "\n".join(text_output)
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        return jsonify({
            'success': True,
            'count': len(resumen_details),
            'text': result_text,
            'data': resumen_details
        }), 200
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        
        return jsonify({
            'error': f'Error processing file: {str(e)}'
        }), 500


@app.route('/api/upload-list', methods=['POST'])
def upload_materials_list():
    """
    Upload a materials/resume list text file for GPT matching
    
    Returns:
        JSON with session_id and materials count
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file type is allowed
    if not allowed_text_file(file.filename):
        return jsonify({'error': 'File type not allowed. Please upload .txt file'}), 400
    
    try:
        # Read file content
        content = file.read().decode('utf-8')
        
        # Generate session ID
        import uuid
        session_id = str(uuid.uuid4())
        
        # Store in memory (in production, use Redis or database)
        uploaded_lists[session_id] = content
        
        # Parse to count materials
        lines = content.split('\n')
        material_count = 0
        for line in lines:
            line = line.strip()
            if line and line[0].isdigit() and '.' in line:
                material_count += 1
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'material_count': material_count,
            'message': f'Loaded {material_count} materials successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Error processing file: {str(e)}'
        }), 500


@app.route('/api/search', methods=['POST'])
def search_materials():
    """
    Search for materials using natural language description with GPT
    Streams progress updates to the frontend
    
    Accepts JSON body with:
        - description: Text description to search for
        - top_k: Number of results to return (default: 5)
        - session_id: Session ID from materials list upload (optional)
    
    Returns:
        Server-Sent Events stream with progress and final results
    """
    # Get JSON data
    data = request.get_json()
    
    if not data or 'description' not in data:
        return jsonify({'error': 'No description provided'}), 400
    
    description = data.get('description', '').strip()
    top_k = data.get('top_k', 5)
    session_id = data.get('session_id', None)
    
    if not description:
        return jsonify({'error': 'Description cannot be empty'}), 400
    
    def generate():
        """Generator function to stream progress"""
        try:
            # Step 1: Initialize
            yield f"data: {json.dumps({'type': 'log', 'message': '🔧 Initializing GPT matcher...', 'step': 1, 'total': 3})}\n\n"
            
            # Check if using uploaded list or default
            if session_id and session_id in uploaded_lists:
                # Use uploaded list
                list_text = uploaded_lists[session_id]
                matcher = GPTConstructionMatcher(api_key=OPENAI_API_KEY, model="gpt-4o")
                matcher.parse_list(list_text)
            else:
                # Use default list
                matcher = get_gpt_matcher()
            
            yield f"data: {json.dumps({'type': 'log', 'message': f'✅ Loaded {len(matcher.items)} materials', 'step': 2, 'total': 3})}\n\n"
            
            # Step 2: Call GPT (this is where the actual work happens)
            yield f"data: {json.dumps({'type': 'log', 'message': '🤖 Querying GPT-4o...', 'step': 3, 'total': 3})}\n\n"
            
            result = matcher.find_best_match(description, top_k=top_k)
            
            if 'error' in result:
                error_msg = f"Error: {result['error']}"
                yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
                return
            
            # Format as text
            text_output = []
            text_output.append(f"Search query: {description}")
            text_output.append(f"Found {len(result['matches'])} matching materials")
            text_output.append("=" * 80)
            text_output.append("")
            
            # Prepare results data
            results_data = []
            for i, match in enumerate(result['matches'], 1):
                text_output.append(f"{i}. Codigo: {match['code']}")
                text_output.append(f"   Description: {match['description']}")
                text_output.append(f"   Confidence Score: {match['confidence_score']}/100")
                text_output.append(f"   Reasoning: {match['reasoning']}")
                text_output.append("")
                
                results_data.append({
                    'number': match['number'],
                    'codigo': match['code'],
                    'resumen': match['description'],
                    'confidence_score': match['confidence_score'] / 100,  # Convert to 0-1 scale
                    'reasoning': match['reasoning']
                })
            
            result_text = "\n".join(text_output)
            
            # Send final results
            final_data = {
                'type': 'complete',
                'success': True,
                'query': description,
                'count': len(results_data),
                'text': result_text,
                'data': results_data,
                'model_used': result.get('model_used', 'gpt-4o'),
                'total_tokens': result.get('total_tokens', 0)
            }
            
            yield f"data: {json.dumps(final_data)}\n\n"
            
        except Exception as e:
            error_message = f"Error: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'API is running'}), 200


@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)


@app.route('/')
def serve_frontend():
    """Serve the frontend HTML"""
    return send_from_directory('.', 'index.html')


@app.route('/api/docs', methods=['GET'])
def api_docs():
    """API documentation endpoint"""
    return jsonify({
        'message': 'Resume Data API',
        'endpoints': {
            '/api/health': {
                'method': 'GET',
                'description': 'Health check endpoint'
            },
            '/api/upload': {
                'method': 'POST',
                'description': 'Upload Excel file and get resume data with codes',
                'parameters': {
                    'file': 'Excel file (.xlsx or .xls)'
                },
                'returns': 'JSON with text output and data array'
            },
            '/api/upload/text-only': {
                'method': 'POST',
                'description': 'Upload Excel file and get resume text only (no codes)',
                'parameters': {
                    'file': 'Excel file (.xlsx or .xls)'
                },
                'returns': 'JSON with text output and data array'
            },
            '/api/upload/details': {
                'method': 'POST',
                'description': 'Upload Excel file and get full material details',
                'parameters': {
                    'file': 'Excel file (.xlsx or .xls)'
                },
                'returns': 'JSON with text output and detailed data array'
            },
            '/api/search': {
                'method': 'POST',
                'description': 'Search for materials using natural language description',
                'parameters': {
                    'description': 'Text description to search for',
                    'top_k': 'Number of results to return (default: 5)'
                },
                'returns': 'JSON with matching materials and similarity scores'
            }
        },
        'usage': {
            'curl_example': "curl -X POST -F 'file=@/path/to/file.xlsx' http://localhost:5001/api/upload",
            'search_example': "curl -X POST -H 'Content-Type: application/json' -d '{\"description\":\"limpieza de alicatado\"}' http://localhost:5001/api/search"
        }
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

