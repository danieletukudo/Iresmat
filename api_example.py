#!/usr/bin/env python3
"""
Example script showing how to use the Resume Data API
"""

import requests


def test_api(file_path):
    """Test the API with a sample file"""
    
    # API endpoint
    url = 'http://localhost:5000/api/upload'
    
    # Open and send the file
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)
    
    # Check response
    if response.status_code == 200:
        data = response.json()
        print("Success!")
        print(f"Total materials: {data['count']}")
        print("\nText output:")
        print(data['text'])
    else:
        print(f"Error: {response.status_code}")
        print(response.json())


def test_api_text_only(file_path):
    """Test the text-only API endpoint"""
    
    # API endpoint
    url = 'http://localhost:5000/api/upload/text-only'
    
    # Open and send the file
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)
    
    # Check response
    if response.status_code == 200:
        data = response.json()
        print("Success!")
        print(f"Total materials: {data['count']}")
        print("\nText output:")
        print(data['text'])
    else:
        print(f"Error: {response.status_code}")
        print(response.json())


def test_api_details(file_path):
    """Test the detailed API endpoint"""
    
    # API endpoint
    url = 'http://localhost:5000/api/upload/details'
    
    # Open and send the file
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)
    
    # Check response
    if response.status_code == 200:
        data = response.json()
        print("Success!")
        print(f"Total materials: {data['count']}")
        print("\nText output:")
        print(data['text'][:500])  # Show first 500 chars
        print("...")
    else:
        print(f"Error: {response.status_code}")
        print(response.json())


if __name__ == '__main__':
    # Example usage with the sample database
    file_path = '/Users/danielsamuel/PycharmProjects/RAG/correct_sample/DATABSE.xlsx'
    
    print("=" * 80)
    print("Testing /api/upload endpoint (with codes)")
    print("=" * 80)
    test_api(file_path)
    
    print("\n\n" + "=" * 80)
    print("Testing /api/upload/text-only endpoint")
    print("=" * 80)
    test_api_text_only(file_path)
    
    print("\n\n" + "=" * 80)
    print("Testing /api/upload/details endpoint")
    print("=" * 80)
    test_api_details(file_path)

