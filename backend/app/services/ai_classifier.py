import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
import re
import os
import string

class AIClassifier:
    def __init__(self):
        self.model = None
        self._train_model()
    
    def _load_training_data(self):
        """Load training data"""
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
        
        def load_file(filename):
            try:
                with open(os.path.join(data_dir, filename), 'r', encoding='utf-8') as f:
                    return [line.strip() for line in f if line.strip()]
            except:
                return []
        
        spam = load_file('enhanced_spam.txt')
        ham = load_file('enhanced_ham.txt')
        toxic = load_file('enhanced_toxic.txt')
        
        return spam, ham, toxic
    
    def _preprocess_text(self, text: str) -> str:
        """Enhanced text preprocessing"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove excessive punctuation
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        text = re.sub(r'[.]{2,}', '.', text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def _train_model(self):
        # Load training data from files
        spam_messages, ham_messages, toxic_messages = self._load_training_data()
        
        # Preprocess all messages
        spam_messages = [self._preprocess_text(msg) for msg in spam_messages]
        ham_messages = [self._preprocess_text(msg) for msg in ham_messages]
        toxic_messages = [self._preprocess_text(msg) for msg in toxic_messages]
        
        # Combine datasets
        messages = spam_messages + ham_messages + toxic_messages
        labels = (
            ['spam'] * len(spam_messages) + 
            ['ham'] * len(ham_messages) + 
            ['toxic'] * len(toxic_messages)
        )
        
        # Optimized pipeline with Gradient Boosting
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(
                stop_words='english',
                max_features=5000,
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.9,
                sublinear_tf=True
            )),
            ('classifier', GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42,
                subsample=0.8
            ))
        ])
        
        # Train model
        self.model.fit(messages, labels)
        
        # Evaluate model performance
        scores = cross_val_score(self.model, messages, labels, cv=5, scoring='accuracy')
        
        print(f"Model trained with {len(messages)} messages:")
        print(f"- Spam: {len(spam_messages)}")
        print(f"- Ham: {len(ham_messages)}")
        print(f"- Toxic: {len(toxic_messages)}")
        print(f"- Cross-validation accuracy: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
    
    def classify_message(self, message: str) -> dict:
        cleaned = self._preprocess_text(message)
        
        if not cleaned.strip():
            return {
                'prediction': 'ham',
                'confidence': 0.5,
                'probabilities': {'ham': 0.5, 'spam': 0.25, 'toxic': 0.25}
            }
        
        prediction = self.model.predict([cleaned])[0]
        probs = self.model.predict_proba([cleaned])[0]
        classes = self.model.classes_
        
        prob_dict = {cls: prob for cls, prob in zip(classes, probs)}
        for cls in ['ham', 'spam', 'toxic']:
            if cls not in prob_dict:
                prob_dict[cls] = 0.0
        
        # Improved confidence calculation
        max_prob = max(probs)
        second_max = sorted(probs)[-2] if len(probs) > 1 else 0
        confidence = max_prob - second_max + 0.5
        confidence = min(confidence, 1.0)
        
        return {
            'prediction': prediction,
            'confidence': confidence,
            'probabilities': prob_dict
        }

ai_classifier = AIClassifier()