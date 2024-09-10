import ast
import os
import pickle
import pandas as pd
from gensim.models import Word2Vec
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import numpy as np
import nltk

MODEL_PATH = os.path.join('data', 'w2v.model')
PROCESSED_DATA_PATH = os.path.join('data', 'processed_data.txt')

def load_or_train_model():
    if os.path.exists(MODEL_PATH):
        print("Loading existing model...")
        model = Word2Vec.load(MODEL_PATH)
    else:
        print("Training new model...")

        # Assuming the text data is in a column named 'text'
        if not os.path.exists(PROCESSED_DATA_PATH):
            df = pd.read_csv(os.path.join('backend/data', 'data.csv'), encoding="utf-8")
            text_data = df['text'].dropna().tolist()
            data = process_text_data(text_data)
            with open (PROCESSED_DATA_PATH, 'w') as f:
                f.write(str(data))
                f.close()
        else:
            with open(PROCESSED_DATA_PATH, 'r') as f:
                data = f.read()
                data = ast.literal_eval(data)
                f.close()

        print("Data processed.")
        # # Train the Word2Vec model
        model = Word2Vec(data, vector_size=100, window=5, sg=1)  # Skip Gram

        # # Save the model for future use
        model.save(MODEL_PATH)

    return model

def process_text_data(text_data):

    lemmatizer = WordNetLemmatizer()
    stop_words = set(stopwords.words('english'))

    print('Processing text data...')
    data = []
    for text in text_data:
        for sent in sent_tokenize(text):
            cleared_sent = []
            tokens = word_tokenize(sent.lower())
            for token in tokens:
                if token not in stop_words and token.isalnum():
                    lemmatized_token = lemmatizer.lemmatize(token)
                    cleared_sent.append(lemmatized_token)
            if len(cleared_sent) > 1:
                data.append(cleared_sent)

    print(f'Processed {len(data)} sentences.')
    return data


def combine_strings_to_vector(strings, model, preprocess):
    """
    Combines an array of strings into a single vector by averaging the vectors
    of each string's words after preprocessing the text.

    Args:
    - strings (list of str): The array of strings to combine (e.g., title, content).
    - model: The Word2Vec model used to generate word vectors.

    Returns:
    - np.ndarray: The combined vector for all the strings.
    """
    if preprocess:
    # Preprocess the text data
        processed_data = process_text_data(strings)
    else:
        processed_data = strings

    all_word_vectors = []

    for sentence in processed_data:
        word_vectors = [model.wv[word] for word in sentence if word in model.wv]
        all_word_vectors.extend(word_vectors)

    if len(all_word_vectors) == 0:
        # Return a zero vector if no valid words found
        return np.zeros(model.vector_size).tolist()

    # Return the average vector as a list
    return np.mean(all_word_vectors, axis=0).tolist()

# load_or_train_model()
