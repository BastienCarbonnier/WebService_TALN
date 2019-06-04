# This Python file uses the following encoding: utf-8
import sys
import json
import spacy

# Liste des auxiliaires mal orthographiés ne pouvant être corrigés par spellchecker
listAux = ["etes", "ete", "etais", "etait", "etions","etiez", "etaient"]

# Trouve les adjectifs associés aux noms
def findAdjectifForNouns(phrase,i_nom):
    index_adj = []
    i_d = i_nom+1
    i_g = i_nom-1
    deja_trouve = False

    while i_d <len(phrase):
        if phrase[i_d]["nature"]=="ADJ":
            index_adj.append(i_d)
            deja_trouve = True
            i_d+=1
        elif phrase[i_d]["nature"]=="ADV":
            i_d+=1
        elif (phrase[i_d]["lemme"] != "<unknown>" and ((phrase[i_d]["lemme"]=="être") or (phrase[i_d]["lemme"]=="avoir"))) or phrase[i_d]["mot"] in listAux:
            i_d+=1
        elif phrase[i_d]["mot"]=="que":
            i_d+=1
        elif phrase[i_d]["nature"]=="PRON" or phrase[i_d]["nature"]=="ADP":
            i_d+=1
        elif phrase[i_d]["nature"]=="KON":
            i_d+=1
        else:
            break

    deja_trouve = False
    while i_g >=0:
        if phrase[i_g]["nature"]=="ADJ":
            index_adj.append(i_g)
            deja_trouve = True
            i_g-=1
        elif phrase[i_g]["nature"]=="ADV":
            i_g-=1
        elif (phrase[i_g]["lemme"] != "<unknown>" and ((phrase[i_g]["lemme"]=="être") or (phrase[i_g]["lemme"]=="avoir"))) or phrase[i_g]["mot"] in listAux:
            i_g-=1
        elif phrase[i_g]["nature"]=="KON":
            i_g-=1
        else:
            break
    return index_adj

# Trouve les adverbes associés aux adjectifs
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

# Trouve les verbes associés aux noms
def findVerbeForNouns(phrase,i_nom):
    index_verbe = []
    i_d = i_nom+1
    i_g = i_nom-1
    deja_trouve = False

    while i_d <len(phrase):
        if phrase[i_d]["nature"]=="VERB" and not ((phrase[i_d]["lemme"] != "<unknown>" and ((phrase[i_d]["lemme"]=="être") or (phrase[i_d]["lemme"]=="avoir"))) or phrase[i_d]["mot"] in listAux):
            index_verbe.append(i_d)
            deja_trouve = True
            i_d+=1
        elif phrase[i_d]["nature"]=="DET":
            i_d+=1
        elif phrase[i_d]["nature"]=="ADV":
            i_d+=1
        elif phrase[i_d]["mot"]=="que":
            i_d+=1
        elif phrase[i_d]["nature"]=="PRON":
            i_d+=1
        elif phrase[i_d]["nature"]=="KON":
            i_d+=1
        else:
            break

    deja_trouve = False
    while i_g >=0:
        if phrase[i_g]["nature"]=="VERB":
            index_verbe.append(i_g)
            deja_trouve = True
            i_g-=1
        elif phrase[i_g]["nature"]=="DET":
            i_g-=1
        elif phrase[i_g]["nature"]=="ADV":
            i_g-=1
        elif phrase[i_g]["nature"]=="KON":
            i_g-=1
        else:
            break
    return index_verbe

# prise en compte de la négation ou autre
def findAdverbsForVerbes(phrase,i_adj):
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

list = json.loads(sys.argv[1])

for index,item in enumerate(list):
    if item["nature"] == "NOUN":
        item["index_adj"] = []
        item["index_adj"] = findAdjectifForNouns(list,index)
        item["index_verb"] = []
        item["index_verb"] = findVerbeForNouns(list,index)
        list[index] = item
    elif item["nature"] == "ADJ":
        item["index_adv"] = []
        item["index_adv"] = findAdverbsForAdjectifs(list,index)
        list[index] = item
    elif item["nature"] == "VERB":
        item["index_adv"] = []
        item["index_adv"] = findAdverbsForVerbes(list,index)
        list[index] = item

print(json.dumps(list))
