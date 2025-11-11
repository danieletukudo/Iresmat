#!/usr/bin/env python3
"""
Quick test script for GPT-powered search
"""

import requests
import json
import sys

API_URL = 'http://localhost:5001/api/search'

def test_search(description, top_k=5):
    """Test the GPT search with streaming"""
    print(f"\n{'='*80}")
    print(f"Testing GPT Search")
    print(f"{'='*80}")
    print(f"Description: {description}")
    print(f"Top K: {top_k}")
    print(f"{'='*80}\n")
    
    try:
        response = requests.post(
            API_URL,
            json={'description': description, 'top_k': top_k},
            stream=True
        )
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return
        
        # Process streaming response
        buffer = ''
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data_str = line_str[6:]  # Remove 'data: ' prefix
                    try:
                        data = json.loads(data_str)
                        
                        if data['type'] == 'log':
                            print(f"  {data['message']}")
                        elif data['type'] == 'complete':
                            print(f"\n{'='*80}")
                            print(f"✅ RESULTS")
                            print(f"{'='*80}\n")
                            print(f"Query: {data['query']}")
                            print(f"Found: {data['count']} materials")
                            print(f"Model: {data.get('model_used', 'N/A')}")
                            print(f"Tokens: {data.get('total_tokens', 'N/A')}\n")
                            
                            for i, material in enumerate(data['data'], 1):
                                print(f"{i}. {material['codigo']}")
                                print(f"   Description: {material['resumen'][:80]}...")
                                print(f"   Confidence: {material['confidence_score']*100:.1f}%")
                                print(f"   Reasoning: {material['reasoning'][:100]}...")
                                print()
                        elif data['type'] == 'error':
                            print(f"\n❌ Error: {data['message']}")
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON: {e}")
                        print(f"Raw data: {data_str}")
        
        print(f"\n{'='*80}")
        print("Test completed!")
        print(f"{'='*80}\n")
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == '__main__':
    # Get description from command line or use default
    if len(sys.argv) > 1:
        description = ' '.join(sys.argv[1:])
        test_search(description)
    else:
        # Test with a few examples
        examples = [
            "REPARACION DE FRENTE DE FORJADO CON PROPAM REPAR 40",
            "limpieza de alicatado cerámico",
            "demolición de aplacado pétreo"
        ]
        
        print("\n" + "="*80)
        print("Available test examples:")
        print("="*80)
        for i, ex in enumerate(examples, 1):
            print(f"{i}. {ex}")
        print("\nUsage:")
        print("  python test_gpt_search.py 'your description here'")
        print("  python test_gpt_search.py limpieza de alicatado cerámico")
        print("\nMake sure the API server is running on port 5001!")

