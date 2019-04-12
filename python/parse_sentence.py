# This Python file uses the following encoding: utf-8
import sys
import json
import spacy

def findAdjectifForNouns(phrase,i_nom):
    index_adj = []
    i_d = i_nom+1
    i_g = i_nom-1
    deja_trouve = False

    while i_d <len(phrase):
        #if deja_trouve and (phrase[i_d]["nature"]!="ADJ" or phrase[i_d]["nature"]!="ADV" or phrase[i_d]["nature"]!="AUX" or phrase[i_d]["nature"]!="VERB"):
           # break
        if phrase[i_d]["nature"]=="ADJ":
            index_adj.append(i_d)
            deja_trouve = True
            i_d+=1
        elif phrase[i_d]["nature"]=="ADV":
            i_d+=1
        elif phrase[i_d]["nature"]=="AUX":
            i_d+=1
        else:
            break

    deja_trouve = False
    while i_g >=0:
        #if deja_trouve and (phrase[i_g]["nature"]!="ADJ" or phrase[i_g]["nature"]!="ADV" or phrase[i_g]["nature"]!="AUX" or phrase[i_g]["nature"]!="VERB"):
            #break
        if phrase[i_g]["nature"]=="ADJ":
            index_adj.append(i_g)
            deja_trouve = True
            i_g-=1
        elif phrase[i_g]["nature"]=="ADV":
            i_g-=1
        elif phrase[i_g]["nature"]=="AUX":
            i_g-=1
        else:
            break
    return index_adj


def findAdverbsForAdjectifs(phrase,i_adj):
    index_adv = []
    i_d = i_adj+1
    i_g = i_adj-1

    while i_d <len(phrase):
        if phrase[i_d]["nature"]=="ADV":
            index_adv.append(i_d)
            i_d+=1
        else:
            break

    while i_g >=0:
        if phrase[i_g]["nature"]=="ADV":
            index_adv.append(i_g)
            i_g-=1
        else:
            break
    return index_adv


nlp = spacy.load("fr_core_news_sm")
doc = nlp(sys.argv[1])

list =[]
i = 0

for token in doc:
    if not token.is_punct :
        t = {"index":i,"mot":token.text, "nature": token.pos_}
        list.append(t)
        i=i+1

for index,item in enumerate(list):
    if item["nature"] == "NOUN":
        item["index_adj"] = []
        item["index_adj"] = findAdjectifForNouns(list,index)
        list[index] = item
    elif item["nature"] == "ADJ":
        item["index_adv"] = []
        item["index_adv"] = findAdverbsForAdjectifs(list,index)
        list[index] = item

# Tests :
# "La grande chambre vraiment noire était sale et la petite chambre était très très moche"

print(json.dumps(list))

#print(json.dumps([{ "index": 0, "mot": 'La', "nature": 'DET' },{ "index": 1, "mot": 'salle', "nature": 'NOUN', "index_adj": [] },{ "index": 2, "mot": 'de', "nature": 'ADP' },{ "index": 3, "mot": 'bain', "nature": 'NOUN', "index_adj": [ 7 ] },{ "index": 4, "mot": 'était', "nature": 'AUX' },{ "index": 5, "mot": 'vraiment', "nature": 'ADV' },{ "index": 6, "mot": 'très', "nature": 'ADV' },{ "index": 7, "mot": 'sale', "nature": 'ADJ', "index_adv": [ 6, 5 ]}]))
