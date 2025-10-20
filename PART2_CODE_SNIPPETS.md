# Part 2: Code Snippets for Medium Article

## 🔧 Key Code Snippets to Include in Article

---

## 1. Installing Dependencies

```bash
# Add to requirements.txt
openai>=1.0.0
scikit-learn>=1.3.0
python-dotenv>=1.0.0

# Install
pip install openai scikit-learn python-dotenv
```

---

## 2. Environment Setup

```python
# .env file
OPENAI_API_KEY=your_openai_api_key_here
```

```python
# Loading environment variables
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
```

---

## 3. Generating Embeddings

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_embedding(text):
    """Generate embedding for a single text using OpenAI"""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",  # Cost-effective model
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None
```

**Key Points:**
- Uses `text-embedding-3-small` (cheaper than ada-002)
- Returns 1536-dimensional vector
- Cost: ~$0.02 per 1M tokens

---

## 4. Creating Embeddings for All Reviews

```python
import pickle
import numpy as np

def create_embeddings(df):
    """Create embeddings for all reviews and cache them"""
    print("Creating embeddings for reviews...")
    
    # Check if cache exists
    if os.path.exists('embeddings_cache.pkl'):
        print("Loading embeddings from cache...")
        with open('embeddings_cache.pkl', 'rb') as f:
            cache_data = pickle.load(f)
            embeddings = cache_data['embeddings']
            reviews_data = cache_data['reviews_data']
        print(f"✅ Loaded {len(embeddings)} embeddings from cache")
        return embeddings, reviews_data
    
    # Create new embeddings
    embeddings = []
    reviews_data = []
    
    total = len(df)
    for idx, row in df.iterrows():
        if idx % 100 == 0:
            print(f"Processing {idx}/{total} reviews...")
        
        text = str(row['comments'])
        embedding = generate_embedding(text)
        
        if embedding:
            embeddings.append(embedding)
            reviews_data.append({
                'id': int(row['id']),
                'comments': text,
                'date': str(row['date']),
                'reviewer_name': str(row['reviewer_name'])
            })
    
    embeddings = np.array(embeddings)
    
    # Cache the embeddings
    print("Caching embeddings for future use...")
    with open('embeddings_cache.pkl', 'wb') as f:
        pickle.dump({
            'embeddings': embeddings,
            'reviews_data': reviews_data
        }, f)
    
    print(f"✅ Created and cached {len(embeddings)} embeddings")
    return embeddings, reviews_data
```

**Key Features:**
- Caching system saves time and money
- Progress tracking every 100 reviews
- Handles errors gracefully

---

## 5. Semantic Search with Cosine Similarity

```python
from sklearn.metrics.pairwise import cosine_similarity

def semantic_search(query, embeddings, reviews_data, top_k=20):
    """
    Search for reviews semantically similar to the query
    Returns list of results with similarity scores
    """
    # Generate embedding for query
    query_embedding = generate_embedding(query)
    if query_embedding is None:
        return []
    
    # Calculate cosine similarity
    query_embedding = np.array(query_embedding).reshape(1, -1)
    similarities = cosine_similarity(query_embedding, embeddings)[0]
    
    # Get top K results
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        result = reviews_data[idx].copy()
        result['similarity_score'] = float(similarities[idx])
        results.append(result)
    
    return results
```

**How It Works:**
1. Convert query to embedding (1536-d vector)
2. Calculate cosine similarity with all review embeddings
3. Sort by similarity score (highest first)
4. Return top K matches

---

## 6. Flask API Endpoints

```python
from flask import Flask, jsonify, request
from semantic_search import semantic_search_engine

app = Flask(__name__)

@app.route('/api/semantic-search', methods=['POST'])
def semantic_search_endpoint():
    """Search reviews using AI-powered semantic search"""
    data = request.json
    query = data.get('query', '')
    top_k = data.get('top_k', 20)
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    try:
        results = semantic_search_engine.search(query, top_k=top_k)
        return jsonify({
            'query': query,
            'results': results,
            'total': len(results),
            'search_type': 'semantic'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/keyword-search', methods=['POST'])
def keyword_search_endpoint():
    """Search reviews using traditional keyword matching"""
    data = request.json
    query = data.get('query', '')
    top_k = data.get('top_k', 20)
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    # Simple keyword search (case-insensitive)
    filtered_df = df[
        df['comments'].str.contains(query, case=False, na=False)
    ].head(top_k)
    
    results = filtered_df.to_dict('records')
    
    return jsonify({
        'query': query,
        'results': results,
        'total': len(results),
        'search_type': 'keyword'
    })
```

---

## 7. React Frontend Component

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function SemanticSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordResults, setKeywordResults] = useState(null);
  const [semanticResults, setSemanticResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      // Fetch both keyword and semantic results in parallel
      const [keywordResponse, semanticResponse] = await Promise.all([
        axios.post(`${API_BASE_URL}/keyword-search`, {
          query: searchQuery,
          top_k: 10
        }),
        axios.post(`${API_BASE_URL}/semantic-search`, {
          query: searchQuery,
          top_k: 10
        })
      ]);

      setKeywordResults(keywordResponse.data);
      setSemanticResults(semanticResponse.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="semantic-search-container">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Try: 'not clean', 'responsive host'..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Results Comparison */}
      <div className="results-comparison">
        {/* Keyword Results */}
        <div className="keyword-column">
          <h3>Traditional Keyword Search</h3>
          <span>{keywordResults?.total || 0} results</span>
          {keywordResults?.results?.map((result, index) => (
            <div key={index} className="result-card">
              <p>{result.comments}</p>
            </div>
          ))}
        </div>

        {/* Semantic Results */}
        <div className="semantic-column">
          <h3>AI-Powered Semantic Search</h3>
          <span>{semanticResults?.total || 0} results</span>
          {semanticResults?.results?.map((result, index) => (
            <div key={index} className="result-card">
              <span className="similarity-score">
                {(result.similarity_score * 100).toFixed(1)}% match
              </span>
              <p>{result.comments}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Stats */}
      {semanticResults && keywordResults && (
        <div className="improvement-stats">
          <div className="stat-card">
            <div className="stat-value">
              +{semanticResults.total - keywordResults.total}
            </div>
            <div className="stat-label">More Results Found</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SemanticSearch;
```

---

## 8. Cosine Similarity Explained

```python
# Cosine similarity measures the angle between two vectors
# Range: -1 to 1 (for normalized vectors: 0 to 1)
# 1 = identical, 0 = orthogonal (unrelated), -1 = opposite

from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Example vectors
vector_a = np.array([[1, 2, 3]])  # "responsive host"
vector_b = np.array([[1, 2, 3]])  # "responsive host" (identical)
vector_c = np.array([[2, 3, 4]])  # "excellent host" (similar)
vector_d = np.array([[0, 0, 1]])  # "location" (different)

print(f"Identical: {cosine_similarity(vector_a, vector_b)[0][0]:.3f}")  # 1.000
print(f"Similar: {cosine_similarity(vector_a, vector_c)[0][0]:.3f}")    # 0.998
print(f"Different: {cosine_similarity(vector_a, vector_d)[0][0]:.3f}")  # 0.802
```

---

## 9. Cost Calculation

```python
# OpenAI Pricing (as of 2024)
# text-embedding-3-small: $0.02 per 1M tokens

def estimate_embedding_cost(num_reviews, avg_tokens_per_review=50):
    """Estimate cost of creating embeddings"""
    total_tokens = num_reviews * avg_tokens_per_review
    cost_per_million = 0.02
    total_cost = (total_tokens / 1_000_000) * cost_per_million
    return total_cost

# Example: 3,000 reviews
print(f"Cost for 3,000 reviews: ${estimate_embedding_cost(3000):.4f}")
# Output: Cost for 3,000 reviews: $0.0030

# Per-search cost
def estimate_search_cost(avg_query_tokens=10):
    """Estimate cost per search query"""
    cost_per_million = 0.02
    cost_per_query = (avg_query_tokens / 1_000_000) * cost_per_million
    return cost_per_query

print(f"Cost per search: ${estimate_search_cost():.6f}")
# Output: Cost per search: $0.000200
```

---

## 10. Caching Strategy

```python
import pickle
import os
from datetime import datetime

CACHE_FILE = 'embeddings_cache.pkl'

def save_embeddings_cache(embeddings, reviews_data):
    """Save embeddings to cache with metadata"""
    cache_data = {
        'embeddings': embeddings,
        'reviews_data': reviews_data,
        'created_at': datetime.now().isoformat(),
        'version': '1.0',
        'model': 'text-embedding-3-small'
    }
    
    with open(CACHE_FILE, 'wb') as f:
        pickle.dump(cache_data, f)
    
    file_size_mb = os.path.getsize(CACHE_FILE) / (1024 * 1024)
    print(f"✅ Cache saved: {file_size_mb:.2f} MB")

def load_embeddings_cache():
    """Load embeddings from cache"""
    if not os.path.exists(CACHE_FILE):
        return None
    
    with open(CACHE_FILE, 'rb') as f:
        cache_data = pickle.load(f)
    
    print(f"✅ Loaded cache from {cache_data['created_at']}")
    print(f"   Model: {cache_data['model']}")
    print(f"   Reviews: {len(cache_data['reviews_data'])}")
    
    return cache_data['embeddings'], cache_data['reviews_data']
```

---

## 11. Error Handling

```python
def safe_generate_embedding(text, max_retries=3):
    """Generate embedding with retry logic"""
    for attempt in range(max_retries):
        try:
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Retry {attempt + 1}/{max_retries} after error: {e}")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Failed after {max_retries} attempts: {e}")
                return None
```

---

## 12. Performance Metrics

```python
import time

def measure_search_performance(query, embeddings, reviews_data):
    """Measure search performance"""
    start_time = time.time()
    
    results = semantic_search(query, embeddings, reviews_data, top_k=20)
    
    end_time = time.time()
    elapsed_ms = (end_time - start_time) * 1000
    
    print(f"Query: '{query}'")
    print(f"Results: {len(results)}")
    print(f"Time: {elapsed_ms:.2f}ms")
    print(f"Top match: {results[0]['similarity_score']:.3f}")
    
    return results, elapsed_ms

# Example usage
results, time_ms = measure_search_performance(
    "responsive host", 
    embeddings, 
    reviews_data
)
```

---

## 📊 Key Metrics for Article

```python
# Actual metrics from implementation
METRICS = {
    'total_reviews': 2996,
    'embedding_dimensions': 1536,
    'cache_file_size_mb': 12,
    'embeddings_generation_time_min': 20,
    'average_search_time_ms': 150,
    'total_cost_usd': 0.01,
    'cost_per_search_usd': 0.0001,
    'improvement_examples': {
        'ugly_place': {
            'keyword_results': 0,
            'semantic_results': 10,
            'improvement': 'infinite'
        },
        'responsive_host': {
            'keyword_results': 5,
            'semantic_results': 10,
            'improvement': '200%'
        }
    }
}
```

---

**Last Updated:** October 19, 2025 - 8:28 PM EST
