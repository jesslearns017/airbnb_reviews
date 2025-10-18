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

// Loading Spinner Component with Countdown
const LoadingSpinner = ({ message = 'Loading data...', icon = null, showCountdown = false }) => {
  const [countdown, setCountdown] = React.useState(5);
  
  React.useEffect(() => {
    if (!showCountdown) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showCountdown]);
  
  return (
    <div className="loading">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        {icon && <div className="loading-icon">{icon}</div>}
      </div>
      <div className="loading-text">{message}</div>
      {showCountdown && countdown > 0 && (
        <div className="loading-countdown">
          <div className="countdown-number">{countdown}</div>
          <div className="countdown-label">seconds remaining...</div>
        </div>
      )}
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

  useEffect(() => {
    fetchStatistics();
    fetchTrends();
    fetchReviews();
  }, []);

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
                <XAxis dataKey="month" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="polarity" stroke="#8b5cf6" strokeWidth={2} />
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
      <header className="app-header">
        <div className="header-content">
          <h1>
            <MessageSquare size={32} />
            Airbnb Sentiment Analysis
          </h1>
          <p>Analyze and visualize sentiment from Airbnb reviews</p>
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
            <LoadingSpinner message="Loading dashboard..." icon={<Home size={32} />} showCountdown={true} />
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
