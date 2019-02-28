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
        #if deja_trouve and (phrase[i_d]["type"]!="ADJ" or phrase[i_d]["type"]!="ADV" or phrase[i_d]["type"]!="AUX" or phrase[i_d]["type"]!="VERB"):
           # break
        if phrase[i_d]["type"]=="ADJ":
            index_adj.append(i_d)
            deja_trouve = True
            i_d+=1
        elif phrase[i_d]["type"]=="ADV":
            i_d+=1
        elif phrase[i_d]["type"]=="AUX":
            i_d+=1
        else:
            break

    deja_trouve = False
    while i_g >=0:
        #if deja_trouve and (phrase[i_g]["type"]!="ADJ" or phrase[i_g]["type"]!="ADV" or phrase[i_g]["type"]!="AUX" or phrase[i_g]["type"]!="VERB"):
            #break
        if phrase[i_g]["type"]=="ADJ":
            index_adj.append(i_g)
            deja_trouve = True
            i_g-=1
        elif phrase[i_g]["type"]=="ADV":
            i_g-=1
        elif phrase[i_g]["type"]=="AUX":
            i_g-=1
        else:
            break
    return index_adj


def findAdverbsForAdjectifs(phrase,i_adj):
    index_adv = []
    i_d = i_adj+1
    i_g = i_adj-1

    while i_d <len(phrase):
        if phrase[i_d]["type"]=="ADV":
            index_adv.append(i_d)
            i_d+=1
        else:
            break

    while i_g >=0:
        if phrase[i_g]["type"]=="ADV":
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
        t = {"index":i,"mot":token.text, "type": token.pos_}
        list.append(t)
        i=i+1

for index,item in enumerate(list):
    if item["type"] == "NOUN":
        item["index_adj"] = []
        item["index_adj"] = findAdjectifForNouns(list,index)
        list[index] = item
    elif item["type"] == "ADJ":
        item["index_adv"] = []
        item["index_adv"] = findAdverbsForAdjectifs(list,index)
        list[index] = item

# Tests : 
# "La grande chambre vraiment noire était sale et la petite chambre était très très moche"

print(json.dumps(list))
