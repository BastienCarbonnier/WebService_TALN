# This Python file uses the following encoding: utf-8
import sys
import json
import treetaggerwrapper
import warnings

from spellchecker import SpellChecker

spell = SpellChecker(language="fr")



tagger = treetaggerwrapper.TreeTagger(TAGLANG='fr',TAGOPT="-prob -threshold 0.7 -token -lemma -sgml -quiet")

tags = {
    "VER:cond":"VERB",
    "VER:futu":"VERB",
    "VER:impe":"VERB",
    "VER:impf":"VERB",
    "VER:infi":"VERB",
    "VER:pper":"VERB",
    "VER:ppre":"VERB",
    "VER:pres":"VERB",
    "VER:simp":"VERB",
    "VER:subi":"VERB",
    "VER:subp":"VERB",
    "VERB" : "VERB",
    "SYM" :"SYM",
    "PUN:cit" : "PUNCT",
    "PUN" : "PUNCT",
    "PUNCT" : "PUNCT",
    "NAM" : "PROPN",
    "PROPN" : "PROPN",
    "NOM" : "NOUN",
    "NOUN" : "NOUN",
    "NUM" : "NUM",
    "PRP" : "ADP",
    "PRP:det" : "DET",
    "ADP" : "ADP",
    "PRO" : "PRON",
    "PRO:DEM" : "PRON",
    "PRO:IND" : "PRON",
    "PRO:PER" : "PRON",
    "PRO:POS" : "PRON",
    "PRO:REL" : "PRON",
    "PRON" : "PRON",
    "CONJ" : "KON",
    "CCONJ" : "KON",
    "SCONJ" : "KON",
    "KON" : "KON",
    "ADV" : "ADV",
    "ADJ" : "ADJ",
    "DET:ART" : "DET",
    "DET:POS" : "DET",
    "DET" : "DET",
    "INT" : "INTJ",
    "INTJ" : "INTJ",
    "PART" : "PART",
    "X" : "X",
    "SENT" : "PUNCT",
    "ABR" : "X"
}
def tagToObj(sentArray):
    sentTab = []
    for t in sentArray:
        if len(t) >1 :
            sentTab.append({"mot" : spell.correction(t[0]), "nature" : tags[t[1]],"tag":t[1],"lemme":t[2],"acc":t[3]})
    return sentTab

def posTaggingTreeTagger(text) :
    tags = tagger.tag_text(text)
    taggedText = treetaggerwrapper.make_tags(tags,allow_extra = True)
    return tagToObj(taggedText)
'''
nlp = spacy.load("fr_core_news_sm")
doc = nlp("Comme un hôtel de 100 chambres, je dirais que c'ordinaire, bien que je ne suis pas un ami de grands hôtels. Nous avons apprécié d'espace de notre chambre et la vue sur la mer. Demandez une chambre avec vue sur la mer et la piscine de aux derniers étages (nous avions une suite). Personnel de ménage était excellent, même pour les enfants était petites choses rangée chaque jour :-) Nous avons aussi beaucoup aimé la piscine. Le petit déjeuner continental habituel, sauf Nous avons trouvé un peu de moisissure dans un melon un matin... Le personnel de la réception ne sont pas des plus chaleureux !")#sys.argv[1])

list =[]
i = 0

for token in doc:
    if not token.is_punct :
        t = {"index":i,"mot":token.text, "nature": token.pos_}
        list.append(t)
        i=i+1
'''

# Tests :
# "La grande chambre vraiment noire était sale et la petite chambre était très très moche"

print(json.dumps(posTaggingTreeTagger(sys.argv[1])))

#print(json.dumps([{ "index": 0, "mot": 'La', "nature": 'DET' },{ "index": 1, "mot": 'salle', "nature": 'NOUN' },{ "index": 2, "mot": 'de', "nature": 'ADP' },{ "index": 3, "mot": 'bain', "nature": 'NOUN' },{ "index": 4, "mot": 'était', "nature": 'AUX' },{ "index": 5, "mot": 'vraiment', "nature": 'ADV' },{ "index": 6, "mot": 'très', "nature": 'ADV' },{ "index": 7, "mot": 'sale', "nature": 'ADJ'}]))
