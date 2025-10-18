# Quick Setup Guide

## First Time Setup

### 1. Install Backend Dependencies

Open PowerShell in the project root and run:

```powershell
cd backend
pip install -r requirements.txt
python -m textblob.download_corpora
```

### 2. Install Frontend Dependencies

```powershell
cd frontend
npm install
```

## Running the Application

### Option 1: Use the Start Script (Recommended)

Simply run the PowerShell script from the project root:

```powershell
.\start.ps1
```

This will open two new windows - one for the backend and one for the frontend.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

## Accessing the Application

Once both servers are running:

- **Frontend**: Open your browser to http://localhost:3000
- **Backend API**: http://localhost:5000/api

## Features to Try

1. **Dashboard Tab**
   - View overall sentiment statistics
   - See sentiment distribution pie chart
   - Explore sentiment trends over time
   - Read the most positive and negative reviews

2. **Reviews Tab**
   - Browse all reviews with sentiment analysis
   - Filter by sentiment (Positive, Neutral, Negative)
   - Search for specific keywords
   - Navigate through pages

3. **Analyzer Tab**
   - Enter custom text to analyze
   - Get instant sentiment scores
   - See polarity and subjectivity metrics

## Troubleshooting

### Backend Issues

**Error: Module not found**
- Make sure you installed all requirements: `pip install -r requirements.txt`
- Download TextBlob corpora: `python -m textblob.download_corpora`

**Error: reviews.csv not found**
- Ensure `reviews.csv` is in the root directory (`c:\search-sentiment\`)

### Frontend Issues

**Error: Cannot find module**
- Run `npm install` in the frontend directory

**Port 3000 already in use**
- Close any other React apps running on port 3000
- Or modify the port in `package.json`

**CORS errors**
- Make sure the backend is running on port 5000
- Check that Flask-CORS is installed

## Performance Notes

- The backend loads 10,000 reviews by default for faster processing
- To analyze more reviews, edit `backend/app.py` and change the `sample_size` parameter
- Larger datasets will take longer to load and analyze

## Data Source

The application uses the Airbnb dataset from Kaggle:
https://www.kaggle.com/datasets/muhammadahmedansari/airbnb-dataset

Make sure the `reviews.csv` file is placed in the root directory.
