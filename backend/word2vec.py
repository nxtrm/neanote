import os
import pandas as pd
from gensim.models import Word2Vec
from nltk.tokenize import sent_tokenize, word_tokenize
import numpy as np

MODEL_PATH = os.path.join('data', 'w2v.model')

def load_or_train_model():
    if os.path.exists(MODEL_PATH):
        print("Loading existing model...")
        model = Word2Vec.load(MODEL_PATH)
    else:
        print("Training new model...")
        # Reads and processes the text data from CSV
        df = pd.read_csv("H:/Code/Note/backend/data/data.csv", encoding="utf-8")
        
        # Assuming the text data is in a column named 'text'
        text_data = df['text'].dropna().tolist()
        
        # Tokenize the text data
        data = []
        for text in text_data:
            for sent in sent_tokenize(text):
                data.append(word_tokenize(sent.lower()))
        
        # Train the Word2Vec model
        model = Word2Vec(data, vector_size=100, window=5, sg=1)  # Skip Gram
        
        # Save the model for future use
        model.save(MODEL_PATH)
    
    return model


def combine_strings_to_vector(strings, model):
    """
    Combines an array of strings into a single vector by averaging the vectors 
    of each string's words.

    Args:
    - strings (list of str): The array of strings to combine (e.g., title, content).
    - model: The Word2Vec model used to generate word vectors.

    Returns:
    - np.ndarray: The combined vector for all the strings.
    """
    all_word_vectors = []
    
    for text in strings:
        words = word_tokenize(text.lower())
        word_vectors = [model.wv[word] for word in words if word in model.wv]
        all_word_vectors.extend(word_vectors)
    
    if len(all_word_vectors) == 0:
        return [None] # Return None if no valid words found
        # return np.zeros(model.vector_size).tolist()  # Return a zero vector if no valid words found
    
    # Return the average vector as a list
    return np.mean(all_word_vectors, axis=0).tolist()
