"""
Create a small sample of reviews.csv for deployment
"""
import pandas as pd

# Read first 3000 rows from the full dataset
df = pd.read_csv('reviews.csv', nrows=3000)

# Save to backend directory
df.to_csv('backend/reviews_sample.csv', index=False)

print(f"✅ Created backend/reviews_sample.csv with {len(df)} reviews")
print(f"📊 File size: {len(df)} rows")
