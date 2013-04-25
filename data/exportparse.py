#!/usr/bin/env python

import json, sys, xlwt

def main():
    try:
        file = sys.argv[1]
    except:
        print 'Expoort Parse:'
        print 'Translates json data from mongo to an excel file.'
        print 'usage:\texportparse.py [JSON_FILE]'
        sys.exit(-1)
    
    jsonFile = open(file)
    rawJson = [line for line in jsonFile]
    jsonFile.close()
    
    parsed = json.loads(rawJson[0])

    data = [(u'Building',u'Floor',u'Location',u'Description', u'Action',u'Time')]
    for bin in parsed:
        building = bin['Building']
        floor = bin['Floor']
        location = bin['Location']
        description = bin['Description']
        activity = bin['Hist']
        for datum in activity:
            time = datum['time']
            action = datum['activity']
            data.append((building,floor,location,description,action,time))
            
    workbook = xlwt.Workbook(encoding = 'ascii')
    worksheet = workbook.add_sheet('Activity')
    for row in idx(data):
        for column in idx(data[row]):
            string = clean(data[row][column])
            worksheet.write(row, column, label=string)
    
    workbook.save('activity.xls')
    
    # print pretty(parsed)
def clean( string ):
    if string == 'not-full':
        return string
    translate = { '_':' ', '-':'/' }
    human = []
    for char in string:
        human.append(translate.get(char,char))
    return ''.join(human)

def idx( iterable ):
    return range(0,len(iterable)-1) 
                    
def show( list ):
    for item in list:
        print len(item), item
    
def pretty( data ):
    return json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))


    
        
if __name__ == '__main__':
    main()
