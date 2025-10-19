# Sentiment Analysis Evaluation Metrics

This guide explains the different metrics used to evaluate sentiment analysis models beyond simple accuracy.

## 📊 Why Multiple Metrics Matter

**Accuracy alone can be misleading**, especially with imbalanced datasets. For example:
- If 90% of reviews are positive, a model that always predicts "positive" gets 90% accuracy but is useless!
- We need metrics that measure different aspects of model performance.

## 🎯 Key Evaluation Metrics

### 1. Accuracy
**What it measures:** Overall correctness

**Formula:** `(Correct Predictions) / (Total Predictions)`

**Example:**
- 100 reviews total
- 75 correctly classified
- **Accuracy = 75%**

**Pros:**
- ✅ Easy to understand
- ✅ Good for balanced datasets

**Cons:**
- ❌ Misleading with imbalanced data
- ❌ Doesn't show which class performs better

**When to use:** Balanced datasets where all classes are equally important

---

### 2. Precision
**What it measures:** Of all positive predictions, how many were actually positive?

**Formula:** `True Positives / (True Positives + False Positives)`

**Example:**
- Model predicts 100 reviews as "positive"
- 85 are actually positive
- 15 are actually negative (false positives)
- **Precision = 85%**

**Pros:**
- ✅ Shows prediction reliability
- ✅ Important when false positives are costly

**Cons:**
- ❌ Ignores false negatives
- ❌ Can be high even if model misses many positives

**When to use:** When you want to be sure your positive predictions are correct (e.g., spam detection)

**Airbnb Example:**
```
Predicted Positive: 1000 reviews
Actually Positive: 850 reviews
False Positives: 150 reviews (negative reviews wrongly called positive)
Precision = 850/1000 = 85%
```

---

### 3. Recall (Sensitivity)
**What it measures:** Of all actual positives, how many did we find?

**Formula:** `True Positives / (True Positives + False Negatives)`

**Example:**
- 100 actual positive reviews
- Model finds 80 of them
- Misses 20 (false negatives)
- **Recall = 80%**

**Pros:**
- ✅ Shows completeness
- ✅ Important when missing positives is costly

**Cons:**
- ❌ Ignores false positives
- ❌ Can be high even with many false alarms

**When to use:** When you want to find all positives (e.g., disease detection)

**Airbnb Example:**
```
Actually Positive: 1000 reviews
Model Found: 800 reviews
Missed: 200 reviews (false negatives)
Recall = 800/1000 = 80%
```

---

### 4. F1-Score
**What it measures:** Harmonic mean of precision and recall

**Formula:** `2 × (Precision × Recall) / (Precision + Recall)`

**Example:**
- Precision = 85%
- Recall = 80%
- **F1-Score = 2 × (0.85 × 0.80) / (0.85 + 0.80) = 82.4%**

**Pros:**
- ✅ Balances precision and recall
- ✅ Single metric for model comparison
- ✅ Good for imbalanced datasets

**Cons:**
- ❌ Less interpretable than precision/recall alone
- ❌ Treats precision and recall equally (may not match business needs)

**When to use:** When you need a single metric that balances both precision and recall

---

### 5. Confusion Matrix
**What it shows:** Detailed breakdown of predictions

**Example for Sentiment Analysis:**

```
                    Predicted
                Pos    Neu    Neg
Actual  Pos    850     50     100
        Neu     80    600      70
        Neg     70     50     880
```

**Insights:**
- **True Positives (850):** Correctly identified positive reviews
- **False Positives (150):** Negative/neutral reviews wrongly called positive
- **False Negatives (150):** Positive reviews wrongly called negative/neutral
- **True Negatives (1530):** Correctly identified negative/neutral reviews

---

### 6. Macro vs Micro Averaging (Multi-class)

For 3-class sentiment (Positive, Neutral, Negative):

**Macro-Average:**
- Calculate metric for each class separately
- Average them (treats all classes equally)
- Good for balanced importance

**Micro-Average:**
- Pool all predictions together
- Calculate metric globally
- Good when classes have different sizes

**Example:**
```
Class        Precision    Recall    F1-Score    Support
Positive        0.85       0.80       0.82       1000
Neutral         0.70       0.75       0.72        750
Negative        0.88       0.90       0.89       1000

Macro Avg       0.81       0.82       0.81       2750
Micro Avg       0.83       0.83       0.83       2750
```

---

### 7. ROC-AUC (Advanced)
**What it measures:** Model's ability to distinguish between classes

**Range:** 0 to 1 (0.5 = random guessing, 1.0 = perfect)

**Pros:**
- ✅ Threshold-independent
- ✅ Good for comparing models

**Cons:**
- ❌ Less interpretable
- ❌ Requires probability scores

**When to use:** Comparing different models, especially with imbalanced data

---

## 🎓 Which Metrics to Use?

### For Airbnb Sentiment Analysis:

**Exploratory Analysis (Current):**
- ✅ **Accuracy**: Quick overall performance check
- ✅ **Confusion Matrix**: See where model struggles
- ✅ **Distribution**: Check class balance

**Production Application:**
- ✅ **Precision**: Ensure positive predictions are reliable
- ✅ **Recall**: Don't miss negative reviews (important for hosts)
- ✅ **F1-Score**: Balance both metrics
- ✅ **Macro F1**: Treat all sentiments equally
- ✅ **Confusion Matrix**: Identify specific error patterns

---

## 💻 Implementation Example

### Calculate Metrics in Python

```python
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Assuming you have true labels and predictions
y_true = ['positive', 'negative', 'neutral', ...]  # Actual sentiments
y_pred = ['positive', 'positive', 'neutral', ...]  # Model predictions

# Calculate metrics
accuracy = accuracy_score(y_true, y_pred)
precision = precision_score(y_true, y_pred, average='macro')
recall = recall_score(y_true, y_pred, average='macro')
f1 = f1_score(y_true, y_pred, average='macro')

# Confusion matrix
cm = confusion_matrix(y_true, y_pred, labels=['positive', 'neutral', 'negative'])

# Detailed report
report = classification_report(y_true, y_pred)

print(f"Accuracy: {accuracy:.2%}")
print(f"Precision: {precision:.2%}")
print(f"Recall: {recall:.2%}")
print(f"F1-Score: {f1:.2%}")
print("\nConfusion Matrix:")
print(cm)
print("\nDetailed Report:")
print(report)
```

**Output Example:**
```
Accuracy: 78.50%
Precision: 76.30%
Recall: 75.80%
F1-Score: 76.05%

Confusion Matrix:
[[850  50 100]
 [ 80 600  70]
 [ 70  50 880]]

Detailed Report:
              precision    recall  f1-score   support

    positive       0.85      0.85      0.85      1000
     neutral       0.86      0.80      0.83       750
    negative       0.84      0.88      0.86      1000

    accuracy                           0.85      2750
   macro avg       0.85      0.84      0.85      2750
weighted avg       0.85      0.85      0.85      2750
```

---

## 🔍 Stemming vs Lemmatization

### What They Are

**Stemming:** Crude chopping of word endings
- "running" → "run"
- "better" → "better" (no change)
- "studies" → "studi"

**Lemmatization:** Intelligent reduction to dictionary form
- "running" → "run"
- "better" → "good"
- "studies" → "study"

### Why We DON'T Use Them (Current Approach)

**Preserves Sentiment Intensity:**
```
Original: "This place was absolutely amazing!"
With Stemming: "This place was absolut amaz!"
Problem: Loses emphasis and readability
```

**Maintains Context:**
```
Original: "The host was very responsive"
With Lemmatization: "The host be very responsive"
Problem: Changes meaning, loses tense
```

**Better for Sentiment:**
- "good" vs "better" vs "best" have different sentiment strengths
- "running late" vs "run late" have different implications
- TextBlob works better with natural language

### When TO Use Them

**Use Stemming/Lemmatization when:**
- ✅ Building custom models (BERT, etc.)
- ✅ Reducing vocabulary size
- ✅ Improving generalization
- ✅ Topic modeling or classification

**Example for Custom Model:**
```python
from nltk.stem import PorterStemmer, WordNetLemmatizer

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

text = "The hosts were very responsive and accommodating"

# Stemming
stemmed = " ".join([stemmer.stem(word) for word in text.split()])
# "the host were veri respons and accommod"

# Lemmatization
lemmatized = " ".join([lemmatizer.lemmatize(word) for word in text.split()])
# "The host were very responsive and accommodating"
```

---

## 📈 Improving Your Model

### 1. Analyze Errors with Confusion Matrix

```python
# Find most confused pairs
import numpy as np

# Get confusion matrix
cm = confusion_matrix(y_true, y_pred, labels=['positive', 'neutral', 'negative'])

# Find biggest confusions
for i, true_label in enumerate(['positive', 'neutral', 'negative']):
    for j, pred_label in enumerate(['positive', 'neutral', 'negative']):
        if i != j and cm[i][j] > 50:  # More than 50 misclassifications
            print(f"Often confuses {true_label} as {pred_label}: {cm[i][j]} times")
```

### 2. Focus on Low-Performing Classes

```python
# Calculate per-class metrics
from sklearn.metrics import classification_report

report = classification_report(y_true, y_pred, output_dict=True)

for label in ['positive', 'neutral', 'negative']:
    f1 = report[label]['f1-score']
    if f1 < 0.70:  # Below 70% F1
        print(f"⚠️ {label} class needs improvement (F1: {f1:.2%})")
        print(f"   Precision: {report[label]['precision']:.2%}")
        print(f"   Recall: {report[label]['recall']:.2%}")
```

### 3. Adjust Classification Thresholds

```python
# For TextBlob, adjust sentiment boundaries
def classify_sentiment_adjusted(polarity):
    if polarity > 0.15:  # Stricter positive threshold
        return 'positive'
    elif polarity < -0.15:  # Stricter negative threshold
        return 'negative'
    else:
        return 'neutral'
```

---

## 🎯 Best Practices

1. **Always use multiple metrics** - Don't rely on accuracy alone
2. **Check confusion matrix** - Understand error patterns
3. **Consider business impact** - Which errors are more costly?
4. **Use appropriate averaging** - Macro for balanced importance, weighted for class size
5. **Validate on test set** - Never evaluate on training data
6. **Compare with baseline** - Is your model better than random guessing?

---

## 📚 Further Reading

- [Scikit-learn Metrics Guide](https://scikit-learn.org/stable/modules/model_evaluation.html)
- [Understanding Precision-Recall](https://developers.google.com/machine-learning/crash-course/classification/precision-and-recall)
- [F1 Score Explained](https://en.wikipedia.org/wiki/F-score)
- [NLTK Stemming & Lemmatization](https://www.nltk.org/howto/stem.html)

---

## 🔧 Adding Metrics to Your Dashboard

To add these metrics to your Airbnb sentiment analysis:

1. **Collect ground truth labels** (manually label 500-1000 reviews)
2. **Calculate metrics** using sklearn
3. **Display in dashboard** alongside accuracy
4. **Track over time** to monitor model performance

This gives you a complete picture of model performance beyond simple accuracy! 📊
