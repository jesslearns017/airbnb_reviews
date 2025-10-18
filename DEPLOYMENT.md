# Deployment Guide

This guide covers deploying the Airbnb Sentiment Analysis application to production.

## Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### Backend Deployment

1. **Create a Procfile** in the backend directory:
```
web: gunicorn app:app
```

2. **Update requirements.txt** to include gunicorn:
```bash
cd backend
echo "gunicorn==21.2.0" >> requirements.txt
```

3. **Deploy to Heroku**:
```bash
heroku create your-app-name-backend
git subtree push --prefix backend heroku main
```

#### Frontend Deployment

1. **Build the React app**:
```bash
cd frontend
npm run build
```

2. **Deploy to Netlify, Vercel, or GitHub Pages**

### Option 2: AWS (EC2 + S3)

#### Backend (EC2)

1. Launch an EC2 instance (Ubuntu recommended)
2. SSH into the instance
3. Install dependencies:
```bash
sudo apt update
sudo apt install python3-pip nginx
```

4. Clone repository and install:
```bash
git clone https://github.com/jesslearns017/airbnb_reviews.git
cd airbnb_reviews/backend
pip3 install -r requirements.txt
python3 -m textblob.download_corpora
```

5. Set up Gunicorn and Nginx
6. Configure SSL with Let's Encrypt

#### Frontend (S3 + CloudFront)

1. Build the React app
2. Upload build folder to S3 bucket
3. Configure S3 for static website hosting
4. Set up CloudFront distribution
5. Configure custom domain

### Option 3: Docker

#### Create Dockerfile for Backend

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m textblob.download_corpora

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

#### Create Dockerfile for Frontend

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./reviews.csv:/app/reviews.csv

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Option 4: DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - Backend: Python app
   - Frontend: Static site
3. Set environment variables
4. Deploy with one click

## Production Considerations

### Backend

1. **Environment Variables**
```python
# Use environment variables for configuration
import os

DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'
DATA_PATH = os.getenv('DATA_PATH', 'reviews.csv')
SAMPLE_SIZE = int(os.getenv('SAMPLE_SIZE', '10000'))
```

2. **CORS Configuration**
```python
# Update CORS for production domain
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-frontend-domain.com"]
    }
})
```

3. **Error Handling**
```python
# Add proper error handling
@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500
```

4. **Logging**
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

5. **Use Production WSGI Server**
- Gunicorn (recommended)
- uWSGI
- Waitress

### Frontend

1. **Update API URL**
```javascript
// Use environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

2. **Create .env file**
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

3. **Optimize Build**
```bash
npm run build
```

4. **Enable Compression**
Configure your web server to enable gzip compression

### Security

1. **HTTPS Only**
   - Use SSL certificates (Let's Encrypt)
   - Redirect HTTP to HTTPS

2. **Rate Limiting**
```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["200 per day", "50 per hour"]
)
```

3. **Input Validation**
```python
from flask import request
import bleach

@app.route('/api/analyze', methods=['POST'])
def analyze():
    text = bleach.clean(request.json.get('text', ''))
    # ... rest of code
```

4. **Environment Variables**
   - Never commit sensitive data
   - Use .env files (not tracked in git)
   - Use secrets management services

### Performance

1. **Caching**
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/statistics')
@cache.cached(timeout=300)
def get_statistics():
    # ... code
```

2. **Database**
   - Consider using PostgreSQL or MongoDB for large datasets
   - Implement database indexing
   - Use connection pooling

3. **CDN**
   - Use CloudFront, Cloudflare, or similar
   - Cache static assets
   - Optimize images

4. **Load Balancing**
   - Use multiple backend instances
   - Implement load balancer (AWS ELB, Nginx)

### Monitoring

1. **Application Monitoring**
   - Sentry for error tracking
   - New Relic or Datadog for performance
   - Google Analytics for frontend

2. **Logging**
   - Centralized logging (CloudWatch, Loggly)
   - Log rotation
   - Monitor error rates

3. **Health Checks**
```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })
```

## Deployment Checklist

Before deploying to production:

- [ ] Remove all debug statements
- [ ] Set `DEBUG = False` in Flask
- [ ] Update CORS origins
- [ ] Configure environment variables
- [ ] Set up SSL/HTTPS
- [ ] Implement rate limiting
- [ ] Add error tracking
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test on production-like environment
- [ ] Prepare rollback plan
- [ ] Document deployment process

## Cost Estimates

### Free Tier Options
- **Heroku**: Free tier available (limited hours)
- **Netlify**: Free for static sites
- **Vercel**: Free for personal projects
- **Railway**: Free tier with limitations

### Paid Options
- **AWS**: ~$10-50/month (depending on usage)
- **DigitalOcean**: $5-20/month
- **Heroku**: $7-25/month per dyno

## Maintenance

1. **Regular Updates**
   - Update dependencies monthly
   - Monitor security advisories
   - Test updates in staging first

2. **Backups**
   - Automated daily backups
   - Test restore procedures
   - Store backups off-site

3. **Scaling**
   - Monitor resource usage
   - Scale horizontally when needed
   - Optimize database queries

## Support

For deployment issues:
1. Check application logs
2. Review error tracking dashboard
3. Consult cloud provider documentation
4. Open an issue on GitHub

## Additional Resources

- [Flask Deployment Options](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Docker Documentation](https://docs.docker.com/)
- [AWS Deployment Guide](https://aws.amazon.com/getting-started/)
