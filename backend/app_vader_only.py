from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Initialize VADER sentiment analyzer
vader_analyzer = SentimentIntensityAnalyzer()

# Load data
# Use sample file for deployment, full file for local development
if os.path.exists(os.path.join(os.path.dirname(__file__), 'reviews_sample.csv')):
    DATA_PATH = os.path.join(os.path.dirname(__file__), 'reviews_sample.csv')
else:
    DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'reviews.csv')
df = None
df_with_sentiment = None

def load_data(sample_size=3000):
    """Load a sample of the reviews data and pre-calculate sentiment with VADER"""
    global df, df_with_sentiment
    print("Loading data...")
    df = pd.read_csv(DATA_PATH, nrows=sample_size)
    df['date'] = pd.to_datetime(df['date'])
    
    # Remove duplicate reviews
    initial_count = len(df)
    df = df.drop_duplicates(subset=['comments'], keep='first')
    duplicates_removed = initial_count - len(df)
    
    if duplicates_removed > 0:
        print(f"Removed {duplicates_removed} duplicate reviews")
    
    print(f"Loaded {len(df)} unique reviews")
    
    # Pre-calculate sentiment for all reviews using VADER
    print("Pre-calculating sentiment analysis with VADER...")
    sentiments = []
    for idx, row in df.iterrows():
        sentiment_data = analyze_sentiment_vader(row['comments'])
        sentiments.append(sentiment_data)
        if (idx + 1) % 1000 == 0:
            print(f"Processed {idx + 1}/{len(df)} reviews...")
    
    df_with_sentiment = df.copy()
    df_with_sentiment['polarity'] = [s['polarity'] for s in sentiments]
    df_with_sentiment['subjectivity'] = [s['subjectivity'] for s in sentiments]
    df_with_sentiment['sentiment'] = [s['sentiment'] for s in sentiments]
    df_with_sentiment['compound'] = [s['compound'] for s in sentiments]
    df_with_sentiment['positive'] = [s['positive'] for s in sentiments]
    df_with_sentiment['negative'] = [s['negative'] for s in sentiments]
    df_with_sentiment['neutral_score'] = [s['neutral_score'] for s in sentiments]
    
    print("VADER sentiment analysis complete!")
    return df

def analyze_sentiment_vader(text):
    """Analyze sentiment of text using VADER"""
    if pd.isna(text) or text == '':
        return {
            'polarity': 0, 
            'subjectivity': 0.5, 
            'sentiment': 'neutral',
            'compound': 0,
            'positive': 0,
            'negative': 0,
            'neutral_score': 1.0
        }
    
    try:
        # Get VADER scores
        scores = vader_analyzer.polarity_scores(str(text))
        
        # VADER returns: neg, neu, pos, compound
        # compound: normalized, weighted composite score (-1 to 1)
        compound = scores['compound']
        
        # Classify sentiment based on compound score
        # VADER recommended thresholds
        if compound >= 0.05:
            sentiment = 'positive'
        elif compound <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # Map compound to polarity for compatibility with frontend
        polarity = compound  # Already in -1 to 1 range
        
        # Estimate subjectivity (VADER doesn't provide this directly)
        # Higher pos/neg scores relative to neutral suggest more subjectivity
        subjectivity = 1.0 - scores['neu']
        
        return {
            'polarity': round(polarity, 3),
            'subjectivity': round(subjectivity, 3),
            'sentiment': sentiment,
            'compound': round(compound, 3),
            'positive': round(scores['pos'], 3),
            'negative': round(scores['neg'], 3),
            'neutral_score': round(scores['neu'], 3)
        }
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return {
            'polarity': 0, 
            'subjectivity': 0.5, 
            'sentiment': 'neutral',
            'compound': 0,
            'positive': 0,
            'negative': 0,
            'neutral_score': 1.0
        }

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'reviews_loaded': len(df) if df is not None else 0,
        'sentiment_engine': 'VADER'
    })

@app.route('/api/dataset-info', methods=['GET'])
def dataset_info():
    """Get information about the loaded dataset"""
    if df_with_sentiment is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    # Count total reviews in CSV
    import csv
    total_in_file = 0
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            total_in_file = sum(1 for line in f) - 1  # Subtract header
    except:
        total_in_file = 0
    
    return jsonify({
        'loaded': len(df_with_sentiment),
        'total_available': total_in_file,
        'can_load_more': len(df_with_sentiment) < total_in_file,
        'sentiment_engine': 'VADER'
    })

@app.route('/api/reload-data', methods=['POST'])
def reload_data():
    """Reload data with a different sample size"""
    data = request.json
    sample_size = data.get('sample_size', 3000)
    batch_size = data.get('batch_size', None)
    
    try:
        if batch_size:
            # Incremental loading
            current_size = len(df_with_sentiment) if df_with_sentiment is not None else 0
            new_size = min(current_size + batch_size, sample_size)
            load_data(sample_size=new_size)
        else:
            # Full loading
            load_data(sample_size=sample_size)
            
        return jsonify({
            'success': True,
            'loaded': len(df_with_sentiment),
            'message': f'Successfully loaded {len(df_with_sentiment)} reviews with VADER'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/estimate-load-time', methods=['POST'])
def estimate_load_time():
    """Estimate loading time for a given number of reviews"""
    data = request.json
    sample_size = data.get('sample_size', 3000)
    
    # VADER is slightly faster than TextBlob: ~0.003 seconds per review
    estimated_seconds = sample_size * 0.003
    
    return jsonify({
        'sample_size': sample_size,
        'estimated_seconds': int(estimated_seconds),
        'estimated_minutes': round(estimated_seconds / 60, 1)
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze sentiment of a single text"""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    result = analyze_sentiment_vader(text)
    return jsonify(result)

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """Get reviews with sentiment analysis"""
    if df_with_sentiment is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    # Get pagination parameters
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    sentiment_filter = request.args.get('sentiment', None)
    search_query = request.args.get('search', None)
    
    # Use pre-calculated sentiment data
    filtered_df = df_with_sentiment.copy()
    
    if search_query:
        filtered_df = filtered_df[filtered_df['comments'].str.contains(search_query, case=False, na=False)]
    
    # Apply sentiment filter
    if sentiment_filter and sentiment_filter in ['positive', 'negative', 'neutral']:
        filtered_df = filtered_df[filtered_df['sentiment'] == sentiment_filter]
    
    # Pagination
    total = len(filtered_df)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    paginated_df = filtered_df.iloc[start_idx:end_idx]
    
    # Convert to JSON
    reviews = []
    for idx, row in paginated_df.iterrows():
        reviews.append({
            'id': int(row['id']),
            'listing_id': int(row['listing_id']),
            'date': row['date'].strftime('%Y-%m-%d'),
            'reviewer_name': row['reviewer_name'],
            'comments': row['comments'],
            'polarity': float(row['polarity']),
            'subjectivity': float(row['subjectivity']),
            'sentiment': row['sentiment'],
            'compound': float(row['compound']),
            'positive': float(row['positive']),
            'negative': float(row['negative']),
            'neutral_score': float(row['neutral_score'])
        })
    
    return jsonify({
        'reviews': reviews,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get overall sentiment statistics"""
    if df_with_sentiment is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    # Use pre-calculated sentiment data
    stats = {
        'total_reviews': len(df_with_sentiment),
        'sentiment_distribution': {
            'positive': int(sum(df_with_sentiment['sentiment'] == 'positive')),
            'negative': int(sum(df_with_sentiment['sentiment'] == 'negative')),
            'neutral': int(sum(df_with_sentiment['sentiment'] == 'neutral'))
        },
        'average_polarity': float(df_with_sentiment['polarity'].mean()),
        'average_subjectivity': float(df_with_sentiment['subjectivity'].mean()),
        'polarity_std': float(df_with_sentiment['polarity'].std()),
        'average_compound': float(df_with_sentiment['compound'].mean()),
        'average_positive': float(df_with_sentiment['positive'].mean()),
        'average_negative': float(df_with_sentiment['negative'].mean()),
        'average_neutral': float(df_with_sentiment['neutral_score'].mean()),
        'most_positive_review': None,
        'most_negative_review': None,
        'sentiment_engine': 'VADER'
    }
    
    # Find most positive and negative reviews
    max_polarity_idx = df_with_sentiment['polarity'].idxmax()
    min_polarity_idx = df_with_sentiment['polarity'].idxmin()
    
    if not pd.isna(max_polarity_idx):
        stats['most_positive_review'] = {
            'comments': df_with_sentiment.iloc[max_polarity_idx]['comments'][:200] + '...',
            'polarity': float(df_with_sentiment.iloc[max_polarity_idx]['polarity']),
            'compound': float(df_with_sentiment.iloc[max_polarity_idx]['compound']),
            'reviewer_name': df_with_sentiment.iloc[max_polarity_idx]['reviewer_name']
        }
    
    if not pd.isna(min_polarity_idx):
        stats['most_negative_review'] = {
            'comments': df_with_sentiment.iloc[min_polarity_idx]['comments'][:200] + '...',
            'polarity': float(df_with_sentiment.iloc[min_polarity_idx]['polarity']),
            'compound': float(df_with_sentiment.iloc[min_polarity_idx]['compound']),
            'reviewer_name': df_with_sentiment.iloc[min_polarity_idx]['reviewer_name']
        }
    
    return jsonify(stats)

@app.route('/api/trends', methods=['GET'])
def get_trends():
    """Get sentiment trends over time"""
    if df_with_sentiment is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    # Use pre-calculated sentiment data
    trends_df = df_with_sentiment.copy()
    
    # Group by month
    trends_df['month'] = trends_df['date'].dt.to_period('M')
    monthly_stats = trends_df.groupby('month').agg({
        'polarity': 'mean',
        'compound': 'mean',
        'id': 'count'
    }).reset_index()
    
    monthly_stats['month'] = monthly_stats['month'].astype(str)
    
    # Sentiment distribution by month
    sentiment_by_month = trends_df.groupby(['month', 'sentiment']).size().unstack(fill_value=0)
    sentiment_by_month.index = sentiment_by_month.index.astype(str)
    
    trends = {
        'monthly_polarity': monthly_stats[['month', 'polarity']].to_dict('records'),
        'monthly_compound': monthly_stats[['month', 'compound']].to_dict('records'),
        'monthly_count': monthly_stats[['month', 'id']].rename(columns={'id': 'count'}).to_dict('records'),
        'sentiment_by_month': sentiment_by_month.reset_index().to_dict('records')
    }
    
    return jsonify(trends)

@app.route('/api/vader-details', methods=['GET'])
def get_vader_details():
    """Get detailed VADER sentiment breakdown"""
    if df_with_sentiment is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    details = {
        'average_scores': {
            'compound': float(df_with_sentiment['compound'].mean()),
            'positive': float(df_with_sentiment['positive'].mean()),
            'negative': float(df_with_sentiment['negative'].mean()),
            'neutral': float(df_with_sentiment['neutral_score'].mean())
        },
        'score_distributions': {
            'compound_std': float(df_with_sentiment['compound'].std()),
            'positive_std': float(df_with_sentiment['positive'].std()),
            'negative_std': float(df_with_sentiment['negative'].std()),
            'neutral_std': float(df_with_sentiment['neutral_score'].std())
        },
        'sentiment_engine': 'VADER',
        'vader_info': {
            'description': 'VADER (Valence Aware Dictionary and sEntiment Reasoner)',
            'strengths': [
                'Handles negations well (e.g., "not good")',
                'Understands intensifiers (e.g., "very good")',
                'Recognizes emojis and punctuation',
                'Optimized for social media and reviews'
            ],
            'compound_range': '[-1, 1] where -1 is most negative and 1 is most positive',
            'thresholds': {
                'positive': '>= 0.05',
                'neutral': '> -0.05 and < 0.05',
                'negative': '<= -0.05'
            }
        }
    }
    
    return jsonify(details)

# Load data on startup (works with both Flask dev server and Gunicorn)
load_data(sample_size=3000)  # Reduced for free tier memory limits

if __name__ == '__main__':
    app.run(debug=True, port=5000)
