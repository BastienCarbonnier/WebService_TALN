# This Python file uses the following encoding: utf-8
import sys
import json
import spacy


nlp = spacy.load("fr_core_news_sm")
doc = nlp(sys.argv[1])

list =[]
i = 0
for word in doc:
    list.append({"index":i,"mot":word.text, "type": word.dep_})
    i=i+1

#print json.dumps([{"param1":sys.argv[1]}, {'bar': ('baz', None, 1.0, 2)}])
print(json.dumps(list))
