from gensim.models import Word2Vec
from nltk.tokenize import sent_tokenize, word_tokenize
import numpy as np

#  Reads ‘alice.txt’ file
sample = open("H:/Code/Note/backend/data/alice.txt", "r", encoding="utf-8")
s = sample.read()
 
# Replaces escape character with space
f = s.replace("\n", " ")
 
data = []
 
# iterate through each sentence in the file
for i in sent_tokenize(f):
    temp = []
 
    # tokenize the sentence into words
    for j in word_tokenize(i):
        temp.append(j.lower())
 
    data.append(temp)

# Create CBOW or Skip Gram model
model = Word2Vec(data, vector_size=100, window=5, sg=1) #Skip Gram

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

# Example usage:
strings = ["Note title", "This is the content of the note.", "Another string if needed."]
combined_vector = combine_strings_to_vector(strings, model)

print("Combined Vector:", combined_vector)