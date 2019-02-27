# This Python file uses the following encoding: utf-8
import sys
import json
import spacy

# Return list of position of index of adjectifs a noun
def findAdjectifForNouns(phrase,i_nom):
    index_adj = []
    i_d = i_nom+1

    deja_trouve = False

    while i_d <len(phrase):
        if deja_trouve and phrase[i_d]["type"]!="ADJ":
            break
        elif phrase[i_d]["type"]=="ADJ":
            index_adj.append(i_d)
            deja_trouve = True
            i_d+=1
        elif phrase[i_d]["type"]=="ADV":
            i_d+=1
        elif phrase[i_d]["type"]=="AUX":
            i_d+=1
        else:
            break
    return index_adj


nlp = spacy.load("fr_core_news_sm")
doc = nlp(sys.argv[1])

list =[]
i = 0

for token in doc:
    if not token.is_punct :
        t = {"index":i,"mot":token.text, "type": token.pos_}
        list.append(t)
        i=i+1

for index,item in enumerate(list):
    if item["type"] == "NOUN":
        item["index_adj"] = []
        item["index_adj"] = findAdjectifForNouns(list,index)
        list[index] = item


# Trouver index du nom correspondant à l'adjectif
# Trouver
#print json.dumps([{"param1":sys.argv[1]}, {'bar': ('baz', None, 1.0, 2)}])
print(json.dumps(list))
