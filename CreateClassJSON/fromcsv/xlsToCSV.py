import xlrd
import csv

wb = xlrd.open_workbook('schedule.xls')
sh = wb.sheet_by_name('Sheet1')
your_csv_file = open('schedule.csv', 'wb')
wr = csv.writer(your_csv_file, delimiter='|', quotechar = '^', quoting=csv.QUOTE_MINIMAL, lineterminator='\n')

def encodeIntoUTF8(item):
	#Could use normal s.encode("utf-8") but if is a non-string (floats are common in this xls), fails
	if isinstance(s, basestring):
		return item.encode("utf-8")

	# Will work without this but allows diffs to make sure is exactly equivalent to unoconv's output easier
	elif isinstance(s, float) and s.is_integer():
		return int(s)
	else:
		return s

for rownum in xrange(sh.nrows):
		#print sh.row_values(rownum)
		wr.writerow([encodeIntoUTF8(s) for s in sh.row_values(rownum)])

your_csv_file.close()


