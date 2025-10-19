import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  MessageSquare, 
  BarChart3, 
  Search,
  Smile,
  Frown,
  Meh,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Home,
  Hotel
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

// Loading Spinner Component
const LoadingSpinner = ({ message = 'Loading data...', icon = null }) => {
  return (
    <div className="loading">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        {icon && <div className="loading-icon">{icon}</div>}
      </div>
      <div className="loading-text">{message}</div>
      <div className="loading-dots">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
    </div>
  );
};

function App() {
  const [statistics, setStatistics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [analyzeText, setAnalyzeText] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
    fetchTrends();
    fetchReviews();
    fetchDatasetInfo();
  }, []);
  
  const fetchDatasetInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dataset-info`);
      setDatasetInfo(response.data);
    } catch (error) {
      console.error('Error fetching dataset info:', error);
    }
  };
  
  const handleCancelLoading = () => {
    setCancelLoading(true);
  };
  
  const handleLoadMoreData = async () => {
    if (!datasetInfo || !datasetInfo.can_load_more) return;
    
    const remainingReviews = datasetInfo.total_available - datasetInfo.loaded;
    const batchSize = 2500; // Load 2500 reviews per batch
    const maxBatches = Math.ceil(remainingReviews / batchSize);
    
    // Ask user how many batches to load
    const userChoice = prompt(
      `You have ${remainingReviews.toLocaleString()} reviews remaining.\n\n` +
      `Full dataset: ${maxBatches} batches (~${Math.round(remainingReviews * 0.004 / 60)} minutes)\n` +
      `Recommended: 4 batches (10,000 reviews, ~40 seconds)\n` +
      `Quick: 2 batches (5,000 reviews, ~20 seconds)\n\n` +
      `How many batches would you like to load? (1-${maxBatches})`,
      '4'
    );
    
    if (!userChoice) return; // User cancelled
    
    const numBatches = parseInt(userChoice);
    if (isNaN(numBatches) || numBatches < 1 || numBatches > maxBatches) {
      alert(`Please enter a number between 1 and ${maxBatches}`);
      return;
    }
    
    const reviewsToLoad = Math.min(numBatches * batchSize, remainingReviews);
    
    // Get time estimate
    try {
      const estimateResponse = await axios.post(`${API_BASE_URL}/estimate-load-time`, {
        sample_size: reviewsToLoad
      });
      
      const estimatedTime = estimateResponse.data.estimated_minutes;
      
      setLoadingProgress({
        current: datasetInfo.loaded,
        target: datasetInfo.loaded + reviewsToLoad,
        currentBatch: 0,
        totalBatches: numBatches,
        estimatedMinutes: estimatedTime
      });
      setShowLoadingModal(true);
      setLoadingMore(true);
      setCancelLoading(false);
      
      // Load in batches
      let currentLoaded = datasetInfo.loaded;
      for (let i = 0; i < numBatches; i++) {
        // Check if user cancelled
        if (cancelLoading) {
          setLoadingProgress(prev => ({
            ...prev,
            message: 'Loading cancelled by user. Refreshing with current data...'
          }));
          break;
        }
        
        const targetSize = Math.min(currentLoaded + batchSize, datasetInfo.total_available);
        
        setLoadingProgress(prev => ({
          ...prev,
          currentBatch: i + 1,
          current: targetSize,
          message: `Loading batch ${i + 1} of ${numBatches}...`
        }));
        
        const response = await axios.post(`${API_BASE_URL}/reload-data`, {
          sample_size: targetSize
        });
        
        if (response.data.success) {
          currentLoaded = response.data.loaded;
        }
      }
      
      // Refresh all data
      await fetchStatistics();
      await fetchTrends();
      await fetchReviews();
      await fetchDatasetInfo();
      
      setLoadingProgress(prev => ({
        ...prev,
        message: 'Complete! Refreshing dashboard...'
      }));
      
      setTimeout(() => {
        setShowLoadingModal(false);
        setLoadingMore(false);
        setLoadingProgress(null);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading more data:', error);
      setShowLoadingModal(false);
      setLoadingMore(false);
      setLoadingProgress(null);
      alert('Failed to load more data. Please try again.');
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [page, sentimentFilter, activeTab]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trends`);
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 10,
        sentiment: sentimentFilter,
        search: searchQuery
      };
      const response = await axios.get(`${API_BASE_URL}/reviews`, { params });
      setReviews(response.data.reviews);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReviews();
  };

  const handleAnalyze = async () => {
    if (!analyzeText.trim()) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        text: analyzeText
      });
      setAnalyzeResult(response.data);
    } catch (error) {
      console.error('Error analyzing text:', error);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="sentiment-icon positive" />;
      case 'negative':
        return <Frown className="sentiment-icon negative" />;
      default:
        return <Meh className="sentiment-icon neutral" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '#10b981';
      case 'negative':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderDashboard = () => {
    if (!statistics || !trends) return <LoadingSpinner message="Analyzing sentiment data..." icon={<Home size={32} />} />;

    const pieData = [
      { name: 'Positive', value: statistics.sentiment_distribution.positive, color: '#10b981' },
      { name: 'Neutral', value: statistics.sentiment_distribution.neutral, color: '#6b7280' },
      { name: 'Negative', value: statistics.sentiment_distribution.negative, color: '#ef4444' }
    ];

    return (
      <div className="dashboard">
        {datasetInfo && datasetInfo.can_load_more && (
          <div className="dataset-info-banner">
            <div className="dataset-info-content">
              <span className="dataset-info-text">
                📊 Currently showing {datasetInfo.loaded.toLocaleString()} of {datasetInfo.total_available.toLocaleString()} reviews
                <span className="dataset-info-subtext">
                  ({(datasetInfo.total_available - datasetInfo.loaded).toLocaleString()} more available)
                </span>
              </span>
              <button 
                className="load-more-btn" 
                onClick={handleLoadMoreData}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          </div>
        )}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Reviews</div>
              <div className="stat-value">{statistics.total_reviews.toLocaleString()}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>
              <Smile size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Positive Reviews</div>
              <div className="stat-value">{statistics.sentiment_distribution.positive.toLocaleString()}</div>
              <div className="stat-percentage">
                {((statistics.sentiment_distribution.positive / statistics.total_reviews) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>
              <Frown size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Negative Reviews</div>
              <div className="stat-value">{statistics.sentiment_distribution.negative.toLocaleString()}</div>
              <div className="stat-percentage">
                {((statistics.sentiment_distribution.negative / statistics.total_reviews) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Avg Polarity</div>
              <div className="stat-value">{statistics.average_polarity.toFixed(3)}</div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Sentiment Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.monthly_polarity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  domain={[-1, 1]} 
                  label={{ value: 'Average Polarity Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [value.toFixed(3), 'Polarity']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend 
                  payload={[
                    { value: 'Average Polarity (-1 = Negative, 0 = Neutral, +1 = Positive)', type: 'line', color: '#8b5cf6' }
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="polarity" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Polarity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {statistics.most_positive_review && (
          <div className="highlight-reviews">
            <div className="review-highlight positive">
              <h3><Smile size={20} /> Most Positive Review</h3>
              <p className="review-text">{statistics.most_positive_review.comments}</p>
              <div className="review-meta">
                <span>By: {statistics.most_positive_review.reviewer_name}</span>
                <span className="polarity">Polarity: {statistics.most_positive_review.polarity.toFixed(3)}</span>
              </div>
            </div>

            {statistics.most_negative_review && (
              <div className="review-highlight negative">
                <h3><Frown size={20} /> Most Negative Review</h3>
                <p className="review-text">{statistics.most_negative_review.comments}</p>
                <div className="review-meta">
                  <span>By: {statistics.most_negative_review.reviewer_name}</span>
                  <span className="polarity">Polarity: {statistics.most_negative_review.polarity.toFixed(3)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Methodology & Insights Section */}
        <div className="methodology-section">
          <h2 className="methodology-title">📊 Methodology & Data Insights</h2>
          
          <div className="methodology-grid">
            <div className="methodology-card">
              <h3>🔬 Sentiment Analysis Model</h3>
              <p>
                This analysis uses <strong>TextBlob</strong>, a Python library for Natural Language Processing (NLP) 
                that employs a <strong>pre-trained Naive Bayes classifier</strong> combined with pattern-based rules.
              </p>
              <ul>
                <li><strong>Polarity Score:</strong> Ranges from -1 (most negative) to +1 (most positive)</li>
                <li><strong>Classification:</strong> Positive (&gt;0.1), Neutral (-0.1 to 0.1), Negative (&lt;-0.1)</li>
                <li><strong>Subjectivity:</strong> Measures opinion vs. factual content (0 to 1)</li>
              </ul>
            </div>

            <div className="methodology-card">
              <h3>📈 Data Distribution</h3>
              <p>
                <strong>Dataset Composition:</strong> {statistics.total_reviews.toLocaleString()} unique Airbnb reviews analyzed 
                (duplicates removed for data quality)
              </p>
              <div className="data-breakdown">
                <div className="breakdown-item positive-bg">
                  <strong>{statistics.sentiment_distribution.positive.toLocaleString()}</strong> Positive 
                  ({((statistics.sentiment_distribution.positive / statistics.total_reviews) * 100).toFixed(1)}%)
                </div>
                <div className="breakdown-item neutral-bg">
                  <strong>{statistics.sentiment_distribution.neutral.toLocaleString()}</strong> Neutral 
                  ({((statistics.sentiment_distribution.neutral / statistics.total_reviews) * 100).toFixed(1)}%)
                </div>
                <div className="breakdown-item negative-bg">
                  <strong>{statistics.sentiment_distribution.negative.toLocaleString()}</strong> Negative 
                  ({((statistics.sentiment_distribution.negative / statistics.total_reviews) * 100).toFixed(1)}%)
                </div>
              </div>
              <p className="data-note">
                {statistics.sentiment_distribution.positive > statistics.sentiment_distribution.negative ? (
                  <span>⚠️ <strong>Data Bias:</strong> The dataset shows a positive skew with {((statistics.sentiment_distribution.positive / statistics.total_reviews) * 100).toFixed(1)}% positive reviews, which is typical for Airbnb platforms where satisfied customers are more likely to leave reviews.</span>
                ) : (
                  <span>📊 The dataset shows a relatively balanced distribution across sentiment categories.</span>
                )}
              </p>
            </div>

            <div className="methodology-card">
              <h3>⚙️ Technical Implementation</h3>
              <ul>
                <li><strong>Data Quality:</strong> Duplicate reviews are automatically removed to ensure data integrity</li>
                <li><strong>Pre-processing:</strong> Reviews analyzed as-is without stemming (e.g., "running" → "run") or lemmatization (e.g., "better" → "good") to preserve natural language nuances and sentiment intensity</li>
                <li><strong>Performance:</strong> Sentiment scores pre-calculated at startup for instant loading</li>
                <li><strong>Scalability:</strong> Batch processing system allows incremental data loading</li>
                <li><strong>Evaluation Metrics:</strong> Primary metric is accuracy (~70-80%). For production, consider precision (correct positive predictions), recall (finding all positives), and F1-score (harmonic mean of precision/recall)</li>
              </ul>
            </div>

            <div className="methodology-card">
              <h3>💡 Key Insights</h3>
              <ul>
                <li><strong>Average Polarity:</strong> {statistics.average_polarity.toFixed(3)} indicates {statistics.average_polarity > 0.1 ? 'generally positive' : statistics.average_polarity < -0.1 ? 'generally negative' : 'neutral'} sentiment overall</li>
                <li><strong>Variability:</strong> Standard deviation of {statistics.polarity_std.toFixed(3)} shows {statistics.polarity_std > 0.5 ? 'high' : 'moderate'} diversity in review sentiments</li>
                <li><strong>Trend Analysis:</strong> Monthly trends reveal seasonal patterns and temporal sentiment shifts</li>
                <li><strong>Use Case:</strong> This analysis is ideal for identifying customer satisfaction patterns, not for production-grade sentiment classification</li>
              </ul>
            </div>
          </div>

          <div className="methodology-footer">
            <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>
              💡 Upgrading for Production Use
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Current Approach:</strong> This analysis uses TextBlob, a rule-based NLP library. 
              Excellent for exploratory analysis and learning, but has limitations with domain-specific language.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>For Production Applications:</strong> Consider domain-specific sentiment models trained 
              on Airbnb/hotel reviews. These understand phrases like "responsive host", "accurate listing", 
              "easy check-in", and "great location" with 85-95% accuracy.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Upgrade Options:</strong>
            </p>
            <ul style={{ marginBottom: '1rem' }}>
              <li><strong>Pre-trained BERT models</strong> (easiest): Ready-to-use models trained on 600k+ hotel reviews</li>
              <li><strong>Fine-tuned custom models</strong> (most accurate): Train on your specific Airbnb dataset</li>
              <li><strong>GPT-4 API</strong> (most flexible): Advanced analysis with explanations, but higher cost</li>
            </ul>
            <p style={{ fontSize: '0.9rem', opacity: '0.95', textAlign: 'center' }}>
              📚 See <strong>DOMAIN_SPECIFIC_UPGRADE.md</strong> in the project repository for detailed implementation guides, 
              code examples, and migration strategies.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    return (
      <div className="reviews-section">
        <div className="reviews-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn">
              <Search size={20} />
            </button>
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${sentimentFilter === '' ? 'active' : ''}`}
              onClick={() => { setSentimentFilter(''); setPage(1); }}
            >
              All
            </button>
            <button
              className={`filter-btn positive ${sentimentFilter === 'positive' ? 'active' : ''}`}
              onClick={() => { setSentimentFilter('positive'); setPage(1); }}
            >
              <Smile size={16} /> Positive
            </button>
            <button
              className={`filter-btn neutral ${sentimentFilter === 'neutral' ? 'active' : ''}`}
              onClick={() => { setSentimentFilter('neutral'); setPage(1); }}
            >
              <Meh size={16} /> Neutral
            </button>
            <button
              className={`filter-btn negative ${sentimentFilter === 'negative' ? 'active' : ''}`}
              onClick={() => { setSentimentFilter('negative'); setPage(1); }}
            >
              <Frown size={16} /> Negative
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading reviews..." />
        ) : (
          <>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.reviewer_name}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="sentiment-badge" style={{ background: getSentimentColor(review.sentiment) }}>
                      {getSentimentIcon(review.sentiment)}
                      <span>{review.sentiment}</span>
                    </div>
                  </div>
                  <p className="review-text">{review.comments}</p>
                  <div className="review-metrics">
                    <span>Polarity: <strong>{review.polarity.toFixed(3)}</strong></span>
                    <span>Subjectivity: <strong>{review.subjectivity.toFixed(3)}</strong></span>
                    <span>Listing ID: <strong>{review.listing_id}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAnalyzer = () => {
    return (
      <div className="analyzer-section">
        <div className="analyzer-card">
          <h2>Analyze Custom Text</h2>
          <p className="analyzer-description">
            Enter any text to analyze its sentiment using the same algorithm applied to the reviews.
          </p>

          {/* Limitations Warning */}
          <div className="analyzer-warning">
            <div className="warning-header">
              ⚠️ <strong>Known Limitations</strong>
            </div>
            <p className="warning-text">
              TextBlob may struggle with negations and complex phrases. For example:
            </p>
            <div className="warning-examples">
              <div className="example-item">
                <span className="example-text">"I did not like the space"</span>
                <span className="example-result">→ May classify as Neutral (should be Negative)</span>
              </div>
              <div className="example-item">
                <span className="example-text">"The place was not bad"</span>
                <span className="example-result">→ May classify as Negative (should be Neutral/Positive)</span>
              </div>
            </div>
            <p className="warning-footer">
              See <strong>DOMAIN_SPECIFIC_UPGRADE.md</strong> for models with better accuracy (85-95%).
            </p>
          </div>
          
          <textarea
            className="analyzer-input"
            placeholder="Enter text to analyze..."
            value={analyzeText}
            onChange={(e) => setAnalyzeText(e.target.value)}
            rows={6}
          />
          
          <button onClick={handleAnalyze} className="analyze-btn">
            <BarChart3 size={20} />
            Analyze Sentiment
          </button>

          {analyzeResult && (
            <div className="analyze-result">
              <h3>Analysis Result</h3>
              <div className="result-grid">
                <div className="result-item">
                  <div className="result-label">Sentiment</div>
                  <div className="result-value sentiment-badge" style={{ background: getSentimentColor(analyzeResult.sentiment) }}>
                    {getSentimentIcon(analyzeResult.sentiment)}
                    <span>{analyzeResult.sentiment}</span>
                  </div>
                </div>
                <div className="result-item">
                  <div className="result-label">Polarity</div>
                  <div className="result-value">{analyzeResult.polarity.toFixed(3)}</div>
                  <div className="result-hint">(-1 to 1, negative to positive)</div>
                </div>
                <div className="result-item">
                  <div className="result-label">Subjectivity</div>
                  <div className="result-value">{analyzeResult.subjectivity.toFixed(3)}</div>
                  <div className="result-hint">(0 to 1, objective to subjective)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {/* Loading Modal */}
      {showLoadingModal && loadingProgress && (
        <div className="loading-modal-overlay">
          <div className="loading-modal">
            <div className="loading-modal-header">
              <Home size={40} className="modal-icon" />
              <h2>Loading Additional Reviews</h2>
            </div>
            
            <div className="loading-modal-body">
              <div className="progress-info">
                <div className="progress-text">
                  <strong>{loadingProgress.current.toLocaleString()}</strong> of{' '}
                  <strong>{loadingProgress.target.toLocaleString()}</strong> reviews
                </div>
                <div className="progress-batch">
                  Batch {loadingProgress.currentBatch} of {loadingProgress.totalBatches}
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(loadingProgress.current / loadingProgress.target) * 100}%` }}
                ></div>
              </div>
              
              <div className="progress-percentage">
                {Math.round((loadingProgress.current / loadingProgress.target) * 100)}%
              </div>
              
              {loadingProgress.message && (
                <div className="progress-message">{loadingProgress.message}</div>
              )}
              
              {loadingProgress.estimatedMinutes && loadingProgress.currentBatch === 0 && (
                <div className="estimated-time">
                  ⏱️ Estimated time: ~{loadingProgress.estimatedMinutes} minute{loadingProgress.estimatedMinutes !== 1 ? 's' : ''}
                </div>
              )}
              
              {!cancelLoading && loadingProgress.currentBatch > 0 && (
                <button 
                  className="cancel-loading-btn" 
                  onClick={handleCancelLoading}
                >
                  ⏸️ Stop Loading & Use Current Data
                </button>
              )}
              
              {cancelLoading && (
                <div className="cancel-message">
                  ⏸️ Stopping after current batch...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <header className="app-header">
        <div className="header-content">
          <h1>
            <img src="/images/airbnb-logo.svg" alt="Airbnb" className="header-logo" />
            Airbnb Sentiment Analysis
            <img src="/images/airbnb-logo.svg" alt="Airbnb" className="header-logo" />
          </h1>
          <p>Analyze and visualize sentiment from Airbnb reviews</p>
          <div className="data-source">
            <span className="data-source-label">Data Source:</span>
            <a 
              href="https://www.kaggle.com/datasets/muhammadahmedansari/airbnb-dataset" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-source-link"
            >
              Kaggle - Airbnb Dataset
            </a>
          </div>
        </div>
      </header>

      <div className="app-container">
        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={20} />
            Reviews
          </button>
          <button
            className={`nav-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            <TrendingUp size={20} />
            Analyzer
          </button>
        </nav>

        <main className="app-main">
          {loading && activeTab === 'dashboard' ? (
            <LoadingSpinner message="Loading dashboard..." icon={<Home size={32} />} />
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'reviews' && renderReviews()}
              {activeTab === 'analyzer' && renderAnalyzer()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
