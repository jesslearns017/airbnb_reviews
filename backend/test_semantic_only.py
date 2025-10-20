"""
Simple test for semantic search only
"""
import requests
import json

API_URL = "http://127.0.0.1:5000/api"

def test_semantic_search(query):
    """Test semantic search"""
    print(f"\n{'='*60}")
    print(f"🔍 Testing Query: '{query}'")
    print(f"{'='*60}\n")
    
    try:
        # Test semantic search
        print("🤖 SEMANTIC SEARCH (AI-Powered):")
        response = requests.post(f"{API_URL}/semantic-search", json={
            "query": query,
            "top_k": 5
        })
        
        if response.status_code == 200:
            results = response.json()
            print(f"   ✅ Found: {results['total']} results\n")
            
            if results['results']:
                for i, result in enumerate(results['results'], 1):
                    score = result['similarity_score']
                    comment = result['comments'][:150]
                    print(f"   {i}. [Similarity: {score:.3f}]")
                    print(f"      {comment}...\n")
            else:
                print("   No results found")
        else:
            print(f"   ❌ Error: {response.status_code}")
            print(f"   {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    print("\n🚀 SEMANTIC SEARCH TEST")
    print("="*60)
    
    # Test queries
    queries = [
        "not clean",
        "responsive host",
        "great location",
        "uncomfortable bed",
        "noisy neighborhood"
    ]
    
    for query in queries:
        test_semantic_search(query)
    
    print(f"\n{'='*60}")
    print("✅ Testing complete!")
    print(f"{'='*60}\n")
