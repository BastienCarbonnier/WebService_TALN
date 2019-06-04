# This Python file uses the following encoding: utf-8
import sys
import json
import treetaggerwrapper
import warnings
import re

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
            tag = t[1];
            if t[2]=="ce" or t[2]=="chaque":
                tag = "DET"
            sentTab.append({"mot" : t[0], "nature" : tags[tag],"tag":t[1],"lemme":t[2]})
    return sentTab

def posTaggingTreeTagger(text) :
    tags = tagger.tag_text(text)
    taggedText = treetaggerwrapper.make_tags(tags,allow_extra = True)
    return tagToObj(taggedText)

def spellCorrectSentence(sent) :
    sent = sent.replace(","," , ")
    sent = sent.replace("."," . ")
    sent = re.sub("  +", ' ', sent)
    words = sent.split(" ")
    words_corrected = []
    for word in words :
        if len(word.split("'")) < 2 and word != '':
            words_corrected.append(spell.correction(word))
        else :
            words_corrected.append(word)
    return " ".join(words_corrected)

print(json.dumps(posTaggingTreeTagger(spellCorrectSentence(sys.argv[1]))))
