# This Python file uses the following encoding: utf-8
import nltk
import nltk.data

from nltk.corpus import stopwords
from nltk.tokenize import PunktSentenceTokenizer

sentence = "La propreté laisse à désirer."
tokens = nltk.word_tokenize(sentence)
#st = nltk.sent_tokenize(sentence,'french')


print(nltk.pos_tag(tokens))

"""
sr = stopwords.words('french')
clean_tokens = tokens[:]

for token in tokens:
    if token in sr:
        clean_tokens.remove(token)
print(clean_tokens)
"""
