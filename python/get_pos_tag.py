# This Python file uses the following encoding: utf-8
import sys
import json
import spacy

nlp = spacy.load("fr_core_news_sm")
doc = nlp(sys.argv[1])

list =[]
i = 0

for token in doc:
    if not token.is_punct :
        t = {"index":i,"mot":token.text, "nature": token.pos_}
        list.append(t)
        i=i+1

# Tests :
# "La grande chambre vraiment noire était sale et la petite chambre était très très moche"

print(json.dumps(list))

#print(json.dumps([{ "index": 0, "mot": 'La', "nature": 'DET' },{ "index": 1, "mot": 'salle', "nature": 'NOUN', "index_adj": [] },{ "index": 2, "mot": 'de', "nature": 'ADP' },{ "index": 3, "mot": 'bain', "nature": 'NOUN', "index_adj": [ 7 ] },{ "index": 4, "mot": 'était', "nature": 'AUX' },{ "index": 5, "mot": 'vraiment', "nature": 'ADV' },{ "index": 6, "mot": 'très', "nature": 'ADV' },{ "index": 7, "mot": 'sale', "nature": 'ADJ', "index_adv": [ 6, 5 ]}]))
