"""
Test script for semantic search API
Compares keyword vs semantic search results
"""
import requests
import json

API_URL = "http://127.0.0.1:5000/api"

def test_search(query):
    """Test both keyword and semantic search for a query"""
    print(f"\n{'='*60}")
    print(f"🔍 Testing Query: '{query}'")
    print(f"{'='*60}\n")
    
    # Test keyword search
    print("📝 KEYWORD SEARCH (Traditional):")
    keyword_response = requests.post(f"{API_URL}/keyword-search", json={
        "query": query,
        "top_k": 5
    })
    keyword_results = keyword_response.json()
    print(f"   Found: {keyword_results['total']} results")
    if keyword_results['results']:
        for i, result in enumerate(keyword_results['results'][:3], 1):
            print(f"   {i}. {result['comments'][:100]}...")
    else:
        print("   No results found")
    
    # Test semantic search
    print("\n🤖 SEMANTIC SEARCH (AI-Powered):")
    semantic_response = requests.post(f"{API_URL}/semantic-search", json={
        "query": query,
        "top_k": 5
    })
    semantic_results = semantic_response.json()
    print(f"   Found: {semantic_results['total']} results")
    if semantic_results['results']:
        for i, result in enumerate(semantic_results['results'][:3], 1):
            score = result['similarity_score']
            print(f"   {i}. [Score: {score:.3f}] {result['comments'][:100]}...")
    else:
        print("   No results found")
    
    # Compare
    improvement = semantic_results['total'] - keyword_results['total']
    print(f"\n📊 IMPROVEMENT: +{improvement} more results with semantic search")
    print(f"   Keyword: {keyword_results['total']} | Semantic: {semantic_results['total']}")

if __name__ == "__main__":
    print("\n🚀 SEMANTIC SEARCH TEST SUITE")
    print("="*60)
    
    # Test cases that show semantic search advantages
    test_queries = [
        "not clean",           # Negation - should find "dirty", "filthy"
        "responsive host",     # Should find "quick reply", "attentive"
        "great location",      # Should find "convenient", "walkable"
        "uncomfortable bed",   # Should find "poor sleep", "mattress issues"
        "noisy",              # Should find "loud", "disturbing sounds"
    ]
    
    for query in test_queries:
        test_search(query)
    
    print(f"\n{'='*60}")
    print("✅ Testing complete!")
    print(f"{'='*60}\n")
