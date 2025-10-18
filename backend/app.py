from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from textblob import TextBlob
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Load data
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'reviews.csv')
df = None
df_with_sentiment = None

def load_data(sample_size=10000):
    """Load a sample of the reviews data and pre-calculate sentiment"""
    global df, df_with_sentiment
    print("Loading data...")
    df = pd.read_csv(DATA_PATH, nrows=sample_size)
    df['date'] = pd.to_datetime(df['date'])
    print(f"Loaded {len(df)} reviews")
    
    # Pre-calculate sentiment for all reviews
    print("Pre-calculating sentiment analysis...")
    sentiments = []
    for idx, row in df.iterrows():
        sentiment_data = analyze_sentiment(row['comments'])
        sentiments.append(sentiment_data)
        if (idx + 1) % 1000 == 0:
            print(f"Processed {idx + 1}/{len(df)} reviews...")
    
    df_with_sentiment = df.copy()
    df_with_sentiment['polarity'] = [s['polarity'] for s in sentiments]
    df_with_sentiment['subjectivity'] = [s['subjectivity'] for s in sentiments]
    df_with_sentiment['sentiment'] = [s['sentiment'] for s in sentiments]
    
    print("Sentiment analysis complete!")
    return df

def analyze_sentiment(text):
    """Analyze sentiment of text using TextBlob"""
    if pd.isna(text) or text == '':
        return {'polarity': 0, 'subjectivity': 0, 'sentiment': 'neutral'}
    
    try:
        blob = TextBlob(str(text))
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Classify sentiment
        if polarity > 0.1:
            sentiment = 'positive'
        elif polarity < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            'polarity': round(polarity, 3),
            'subjectivity': round(subjectivity, 3),
            'sentiment': sentiment
        }
    except:
        return {'polarity': 0, 'subjectivity': 0, 'sentiment': 'neutral'}

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'reviews_loaded': len(df) if df is not None else 0})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze sentiment of a single text"""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    result = analyze_sentiment(text)
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
            'sentiment': row['sentiment']
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
        'most_positive_review': None,
        'most_negative_review': None
    }
    
    # Find most positive and negative reviews
    max_polarity_idx = df_with_sentiment['polarity'].idxmax()
    min_polarity_idx = df_with_sentiment['polarity'].idxmin()
    
    if not pd.isna(max_polarity_idx):
        stats['most_positive_review'] = {
            'comments': df_with_sentiment.iloc[max_polarity_idx]['comments'][:200] + '...',
            'polarity': float(df_with_sentiment.iloc[max_polarity_idx]['polarity']),
            'reviewer_name': df_with_sentiment.iloc[max_polarity_idx]['reviewer_name']
        }
    
    if not pd.isna(min_polarity_idx):
        stats['most_negative_review'] = {
            'comments': df_with_sentiment.iloc[min_polarity_idx]['comments'][:200] + '...',
            'polarity': float(df_with_sentiment.iloc[min_polarity_idx]['polarity']),
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
        'id': 'count'
    }).reset_index()
    
    monthly_stats['month'] = monthly_stats['month'].astype(str)
    
    # Sentiment distribution by month
    sentiment_by_month = trends_df.groupby(['month', 'sentiment']).size().unstack(fill_value=0)
    sentiment_by_month.index = sentiment_by_month.index.astype(str)
    
    trends = {
        'monthly_polarity': monthly_stats[['month', 'polarity']].to_dict('records'),
        'monthly_count': monthly_stats[['month', 'id']].rename(columns={'id': 'count'}).to_dict('records'),
        'sentiment_by_month': sentiment_by_month.reset_index().to_dict('records')
    }
    
    return jsonify(trends)

if __name__ == '__main__':
    load_data(sample_size=10000)  # Load 10k reviews for faster processing
    app.run(debug=True, port=5000)
