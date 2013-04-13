import xlrd, json, sys
from string import maketrans

def main():
    try:
        file = sys.argv[1]
    except:
        print "usage:\tbinparse.py [SPREADSHEET]"
        sys.exit(-1)
    
    book = xlrd.open_workbook(file)
    sheet = book.sheet_by_index(0)
    
    cans = []
    
    for rownum in range(sheet.nrows):
        cans.append(sheet.row_values(rownum))
    
    # convert unicode to ascii
    cans = [[item.encode('ascii', 'replace') for item in can] for can in cans]
    
    cans.pop(0) # remove the first row with column labels
    cans = [can[0:4] for can in cans] # trim empty indices
    
    fixBuildings(cans)
    
    # remove lines that dont represent a can
    cans = [can for can in cans if not isBuildingNameRow(can)]
    
    fillDown(cans) # fill out all the indices of the sheet
    
    colunmTitles = ['Building', 'Floor', 'Location', 'Desctription']
    labeledCans = []
    for can in cans:
        labeledCans.append(labelList(can, colunmTitles))
    
    show(labeledCans)

# make the building labels conform to the other label's pattern
def fixBuildings( sheet ):
    building = ''
    for row in sheet:
        if row[0] is not '':
            building = row[0]
        else:
            row[0] = building
            building = ''

def fillDown( sheet ):
    label = ['','','','']
    for row in sheet:
        for idx in range(0,len(row)):
            if row[idx] is not '':
                label[idx] = row[idx]
            else:
                row[idx] = label[idx]

def isBuildingNameRow( row ):
    isRow = row[0] is not '' and row[1] is '' and row[2] is '' and row[3] is ''
    return isRow

def labelList( list, labels ):
    return {label: item for (item, label) in zip(list, labels)}
    #return list

def show( sheet ):
    print json.dumps(sheet, sort_keys=True, indent=4, separators=(',', ': '))


if __name__ == "__main__":
    main()