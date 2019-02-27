# This Python file uses the following encoding: utf-8
import spacy
from spacy import displacy
#_md _sm
nlp = spacy.load("fr_core_news_sm")
doc = nlp("La chambre était très sale.")


'''
for token in doc:
    if not token.is_punct:
        print("{0}\t{1}\t{2}\t{3}\t{4}\t{5}\t{6}\t{7}".format(
            token.text,
            token.idx,
            token.lemma_,
            token.is_punct,
            token.is_space,
            token.shape_,
            token.pos_,
            token.tag_
        ))
'''

for token in doc:
    if not token.is_punct and token.pos_!="ADP" and token.pos_!="DET":
        print("{0}\t{1}".format(
            token.text,
            token.pos_
        ))
#print([(word.text, word) for word in doc])


# fr_core_news_md
#25s 22 mots
#22,75s 14 mots
#23s 5 mots
#23s 8 mots



# fr_core_news_sm

# 10s 22 mots
# 10s 5 mots

#"La propreté laisse à désirer. Je ne suis vraiment pas satisfait de l'accueil. Le personnel est très méprisant envers les étrangers."
"""

verif mots composé
Lemmatisation sur les verbes
retrouver les mots composés
enlever les adverbe
refaire les mots composés
annoter et enlever négation

nettoyer la salle de bain

ontologie = réseau lexico sémantique avec domaine restreint


voir n-gram

faire journal de bord

situation->problème -> stratégie employé
"""
