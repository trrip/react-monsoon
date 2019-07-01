from os import listdir
from os.path import isfile, join
mypath = "./"
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]

for i in onlyfiles:
    if ".json" in i:
        print("\"",end="")
        print(i.replace(".json", ""),end="")
        print("\",")
    #print(i)
