# -*- coding: utf-8 -*-
"""
Created on Wed Nov 13 08:46:45 2019

@author: user
"""

import json
import pandas as pd
import re
import datetime

from collections import OrderedDict

data = []
for year in range(2009, 2019):
    print(year)
    with open("D:\\Dev\\perso\\trump_twitter\\data\\condensed_{}.json".format(year)) as json_file:
        data.extend( json.load(json_file) )

insults = OrderedDict()
insults["loser"] = ["loser"]
insults["dumb"] = ["dumb", "dummy"]
insults["terrible"] = ["terrible", "terribly"]
insults["stupid"] = ["stupid", "stupidly", "stupidity"]
insults["weak"] = ["weak"]
insults["dope"] = ["dope", "dopey"]
insults["dishonest"] = ["dishonest", "dishonesty"]
insults["lightweight"] = ["lightweight"]
insults["incompetent"] = ["incompetent", "incompetency", "incompetence"]
insults["boring"] = ["boring"]
insults["fool"] = ["fools", "fool", "foolishness", "foolish", "foolishly"]
insults["pathetic"] = ["pathetic", "pathetically"]

def findWholeWord(w, sentence):
    return bool(re.compile(r'\b({0})\b'.format(w), flags=re.IGNORECASE).search(sentence))

def detect_insult(row, insult):
    for insult_related in insults[insult]:
        if findWholeWord(insult_related, row["text"]):
            return True
    else:
        return False    

df =pd.DataFrame(data)
df["date"] = df["created_at"].apply(lambda row: datetime.datetime.strptime(row , "%a %b %d %H:%M:%S +0000 %Y"))
df = df.sort_values("date")

for insult in insults.keys(): 
    print( "Working on insult : {}".format(insult) )        
    df["insult_" + insult] = df.apply(lambda row: detect_insult(row, insult), axis=1)
    print(df["insult_" + insult].value_counts())

#creating dates_used
dates = ["2010-01-01", "2019-01-01"]
start, end = [datetime.datetime.strptime(_, "%Y-%m-%d") for _ in dates]
dates =  OrderedDict(((start + datetime.timedelta(_)).strftime(r"%b-%Y"), None) for _ in range((end - start).days)).keys()
dates = [datetime.datetime.strptime(_, "%b-%Y") for _ in dates]

#creating the Final Dataframe
data_final = []
count_insults = dict()
for insult in insults.keys():
    for index_date, date in enumerate(dates):
        if (index_date > 0):
            data = df[df["insult_" + insult]][(df["date"] <= dates[index_date]) & (df["date"] > dates[index_date-1])]
        else:
            data = df[df["insult_" + insult]][(df["date"] <= date)]
        
        #if contains values
        if data.shape[0] > 0:
            for index, row in data.iterrows():
                if insult in count_insults:
                    count_insults[insult] += 1
                else:
                    count_insults[insult] = 1
                dict_data = dict({"name" : insult,
                                  "value" : count_insults[insult],
                                  "year" : date.year + date.month/12})
                data_final.append(dict_data)
        else:
            #no data
            if insult in count_insults:
                count_insults[insult] += 0
            else:
                count_insults[insult] = 0
                
            dict_data = dict({"name" : insult,
                              "value" : count_insults[insult],
                              "year" : date.year + date.month/12})
            data_final.append(dict_data)
        
        
data_final = pd.DataFrame(data_final)

#keeping only the highest value by year
data_final = data_final.drop_duplicates(subset=["name","year"], keep="last")    

#find lastValue
def find_lastValue(row):
    try:
        return data_final[(data_final["name"] == row["name"]) & (data_final["year"] < row["year"])].sort_values("value", ascending=False)["value"].iloc[0]
    except IndexError:
        #return current value (starting one)
        return data_final[(data_final["name"] == row["name"]) & (data_final["year"] <= row["year"])].sort_values("value", ascending=False)["value"].iloc[0]    

data_final["lastValue"] = data_final.apply(find_lastValue,axis=1)


def find_rank(row):
    values = data_final[(data_final["year"] == row["year"])].sort_values("value", ascending=False)["name"].tolist()
    return values.index(row["name"]) + 1

data_final["rank"] = data_final.apply(find_rank,axis=1)

data_final.to_csv("D:\\Dev\\perso\\trump_twitter\\data\\data_final\\data_insults.csv", sep=",", index=False)
















counts = dict()
for index, row in df.iterrows():
    for word in row["text"].split():
        word = re.sub('[^0-9a-zA-Z]+', '', word).upper()
        if word in counts:
            counts[word]["counter"] = counts[word]["counter"] + 1
            counts[word]["dates"] = counts[word]["dates"] + [datetime.datetime.strptime(row["created_at"] , "%a %b %d %H:%M:%S +0000 %Y")]
        else:
            counts[word] = dict({"counter" : 1, "dates" : [datetime.datetime.strptime(row["created_at"] , "%a %b %d %H:%M:%S +0000 %Y")]})
     
#creating dataframe
            
    
df_words = pd.DataFrame.from_dict(counts, orient = 'index')
df_words = df_words.reset_index()\
  .melt('index',value_name='count')\
  .drop('variable', axis=1)\
  .sort_values('count', ascending=False)