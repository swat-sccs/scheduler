#!/bin/sh
pdftotext -x 33 -y 60 -W 51 -H 513 -layout -f 1 course_schedule_current.pdf  allCols/1.txt
pdftotext -x 85 -y 60 -W 27 -H 513 -layout -f 1 course_schedule_current.pdf allCols/2.txt
pdftotext -x 112 -y 60 -W 30 -H 513 -layout -f 1 course_schedule_current.pdf allCols/3.txt
pdftotext -x 142 -y 60 -W 30 -H 513 -layout -f 1 course_schedule_current.pdf allCols/4.txt
pdftotext -x 172 -y 60 -W 120 -H 513 -layout -f 1 course_schedule_current.pdf allCols/5.txt
pdftotext -x 293 -y 60 -W 30 -H 513 -layout -f 1 course_schedule_current.pdf allCols/6.txt
pdftotext -x 322 -y 60 -W 35 -H 513 -layout -f 1 course_schedule_current.pdf allCols/7.txt
pdftotext -x 357 -y 60 -W 52 -H 513 -layout -f 1 course_schedule_current.pdf allCols/8.txt
pdftotext -x 409 -y 60 -W 100 -H 513 -layout -f 1 course_schedule_current.pdf allCols/9.txt
pdftotext -x 509 -y 60 -W 70 -H 513 -layout -f 1 course_schedule_current.pdf allCols/10.txt
pdftotext -x 579 -y 60 -W 30 -H 513 -layout -f 1 course_schedule_current.pdf allCols/11.txt
pdftotext -x 609 -y 60 -W 80 -H 513 -layout -f 1 course_schedule_current.pdf allCols/12.txt
pdftotext -x 689 -y 60 -W 70 -H 513 -layout -f 1 course_schedule_current.pdf allCols/13.txt
sed -i 's/\f/**NEWPAGE**\n\n/' allCols/*
