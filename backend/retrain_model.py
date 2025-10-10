#!/usr/bin/env python3
"""
Script to retrain AI model with user feedback
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.ai_classifier import ai_classifier

def retrain_with_feedback():
    """Retrain model including user feedback data"""
    print("Retraining AI model with user feedback...")
    
    # The AI classifier will automatically pick up new data from enhanced_ham.txt
    # when it reloads the training data
    ai_classifier._train_model()
    
    print("Model retrained successfully!")
    print("New model will be used for future message classifications.")

if __name__ == "__main__":
    retrain_with_feedback()