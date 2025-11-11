# Resume Data API

A Flask API that accepts Excel file uploads and extracts resume (description) data from construction materials database.

## Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Running the API

Start the Flask server:

```bash
python api.py
```

The API will run on `http://localhost:5000`

## API Endpoints

### 1. Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Description**: Check if the API is running
- **Response**: 
```json
{
    "status": "ok",
    "message": "API is running"
}
```

### 2. Upload with Codes
- **URL**: `/api/upload`
- **Method**: `POST`
- **Description**: Upload an Excel file and get resume data with material codes
- **Parameters**: 
  - `file`: Excel file (.xlsx or .xls)
- **Response**:
```json
{
    "success": true,
    "count": 100,
    "text": "Total materials: 100\n...",
    "data": [
        {
            "codigo": "ABC123",
            "resumen": "Material description..."
        }
    ]
}
```

### 3. Upload Text Only
- **URL**: `/api/upload/text-only`
- **Method**: `POST`
- **Description**: Upload an Excel file and get only resume text (no codes)
- **Parameters**: 
  - `file`: Excel file (.xlsx or .xls)
- **Response**:
```json
{
    "success": true,
    "count": 100,
    "text": "Total materials: 100\n...",
    "data": [
        "Material description 1",
        "Material description 2"
    ]
}
```

### 4. Upload with Full Details
- **URL**: `/api/upload/details`
- **Method**: `POST`
- **Description**: Upload an Excel file and get complete material details
- **Parameters**: 
  - `file`: Excel file (.xlsx or .xls)
- **Response**:
```json
{
    "success": true,
    "count": 100,
    "text": "Total materials: 100\n...",
    "data": [
        {
            "codigo": "ABC123",
            "tipo": "Material type",
            "ud": "Unit",
            "resumen": "Material description",
            "precio": 10.50,
            "num_sub_materials": 5
        }
    ]
}
```

## Usage Examples

### Using cURL

```bash
# Basic upload
curl -X POST -F 'file=@/path/to/file.xlsx' http://localhost:5000/api/upload

# Text only
curl -X POST -F 'file=@/path/to/file.xlsx' http://localhost:5000/api/upload/text-only

# Full details
curl -X POST -F 'file=@/path/to/file.xlsx' http://localhost:5000/api/upload/details
```

### Using Python

```python
import requests

# Upload file
url = 'http://localhost:5000/api/upload'
with open('/path/to/file.xlsx', 'rb') as f:
    files = {'file': f}
    response = requests.post(url, files=files)
    
if response.status_code == 200:
    data = response.json()
    print(data['text'])
```

### Using the Example Script

```bash
python api_example.py
```

## File Requirements

- Accepted file types: `.xlsx`, `.xls`
- Maximum file size: 16MB
- File must be a valid Excel database with the expected structure

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing file, invalid file type, etc.)
- `500`: Server error (processing error)

Error responses include a JSON object with an `error` field:

```json
{
    "error": "Error message"
}
```

## Features

- Secure file uploads with filename sanitization
- Temporary file handling (files are automatically deleted after processing)
- Multiple output formats (with codes, text only, full details)
- Comprehensive error handling
- File type validation
- File size limits

## Notes

- The API uses temporary files for processing and automatically cleans them up
- All files are validated for type and size before processing
- The API integrates with the existing `get_all_resumen.py` module

