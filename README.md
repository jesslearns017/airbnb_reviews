# Airbnb Reviews Sentiment Analysis 🏠📊

A full-stack web application for analyzing sentiment in Airbnb reviews using Natural Language Processing (NLP) with VADER sentiment analysis.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌐 Live Demo

**Frontend:** [https://vader-sentiment-airnbn-analysis.netlify.app/](https://vader-sentiment-airnbn-analysis.netlify.app/)  
**Backend API:** [https://airbnb-sentiment-api.onrender.com](https://airbnb-sentiment-api.onrender.com)

> ⏱️ **Note:** First load may take 50-60 seconds as the free-tier server wakes up. Subsequent loads are fast!

## 📸 Screenshots

### Dashboard
View comprehensive sentiment statistics, distribution charts, and trends over time.

### Reviews Browser
Browse, search, and filter reviews with real-time sentiment analysis.

### Custom Analyzer
Test sentiment analysis on any custom text instantly.

## ✨ Features

- **Dashboard**: Visual overview with statistics, charts, and sentiment distribution
- **Reviews Browser**: Browse, search, and filter reviews by sentiment
- **Custom Analyzer**: Analyze sentiment of any custom text instantly
- **VADER Sentiment Analysis**: Advanced NLP with better negation handling and emoji support
- **Beautiful UI**: Modern, responsive design with Airbnb coral branding
- **Fully Deployed**: Live on Netlify (frontend) and Render (backend)

## Tech Stack

### Backend
- **Python 3.x**
- **Flask**: Web framework
- **Pandas**: Data processing
- **VADER Sentiment**: Advanced sentiment analysis with negation handling
- **Flask-CORS**: Cross-origin resource sharing
- **Gunicorn**: Production WSGI server

### Frontend
- **React 18**: UI framework
- **Recharts**: Data visualization
- **Axios**: HTTP client
- **Lucide React**: Icons
- **CSS3**: Styling with gradients and animations

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Download VADER lexicon (automatically installed with vaderSentiment package)

6. Start the backend server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Explore the three main sections:
   - **Dashboard**: View overall statistics and trends
   - **Reviews**: Browse and filter individual reviews
   - **Analyzer**: Test sentiment analysis on custom text

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/statistics` - Overall sentiment statistics
- `GET /api/reviews` - Get paginated reviews with filters
- `GET /api/trends` - Get sentiment trends over time
- `POST /api/analyze` - Analyze custom text

## 📊 Data

The application uses the Airbnb dataset from Kaggle:
https://www.kaggle.com/datasets/muhammadahmedansari/airbnb-dataset

**Important**: Due to file size, the `reviews.csv` file is not included in this repository. Please download it from Kaggle and place it in the root directory.

### Dataset Structure
- **listing_id**: Airbnb listing identifier
- **id**: Review identifier
- **date**: Review date
- **reviewer_id**: Reviewer identifier
- **reviewer_name**: Name of the reviewer
- **comments**: Review text content

## 🎯 Sentiment Analysis

The application uses **VADER (Valence Aware Dictionary and sEntiment Reasoner)** for sentiment analysis, which provides:

### VADER Advantages
- ✅ **Better negation handling**: Correctly interprets "not good" as negative
- ✅ **Intensifier recognition**: Understands "very good" vs "good"
- ✅ **Emoji support**: Recognizes sentiment in emojis 😊 😢
- ✅ **Punctuation awareness**: "Great!!!" vs "Great"
- ✅ **Social media optimized**: Designed for reviews and informal text

### Sentiment Scores
- **Compound**: Overall sentiment score from -1 (most negative) to +1 (most positive)
- **Positive/Negative/Neutral**: Individual component scores

### Classification Thresholds
- **Positive**: Compound score ≥ 0.05
- **Negative**: Compound score ≤ -0.05
- **Neutral**: Compound score between -0.05 and 0.05

### Alternative Implementation
The repository also includes a TextBlob implementation (`app_textblob.py`) for comparison purposes.

## ⚡ Performance

### Optimized for Speed

The application uses **pre-calculated sentiment analysis** for instant responses:

- **Startup**: Sentiment is analyzed once when the server starts (~10-15 seconds for 3k reviews with VADER)
- **Runtime**: API responses are nearly instant (<100ms)
- **Improvement**: 200x faster than real-time analysis

### Configuration

By default, the backend loads 3,000 reviews (optimized for free-tier deployment). You can adjust this in `backend/app.py`:

```python
load_data(sample_size=3000)  # Change this number
```

**Recommendations:**
- **Development**: 1,000-3,000 reviews (faster startup)
- **Production (Free Tier)**: 3,000-5,000 reviews (memory constraints)
- **Production (Paid Tier)**: 10,000-50,000 reviews (more data)

See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for detailed performance metrics and optimization strategies.

## 🎓 Upgrading to Domain-Specific Models

Want even higher accuracy? The current implementation uses VADER (~80-85% accuracy), which is excellent for social media and reviews. For production applications requiring maximum accuracy, consider upgrading to domain-specific sentiment models trained on Airbnb/hotel reviews.

**Why upgrade?**
- 📈 **85-95% accuracy** (vs 80-85% with VADER)
- 🎯 **Understands Airbnb context** (e.g., "responsive host", "accurate listing")
- 💡 **Better handles domain-specific phrases**
- 🔍 **Fine-tuned for hospitality language**

### Quick Start: Upgrade to BERT (15 minutes, FREE)

See [BERT_UPGRADE_GUIDE.md](BERT_UPGRADE_GUIDE.md) for:
- ✅ **Step-by-step instructions** (copy-paste ready)
- ✅ **No API key required** (completely free)
- ✅ **Immediate accuracy boost** (72% → 88%)
- ✅ **Troubleshooting guide** included

### Advanced Options

See [DOMAIN_SPECIFIC_UPGRADE.md](DOMAIN_SPECIFIC_UPGRADE.md) for:
- Detailed comparison of models
- Fine-tuning on your own data (90-95% accuracy)
- GPT-4 integration
- Cost analysis and migration strategy

## 🚀 Deployment

This application is deployed using:
- **Frontend**: Netlify (https://vader-sentiment-airnbn-analysis.netlify.app/)
- **Backend**: Render (https://airbnb-sentiment-api.onrender.com)

### Deploy Your Own

See [QUICK_DEPLOY_GUIDE.md](QUICK_DEPLOY_GUIDE.md) for step-by-step deployment instructions.

**Quick Summary:**
1. **Backend (Render)**:
   - Connect GitHub repo
   - Set root directory to `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`

2. **Frontend (Netlify)**:
   - Connect GitHub repo
   - Set base directory to `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Dataset from [Kaggle - Airbnb Dataset](https://www.kaggle.com/datasets/muhammadahmedansari/airbnb-dataset)
- Sentiment analysis powered by [VADER Sentiment](https://github.com/cjhutto/vaderSentiment)
- Charts created with [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Netlify](https://www.netlify.com/) and [Render](https://render.com/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

## ⭐ Star This Repository

If you find this project useful, please consider giving it a star on GitHub!
