import os
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
        # Reads and processes the text data
        with open("H:/Code/Note/backend/data/alice.txt", "r", encoding="utf-8") as sample:
            s = sample.read()
        f = s.replace("\n", " ")
        
        data = [word_tokenize(sent.lower()) for sent in sent_tokenize(f)]
        
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
        return np.zeros(model.vector_size)  # Return a zero vector if no valid words found
    
    # Return the average vector
    return np.mean(all_word_vectors, axis=0)
