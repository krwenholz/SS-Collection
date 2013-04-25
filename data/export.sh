#! /bin/sh

mongoexport --db ss-collection --collection bins --jsonArray > export.txt

python exportparse.py export.txt
