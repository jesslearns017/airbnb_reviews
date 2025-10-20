"""
Semantic Search Module using OpenAI Embeddings
Provides AI-powered search that understands context and meaning
"""
import os
import pickle
import numpy as np
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Cache file for embeddings
EMBEDDINGS_CACHE_FILE = 'embeddings_cache.pkl'

class SemanticSearch:
    def __init__(self):
        self.embeddings = None
        self.reviews_data = None
        
    def generate_embedding(self, text):
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
    
    def create_embeddings(self, df):
        """Create embeddings for all reviews and cache them"""
        print("Creating embeddings for reviews...")
        
        # Check if cache exists
        if os.path.exists(EMBEDDINGS_CACHE_FILE):
            print("Loading embeddings from cache...")
            with open(EMBEDDINGS_CACHE_FILE, 'rb') as f:
                cache_data = pickle.load(f)
                self.embeddings = cache_data['embeddings']
                self.reviews_data = cache_data['reviews_data']
            print(f"✅ Loaded {len(self.embeddings)} embeddings from cache")
            return
        
        # Create new embeddings
        embeddings = []
        reviews_data = []
        
        total = len(df)
        for idx, row in df.iterrows():
            if idx % 100 == 0:
                print(f"Processing {idx}/{total} reviews...")
            
            text = str(row['comments'])
            embedding = self.generate_embedding(text)
            
            if embedding:
                embeddings.append(embedding)
                reviews_data.append({
                    'id': int(row['id']),
                    'listing_id': int(row['listing_id']),
                    'date': str(row['date']),
                    'reviewer_name': str(row['reviewer_name']),
                    'comments': text
                })
        
        self.embeddings = np.array(embeddings)
        self.reviews_data = reviews_data
        
        # Cache the embeddings
        print("Caching embeddings for future use...")
        with open(EMBEDDINGS_CACHE_FILE, 'wb') as f:
            pickle.dump({
                'embeddings': self.embeddings,
                'reviews_data': self.reviews_data
            }, f)
        
        print(f"✅ Created and cached {len(self.embeddings)} embeddings")
    
    def search(self, query, top_k=20):
        """
        Search for reviews semantically similar to the query
        Returns list of results with similarity scores
        """
        if self.embeddings is None or self.reviews_data is None:
            return []
        
        # Generate embedding for query
        query_embedding = self.generate_embedding(query)
        if query_embedding is None:
            return []
        
        # Calculate cosine similarity
        query_embedding = np.array(query_embedding).reshape(1, -1)
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        
        # Get top K results
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            result = self.reviews_data[idx].copy()
            result['similarity_score'] = float(similarities[idx])
            results.append(result)
        
        return results

# Global instance
semantic_search_engine = SemanticSearch()
