# This Python file uses the following encoding: utf-8
import sys
import json
import treetaggerwrapper
import warnings

from spellchecker import SpellChecker

spell = SpellChecker(language="fr")



tagger = treetaggerwrapper.TreeTagger(TAGLANG='fr',TAGOPT="-token -lemma -sgml -quiet")

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
            sentTab.append({"mot" : t[0], "nature" : tags[t[1]],"tag":t[1],"lemme":t[2]})
    return sentTab

def posTaggingTreeTagger(text) :
    tags = tagger.tag_text(text)
    taggedText = treetaggerwrapper.make_tags(tags,allow_extra = True)
    return tagToObj(taggedText)

def spellCorrectSentence(sent) :
    words = sent.split(" ");
    words_corrected = []
    for word in words :
        if len(word.split("'")) < 2:
            words_corrected.append(spell.correction(word))
        else :
            words_corrected.append(word)
    return " ".join(words_corrected)

# Tests :
# "La grande chambre vraiment noire était sale et la petite chambre était très très moche"
print(json.dumps(posTaggingTreeTagger(spellCorrectSentence(sys.argv[1]))))

#print(json.dumps([{ "index": 0, "mot": 'La', "nature": 'DET' },{ "index": 1, "mot": 'salle', "nature": 'NOUN' },{ "index": 2, "mot": 'de', "nature": 'ADP' },{ "index": 3, "mot": 'bain', "nature": 'NOUN' },{ "index": 4, "mot": 'était', "nature": 'AUX' },{ "index": 5, "mot": 'vraiment', "nature": 'ADV' },{ "index": 6, "mot": 'très', "nature": 'ADV' },{ "index": 7, "mot": 'sale', "nature": 'ADJ'}]))
