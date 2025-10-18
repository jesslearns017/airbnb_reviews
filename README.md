# Airbnb Reviews Sentiment Analysis 🏠📊

A full-stack web application for analyzing sentiment in Airbnb reviews using Natural Language Processing (NLP).

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📸 Screenshots

### Dashboard
View comprehensive sentiment statistics, distribution charts, and trends over time.

### Reviews Browser
Browse, search, and filter reviews with real-time sentiment analysis.

### Custom Analyzer
Test sentiment analysis on any custom text instantly.

## Features

- **Dashboard**: Visual overview with statistics, charts, and sentiment distribution
- **Reviews Browser**: Browse, search, and filter reviews by sentiment
- **Custom Analyzer**: Analyze sentiment of any custom text
- **Real-time Analysis**: Uses TextBlob for sentiment analysis
- **Beautiful UI**: Modern, responsive design with smooth animations

## Tech Stack

### Backend
- **Python 3.x**
- **Flask**: Web framework
- **Pandas**: Data processing
- **TextBlob**: Sentiment analysis
- **Flask-CORS**: Cross-origin resource sharing

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

5. Download TextBlob corpora:
```bash
python -m textblob.download_corpora
```

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

## Sentiment Analysis

The application uses TextBlob's sentiment analysis which provides:
- **Polarity**: Range from -1 (negative) to 1 (positive)
- **Subjectivity**: Range from 0 (objective) to 1 (subjective)

Reviews are classified as:
- **Positive**: Polarity > 0.1
- **Negative**: Polarity < -0.1
- **Neutral**: Polarity between -0.1 and 0.1

## ⚡ Performance

### Optimized for Speed

The application uses **pre-calculated sentiment analysis** for instant responses:

- **Startup**: Sentiment is analyzed once when the server starts (~30-40 seconds for 10k reviews)
- **Runtime**: API responses are nearly instant (<100ms)
- **Improvement**: 200x faster than real-time analysis

### Configuration

By default, the backend loads 10,000 reviews. You can adjust this in `backend/app.py`:

```python
load_data(sample_size=10000)  # Change this number
```

**Recommendations:**
- **Development**: 1,000-5,000 reviews (faster startup)
- **Production**: 10,000-50,000 reviews (more data)

See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for detailed performance metrics and optimization strategies.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Dataset from [Kaggle - Airbnb Dataset](https://www.kaggle.com/datasets/muhammadahmedansari/airbnb-dataset)
- Sentiment analysis powered by [TextBlob](https://textblob.readthedocs.io/)
- Charts created with [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

## ⭐ Star This Repository

If you find this project useful, please consider giving it a star on GitHub!
