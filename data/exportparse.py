#!/usr/bin/env python

import json, sys, xlwt

def main():
    try:
        file = sys.argv[1]
    except:
        print "Expoort Parse:"
        print "Translates json data from mongo to an excel file."
        print "usage:\texportparse.py [JSON_FILE]"
        sys.exit(-1)
    
    jsonFile = open(file)
    rawJson = [line for line in jsonFile]
    jsonFile.close()
    
    parsed = json.loads(rawJson[0])
    
    data = {}
    for building in parsed:
        name = building['_id']
        building.pop('_id',name)
        data[name] = building
    
    activity = []
    activity.append([u'Building',u'Floor',u'Location',u'Container', u'Activity',u'Time'])
    for building in data.keys():
        for floor in data[building].keys():
            for location in data[building][floor].keys():
                for container in data[building][floor][location].keys():
                    for datum in data[building][floor][location][container]['hist']:
                        row = [building,floor,location,container,datum['activity'],datum['time']]
                        row = [clean(item) for item in row]
                        activity.append(row)
                
                
    workbook = xlwt.Workbook(encoding = 'ascii')
    worksheet = workbook.add_sheet('Activity')
    for row in idx(activity):
        for column in idx(activity[row]):
            worksheet.write(row, column, label=activity[row][column])

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
        print item
    
def pretty( data ):
    return json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))


    
        
if __name__ == "__main__":
    main()
