# Quick Deployment Guide - Netlify + Render (FREE)

Deploy your Airbnb Sentiment Analysis app for **FREE** in ~20 minutes!

**Frontend:** Netlify (React)  
**Backend:** Render (Flask)

---

## 🎯 What You'll Get

- ✅ Live, working application
- ✅ Custom URL (e.g., `airbnb-sentiment.netlify.app`)
- ✅ Automatic HTTPS
- ✅ Free hosting (both services)
- ✅ Portfolio-ready link

---

## Part 1: Deploy Backend to Render (10 minutes)

### Step 1: Prepare Backend Files

**Create `backend/requirements.txt`** (if not already there):
```txt
Flask==3.0.0
flask-cors==4.0.0
pandas==2.1.3
textblob==0.17.1
gunicorn==21.2.0
```

**Create `backend/render.yaml`**:
```yaml
services:
  - type: web
    name: airbnb-sentiment-api
    env: python
    buildCommand: "pip install -r requirements.txt && python -m textblob.download_corpora"
    startCommand: "gunicorn app:app"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

### Step 2: Update CORS in `backend/app.py`

Find this line:
```python
CORS(app)
```

Replace with:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"]  # We'll restrict this later
    }
})
```

### Step 3: Deploy to Render

1. **Go to:** https://render.com/
2. **Sign up** with GitHub
3. **Click:** "New +" → "Web Service"
4. **Connect** your GitHub repo: `jesslearns017/airbnb_reviews`
5. **Configure:**
   - **Name:** `airbnb-sentiment-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python -m textblob.download_corpora`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** `Free`

6. **Click:** "Create Web Service"
7. **Wait** ~5 minutes for deployment
8. **Copy your API URL:** `https://airbnb-sentiment-api.onrender.com`

### Step 4: Test Backend

Visit: `https://airbnb-sentiment-api.onrender.com/api/health`

You should see:
```json
{
  "status": "healthy",
  "reviews_loaded": 4991
}
```

✅ **Backend deployed!**

---

## Part 2: Deploy Frontend to Netlify (10 minutes)

### Step 1: Update API URL

**Edit `frontend/src/App.js`:**

Find:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Replace with:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Step 2: Create Netlify Configuration

**Create `frontend/netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 3: Create Environment File

**Create `frontend/.env.production`:**
```
REACT_APP_API_URL=https://airbnb-sentiment-api.onrender.com/api
```

Replace with YOUR actual Render URL from Part 1!

### Step 4: Commit Changes

```bash
cd c:\search-sentiment
git add .
git commit -m "Configure for Netlify deployment"
git push origin main
```

### Step 5: Deploy to Netlify

1. **Go to:** https://www.netlify.com/
2. **Sign up** with GitHub
3. **Click:** "Add new site" → "Import an existing project"
4. **Choose:** GitHub
5. **Select:** `jesslearns017/airbnb_reviews`
6. **Configure:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
   
7. **Add Environment Variable:**
   - Click "Show advanced"
   - Click "New variable"
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://airbnb-sentiment-api.onrender.com/api` (your Render URL)

8. **Click:** "Deploy site"
9. **Wait** ~3 minutes for build
10. **Get your URL:** `https://random-name-123.netlify.app`

### Step 6: Customize Domain (Optional)

1. **Go to:** Site settings → Domain management
2. **Click:** "Options" → "Edit site name"
3. **Change to:** `airbnb-sentiment-analysis`
4. **New URL:** `https://airbnb-sentiment-analysis.netlify.app`

✅ **Frontend deployed!**

---

## Part 3: Update Backend CORS (Security)

Now that you have your Netlify URL, secure your backend:

**Edit `backend/app.py`:**

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://airbnb-sentiment-analysis.netlify.app"]
    }
})
```

**Commit and push:**
```bash
git add backend/app.py
git commit -m "Update CORS for production"
git push origin main
```

Render will auto-deploy the update!

---

## 🎉 You're Live!

**Your URLs:**
- **Frontend:** https://airbnb-sentiment-analysis.netlify.app
- **Backend:** https://airbnb-sentiment-api.onrender.com
- **GitHub:** https://github.com/jesslearns017/airbnb_reviews

---

## ⚠️ Important Notes

### Free Tier Limitations:

**Render (Backend):**
- ✅ Free forever
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ First request after sleep takes ~30 seconds
- ✅ 750 hours/month free

**Netlify (Frontend):**
- ✅ Free forever
- ✅ 100 GB bandwidth/month
- ✅ Instant loading
- ✅ Automatic HTTPS

### Keep Backend Awake (Optional):

Use a free service like **UptimeRobot** to ping your backend every 5 minutes:
1. Go to: https://uptimerobot.com/
2. Add monitor: `https://airbnb-sentiment-api.onrender.com/api/health`
3. Interval: 5 minutes

This keeps your backend from sleeping!

---

## 🐛 Troubleshooting

### Frontend shows "Backend not found"
- Check that `REACT_APP_API_URL` is set correctly in Netlify
- Verify backend is running on Render
- Check browser console for CORS errors

### Backend won't start
- Check Render logs: Dashboard → Logs
- Verify `requirements.txt` has all dependencies
- Make sure `gunicorn` is in requirements.txt

### CORS errors
- Make sure backend CORS includes your Netlify URL
- Check that URLs don't have trailing slashes

### Slow first load
- This is normal for Render free tier
- Backend spins down after 15 min
- Use UptimeRobot to keep it awake

---

## 📊 Monitoring Your Deployment

### Netlify Dashboard:
- View deploy logs
- See bandwidth usage
- Monitor build times

### Render Dashboard:
- View application logs
- Monitor resource usage
- Check deploy status

---

## 🔄 Updating Your Deployment

Whenever you push to GitHub:

**Netlify:** Auto-deploys (2-3 minutes)  
**Render:** Auto-deploys (3-5 minutes)

Just push your changes:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Both services will automatically rebuild and deploy!

---

## 💰 Cost Breakdown

**Total Cost:** $0/month

Both services are completely free for personal projects!

**If you need more:**
- Render Pro: $7/month (no sleep, better performance)
- Netlify Pro: $19/month (more bandwidth, analytics)

---

## 🎯 Next Steps

1. ✅ Test your live app
2. ✅ Add the URL to your resume
3. ✅ Share on LinkedIn
4. ✅ Add to your portfolio website
5. ✅ Show to potential employers!

---

## 📝 Checklist

Before deploying:
- [ ] Backend has `requirements.txt` with gunicorn
- [ ] Frontend has `.env.production` with API URL
- [ ] CORS is configured in backend
- [ ] All changes committed to GitHub
- [ ] Tested locally one more time

After deploying:
- [ ] Test all features on live site
- [ ] Check that charts load
- [ ] Try the custom text analyzer
- [ ] Browse reviews
- [ ] Load more reviews button works
- [ ] Share your live URL!

---

## 🆘 Need Help?

**Render Issues:**
- Docs: https://render.com/docs
- Community: https://community.render.com/

**Netlify Issues:**
- Docs: https://docs.netlify.com/
- Community: https://answers.netlify.com/

**Your GitHub:**
- https://github.com/jesslearns017/airbnb_reviews/issues

---

## 🌟 Congratulations!

You've deployed a full-stack application to production!

This is a real accomplishment - you now have:
- ✅ A live web application
- ✅ Portfolio-ready project
- ✅ Deployment experience
- ✅ DevOps skills

**Add this to your resume:**
- Deployed full-stack sentiment analysis application
- Configured CI/CD pipeline with GitHub
- Implemented production deployment on Netlify and Render
- Managed CORS, environment variables, and security

**You're a full-stack developer now!** 🚀

---

## 📸 Screenshots for Portfolio

Take screenshots of:
1. Live dashboard with charts
2. Reviews browser in action
3. Custom text analyzer
4. Netlify deployment dashboard
5. GitHub repository

Use these in your portfolio and resume!

---

**Good luck with deployment tomorrow! You've got this!** 💪✨
