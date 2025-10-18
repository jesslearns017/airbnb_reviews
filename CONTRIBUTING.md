# Contributing to Airbnb Reviews Sentiment Analysis

Thank you for considering contributing to this project! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Python version, Node version)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:
- A clear description of the enhancement
- Why this enhancement would be useful
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository**
2. **Create a new branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/jesslearns017/airbnb_reviews.git
cd airbnb_reviews
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
python -m textblob.download_corpora
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Download the dataset from [Kaggle](https://www.kaggle.com/datasets/muhammadahmedansari/airbnb-dataset) and place `reviews.csv` in the root directory.

## Code Style

### Python (Backend)
- Follow PEP 8 guidelines
- Use meaningful variable names
- Add docstrings to functions
- Keep functions focused and small

### JavaScript/React (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Keep components modular and reusable

### CSS
- Use consistent naming conventions
- Group related styles together
- Comment complex styling logic

## Testing

Before submitting a PR:
- Test all API endpoints
- Verify the frontend renders correctly
- Check for console errors
- Test on different screen sizes (responsive design)
- Ensure sentiment analysis works as expected

## Areas for Contribution

Here are some ideas for contributions:

### Features
- Add more NLP models (VADER, BERT, etc.)
- Implement user authentication
- Add export functionality (CSV, PDF reports)
- Create more visualization types
- Add sentiment analysis comparison between models
- Implement caching for better performance

### Improvements
- Optimize data loading for larger datasets
- Add unit tests and integration tests
- Improve error handling
- Add loading states and better UX
- Implement dark mode
- Add internationalization (i18n)

### Documentation
- Add more code comments
- Create video tutorials
- Add more examples
- Improve API documentation

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

Thank you for contributing! 🚀
