#!/bin/bash
# In LOffice, find , and replace with ; to not mess with csv. Eventually implement proper csv
# -e ... from the man page. 124 = ascii "|" as the delim (hopefully no conflicts). If there is a conflict, it will 'quote' it but use 94 = ascii "^". So I check if that exists (in makeJSON), in which case there is a conflict with "|" so needs to be manually fixed (assuming to "^" conflict).
#TODO can add true csv parsing, would be easy with a nodejs npm but this is fast
URL=http://www.swarthmore.edu/sites/default/files/assets/documents/registrar/201704CSV.xls
wget -O schedule.tmp.xls $URL 
diff schedule.tmp.xls schedule.xls
#Needs to be right after the diff $? returns the prev command's return value
if [ $? -ne 0 ]; then
        echo "There is a new schedule"
        #So cp the newOne as a named file...
        DATE=$(date +"%Y%m%d")
        #Copy pdf for posterity and records/debugging. Seems to always be this URL?
        wget -O PREV_SCHEDULES/$DATE.pdf http://www.swarthmore.edu/sites/default/files/assets/documents/registrar/course_schedule_current.pdf

        cp schedule.tmp.xls PREV_SCHEDULES/$DATE.xls
        cp schedule.js PREV_SCHEDULES/$DATE.js

        mv schedule.tmp.xls schedule.xls

        #And make the new out.json
        unoconv -f csv -e FilterOptions=124,94,76 schedule.xls;
        ./makeJSON.js > out.json;
        #TODO Send diff to staff and/or a mailing list
else
        echo "The downloaded schedule xls is the same as prev. Ending"
        rm schedule.tmp.xls;
fi
