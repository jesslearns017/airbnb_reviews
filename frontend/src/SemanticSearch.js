import React, { useState } from 'react';
import axios from 'axios';
import { Search, Sparkles, List } from 'lucide-react';
import './SemanticSearch.css';

const API_BASE_URL = 'https://airbnb-sentiment-api.onrender.com/api';

function SemanticSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordResults, setKeywordResults] = useState(null);
  const [semanticResults, setSemanticResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="semantic-search-container">
      <div className="semantic-search-header">
        <h2>🔍 AI-Powered Semantic Search</h2>
        <p className="semantic-search-subtitle">
          Compare traditional keyword search with AI-powered semantic search that understands context and meaning
        </p>
      </div>

      {/* Search Input */}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Try: 'not clean', 'responsive host', 'great location'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="search-button"
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results Comparison */}
      {searched && !loading && (
        <div className="results-comparison">
          {/* Keyword Search Results */}
          <div className="results-column keyword-column">
            <div className="results-header">
              <List size={20} />
              <h3>Traditional Keyword Search</h3>
              <span className="results-count">
                {keywordResults?.total || 0} results
              </span>
            </div>
            <p className="results-description">
              Finds exact matches of your search terms
            </p>
            
            <div className="results-list">
              {keywordResults?.results?.length > 0 ? (
                keywordResults.results.map((result, index) => (
                  <div key={index} className="result-card keyword-card">
                    <div className="result-meta">
                      <span className="result-number">#{index + 1}</span>
                      <span className="result-reviewer">{result.reviewer_name}</span>
                      <span className="result-date">{result.date}</span>
                    </div>
                    <p className="result-text">{result.comments}</p>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No exact matches found</p>
                  <span className="no-results-hint">
                    Try different keywords or check the semantic search results →
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Semantic Search Results */}
          <div className="results-column semantic-column">
            <div className="results-header semantic-header">
              <Sparkles size={20} />
              <h3>AI-Powered Semantic Search</h3>
              <span className="results-count semantic-count">
                {semanticResults?.total || 0} results
              </span>
            </div>
            <p className="results-description">
              Understands context and finds similar meanings
            </p>
            
            <div className="results-list">
              {semanticResults?.results?.length > 0 ? (
                semanticResults.results.map((result, index) => (
                  <div key={index} className="result-card semantic-card">
                    <div className="result-meta">
                      <span className="result-number">#{index + 1}</span>
                      <span className="similarity-score">
                        {(result.similarity_score * 100).toFixed(1)}% match
                      </span>
                      <span className="result-reviewer">{result.reviewer_name}</span>
                      <span className="result-date">{result.date}</span>
                    </div>
                    <p className="result-text">{result.comments}</p>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No results found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Improvement Stats */}
      {searched && !loading && semanticResults && keywordResults && (
        <div className="improvement-stats">
          <div className="stat-card">
            <div className="stat-value">
              +{semanticResults.total - keywordResults.total}
            </div>
            <div className="stat-label">More Results Found</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {keywordResults.total > 0 
                ? `${Math.round((semanticResults.total / keywordResults.total) * 100)}%`
                : '∞'}
            </div>
            <div className="stat-label">Improvement</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {semanticResults.results[0]?.similarity_score 
                ? `${(semanticResults.results[0].similarity_score * 100).toFixed(1)}%`
                : 'N/A'}
            </div>
            <div className="stat-label">Top Match Score</div>
          </div>
        </div>
      )}

      {/* Example Queries */}
      {!searched && (
        <div className="example-queries">
          <h4>Try these example searches:</h4>
          <div className="example-buttons">
            <button onClick={() => { setSearchQuery('not clean'); handleSearch(); }}>
              "not clean"
            </button>
            <button onClick={() => { setSearchQuery('responsive host'); handleSearch(); }}>
              "responsive host"
            </button>
            <button onClick={() => { setSearchQuery('great location'); handleSearch(); }}>
              "great location"
            </button>
            <button onClick={() => { setSearchQuery('uncomfortable bed'); handleSearch(); }}>
              "uncomfortable bed"
            </button>
            <button onClick={() => { setSearchQuery('noisy'); handleSearch(); }}>
              "noisy"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SemanticSearch;
