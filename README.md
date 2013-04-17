SS-Collection
=============

Handling the UPS ACM's project for a Sustainability Services application, 
doing awesome "things". . . .

# Setup
* Clone using 
    git clone https://github.com/krwenholz/SS-Collection
* cd in there
* collection-app is the app directory
* You can install all dependencies with 
    npm install
* To set up the database (on an empty mongodb):
    * Run "binparse.py locations.xlsx"
    * The fresh file generated is a json representation of the bin definitions.
    * Run "mongoimport --db ss-collection --collection bin_defs --file json_bins.txt"
    * If the above command worked, you should have many bins in your mongodb.


Now you're ready to help out!

## Links we may like
[MySQL to Excel](http://www.automateexcel.com/2005/11/01/connect_excel_to_mysql_database/)
