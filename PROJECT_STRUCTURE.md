# Project Structure

```
search-sentiment/
│
├── backend/                      # Python Flask Backend
│   ├── app.py                   # Main Flask application with API endpoints
│   └── requirements.txt         # Python dependencies
│
├── frontend/                     # React Frontend
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── App.css             # Styling
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles
│   └── package.json            # Node dependencies
│
├── reviews.csv                   # Airbnb reviews dataset (from Kaggle)
├── examine_data.py              # Utility script to examine data
│
├── README.md                     # Main documentation
├── SETUP_GUIDE.md               # Quick setup instructions
├── PROJECT_STRUCTURE.md         # This file
├── start.ps1                    # PowerShell script to start both servers
└── .gitignore                   # Git ignore rules
```

## Key Files Explained

### Backend (`backend/app.py`)

**Main Features:**
- Flask REST API with CORS enabled
- TextBlob sentiment analysis
- Pandas for data processing
- Multiple endpoints for different data views

**API Endpoints:**
- `GET /api/health` - Health check
- `GET /api/statistics` - Overall sentiment statistics
- `GET /api/reviews` - Paginated reviews with filters
- `GET /api/trends` - Sentiment trends over time
- `POST /api/analyze` - Analyze custom text

### Frontend (`frontend/src/App.js`)

**Main Components:**
- Dashboard with statistics and charts
- Reviews browser with search and filters
- Custom text analyzer
- Responsive navigation

**Libraries Used:**
- **React 18** - UI framework
- **Axios** - HTTP requests
- **Recharts** - Data visualization (Pie, Line, Bar charts)
- **Lucide React** - Modern icons

### Styling (`frontend/src/App.css`)

**Design Features:**
- Gradient backgrounds
- Glassmorphism effects
- Smooth animations and transitions
- Responsive grid layouts
- Color-coded sentiment badges

## Data Flow

1. **Backend loads data** → Reads `reviews.csv` (10k rows by default)
2. **Frontend requests data** → Makes API calls to Flask backend
3. **Backend analyzes sentiment** → Uses TextBlob on each review
4. **Frontend displays results** → Renders charts and review cards
5. **User interactions** → Filters, searches, pagination trigger new API calls

## Sentiment Analysis Logic

**TextBlob Sentiment:**
- **Polarity**: -1 (negative) to +1 (positive)
- **Subjectivity**: 0 (objective) to 1 (subjective)

**Classification:**
- **Positive**: polarity > 0.1
- **Neutral**: -0.1 ≤ polarity ≤ 0.1
- **Negative**: polarity < -0.1

## Customization Points

### Change Sample Size
Edit `backend/app.py`, line in `if __name__ == '__main__'`:
```python
load_data(sample_size=10000)  # Change this number
```

### Modify Sentiment Thresholds
Edit `backend/app.py`, in `analyze_sentiment()` function:
```python
if polarity > 0.1:  # Change threshold
    sentiment = 'positive'
```

### Change Color Scheme
Edit `frontend/src/App.css` and `frontend/src/index.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Pagination
Edit `frontend/src/App.js`:
```javascript
per_page: 10,  // Change items per page
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.x | Server runtime |
| Backend | Flask | Web framework |
| Backend | TextBlob | NLP & sentiment analysis |
| Backend | Pandas | Data processing |
| Frontend | React 18 | UI framework |
| Frontend | Recharts | Data visualization |
| Frontend | Axios | HTTP client |
| Styling | CSS3 | Modern styling with gradients |
| Icons | Lucide React | Icon library |

## Development vs Production

**Current Setup (Development):**
- Flask debug mode enabled
- React development server
- CORS enabled for localhost

**For Production:**
- Build React app: `npm run build`
- Use production WSGI server (Gunicorn, uWSGI)
- Configure proper CORS origins
- Use environment variables for configuration
- Add authentication if needed
- Optimize data loading and caching
