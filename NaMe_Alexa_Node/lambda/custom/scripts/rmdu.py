'''SOURCE : https://stackoverflow.com/questions/46616584/python-remove-duplicate-entries-from-csv-file'''

import csv

inFile = 'firstnames/CSV_Database_of_First_Names.csv'
outFile = 'firstnames/CSV_Database_of_First_Names_no_dupes.csv'

with open(inFile, 'rU') as in_file, open(outFile, 'w') as out_file:
    reader = csv.reader(in_file)
    writer = csv.writer(out_file)
    seen = set() # set for fast O(1) amortized lookup
    for row in reader:
        row = tuple(row)
        if row in seen: continue # skip duplicate
        seen.add(row)
        writer.writerow(row)
