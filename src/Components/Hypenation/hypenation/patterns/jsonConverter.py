import os
import json
import codecs


# for converting default js to json for data purpose


def getStringFromFile(fileName):
    f = codecs.open(fileName, encoding='utf-8')
    data = f.readlines()
    f.close()
    return data


def writeToFile(string, fileName):
    f = codecs.open(fileName, encoding='utf-8', mode='w+')
    f.write(unicode(string))
    f.close()


def convertStringToJson(str):
    arr = str.split('Hyphenator.')
    features = {}
    finalArr = {}
    langauge = arr[2][arr[2].find('[') + 2:arr[2].find('[') + 4]
    for i in arr:
        valueString = i.split(';')[0][i.find('=') + 1:]
        features[i.split('[')[0]] = valueString.decode('unicode_escape')
    finalArr['language'] = langauge.replace('\'', '')
    finalArr['leftmin'] = int(features['leftmin'])
    finalArr['rightmin'] = int(features['rightmin'])
    finalArr['shortestPattern'] = int(features['shortestPattern'])
    finalArr['longestPattern'] = int(features['longestPattern'])
    finalArr['specialChars'] = features['specialChars'].replace('\'', "")
    if 'de' in langauge:
        finalArr['patterns'] = features['patterns'].replace('\'', "")
    else:
        finalArr['patterns'] = features['patterns'].replace('\"', "")
    writeToFile(json.dumps(finalArr, ensure_ascii=False),
                langauge.replace('\'', '') + '.json')
    return ''


files = [f for f in os.listdir('.') if os.path.isfile(f)]
for f in files:
    if '.js' in f and 'or' not in f:
        if 'json' not in f:
            print(f)
            dataFromFile = convertStringToJson(str(getStringFromFile(f)))
            # print(dataFromFile)
