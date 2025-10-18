import pandas as pd

df = pd.read_csv('reviews.csv', nrows=5)
print(df.head())
print('\nColumns:', df.columns.tolist())
print('\nData types:')
print(df.dtypes)
