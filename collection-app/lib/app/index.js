var derby = require('derby')
  , app = derby.createApp(module)
  , get = app.get
  , view = app.view
  , ready = app.ready

derby.use(require('../../ui'))

// HELPER FUNCTIONS //

//Converts uderscores to spaces.
//Called from within a view
view.fn('underToSpace', function(value){
    return value && value.replace(/_/g, ' ');
});

//Parses the bin id field to generate markup with the bin's location & name.
//Called from within a view
view.fn('idToLocBinText', function(value){
    keys = value.split('#')
    return keys[2].replace(/_/g, ' ') + '<br />' + keys[3].replace(/_/g, ' ');
});

//Divides the list of buildings into 3 columns. Called from within a view
view.fn('threeColumns', function(items) {
    var bins_in_col = Math.floor(items.length/3);
    var buttons = items.map(function(ii) {
        return "<a href=\"buildings-"+ii+"\" class=\"btn btn-large btn-info\" "+
                "style=\"margin:0 15px 15px 0;\"> "+(ii && ii.replace(/_/g, ' '))+"</a>";
    });
    var divs = [[],[],[]];
    for(ii in buttons) {
        if (ii < bins_in_col) {
            divs[0].push(buttons[ii]);
        } else if (ii < bins_in_col * 2) {
            divs[1].push(buttons[ii]);
        } else {
            divs[2].push(buttons[ii]);
        }
    }

    return divs.reduce(function(out, b_list) {
        return out + "<div class=\"five columns clearfix\">"+
                    "<div class=\"buildbuttons\">"+
                    b_list.reduce(function(out, button) 
                        { return out + button + "</br>"; }, "</br>") +
                    "</div>"+
                    "</div>";
    }, "");
});

//Breaks down a list of bins in a way which allows them to be grouped by building and floor
//TODO: Rename the function to something that makes a bit more sense...
var binBreakdown = function(bins){
    uniqueBuilds = Array();
    uniqueFloors = Array();
    uniqueLocs = Array();
    for(var i=0; i<bins.length; i++){
        if(uniqueBuilds.indexOf(bins[i].Building) < 0){
            uniqueBuilds.push(bins[i].Building);
        }
        if(uniqueFloors.indexOf(bins[i].Floor) < 0){
            uniqueFloors.push(bins[i].Floor);
        }
        if(uniqueLocs.indexOf(bins[i].Location) < 0){
            uniqueLocs.push(bins[i].Location);
        }
    }
    data = [];
    for(var i=0; i<uniqueBuilds.length; i++){
        node = {}
        node['Building'] = uniqueBuilds[i];
        node['Floors'] = [];
        for(var j=0; j<uniqueFloors.length; j++){
            node2 = {}
            fBins = bins.filter(function(bin){return (bin.Building == uniqueBuilds[i] && bin.Floor == uniqueFloors[j])});
            if(fBins.length > 0){
                //console.log(fBins);
                //console.log(fBins.length);
                node2['Floor'] = uniqueFloors[j];
                node2['Bins'] = fBins;
                node['Floors'].push(node2);
            }
        }
        data.push(node);
    }
    return data;
}

//Initialize jQuery UI tooltips when the about view is rendered.
//Normally done with jQuery on page load, but this doesn't fit with the way Derby loads pages/views
app.on('render:about', function(ctx) {
  $("[data-toggle=tooltip]").tooltip("show");
});

// ROUTES //

// Derby routes can be rendered on the client and the server
get('/', function(page, model, params) {
  page.render('home', {page_name: 'Get Started'})
})

//A route for the 'About this App' view
get('/about', function(page, model, params){
  page.render('about', {page_name: 'Using this App'});
});

// A route for the building select view
get('/buildings', function(page, model, params) {
    var buildingNames = model.query('bin_defs').onlyBuildings();
    model.fetch(buildingNames, function(err, buildNames) {
        var allBuildings = buildNames.get().sort();
        var bNames = Array();
        for(var i=0; i<allBuildings.length; i++){
            if(bNames.indexOf(allBuildings[i].Building) < 0){
                bNames.push(allBuildings[i].Building);
            }
        }

        bNames.sort();
        page.render('list-building', 
            { buildings: bNames, page_name: 'Buildings'} );
    });
})

// A route for the floors/locations in a building
get('/buildings-:building?', function(page, model, params) {
    var building = params.building;
    building || (building = 'null');

    // Grab all bin_defss for this building
    byBuilding = 
        model.query('bin_defs').forBuilding(building);

    model.fetch(byBuilding, function(err, buildingBins) {
        // Grab the building's locations and floors (as objects)
        var locObj = buildingBins.get().reduce(function(lfs, bin) {
            if (lfs[bin.Floor] == undefined) {
                lfs[bin.Floor] = [bin.Location];
            } else {
                lfs[bin.Floor].push(bin.Location);
            }
            return lfs;
        }, {});

        // Now make it iterable
        var locsAndFloors = [];
        for (ii in locObj) {
            var locats = [];
            //uniquness
            for(var jj in locObj[ii]) {
                if(locats.indexOf(locObj[ii][jj]) == -1) {
                    locats.push(locObj[ii][jj]);
                }
            }

            locsAndFloors.push({floorName: ii, locs: locats});
        }

        // Sort them
        locsAndFloors = locsAndFloors.sort(function(a, b) {
            if (a.floorName < b.floorName)
                 return -1;
            if (a.floorName > b.floorName)
                 return 1;
            // a must be equal to b
            return 0;
        });

        page.render('list-floor', 
            { locsAndFs: locsAndFloors, 
                buildingName: building,
                page_name: 'Locations for '+building} );
    });
})

// View the bins at a location
get('/buildings-:building?/floor-:floor?/location-:loc?', 
        function(page, model, params) {
    var buildName = params.building;
    buildName || (buildName = 'null');
    
    var floorName = params.floor;
    floorName || (floorName = 'null');
 
    var locName = params.loc;
    locName || (locName = 'null');

    locationQuery = 
        model.query('bin_defs').forBuilding(buildName).forFloor(floorName)
            .forLocation(locName);

    // TODO: Subscription isn't working.  This sucks.
    binQuery = 
        model.query('bins').forBuilding(buildName).forFloor(floorName)
            .forLocation(locName).noHist();

    model.fetch(locationQuery, function(err, locDef) {
        // Here comes the magic for our persistence and data sharing
        // We use the .*.recent to only get the recent stuff (what we want)
        model.subscribe(binQuery, function(err, curBins){
            // Need underscore to keep it private for ref
        	model.ref('_bins', curBins);
            //console.log("RESULTS OF THE CUR_BINS QUERY:");
            //console.log(curBins.get());
        	
            // Grab the bin names and initialize the bin in the db
            var binNames = locDef.get().map(function(bin) {
                var binName = bin['Description'];
                model.setNull(
                    // The complex name is a UID
                    'bins.'+buildName +'#'+ floorName +'#'+ locName +'#'+ binName,
                    // Initial data is clean and simple
                    {Building: buildName, Floor: floorName, Location: locName,
                        Description: binName, Hist: [], Recent: null});
                return binName;
            });

            page.render('list-bins', 
                        { buildingName : buildName, 
                          floorName : floorName, 
                          locationName: locName,
                          page_name: 'bins for '+buildName+' in '+floorName+' at '+
                            locName});
	    })
    });
})

//A route for viewing bins which are currently full or haven't been checked in a while
get('/bin-status', function(page, model, params){
    fullBins = model.query('bins').onlyFull().noHist();
    numDays = 2; //number of days that need to pass for data bin to be "old"
    lonelyBins = model.query('bins').olderThan(numDays).noHist();
    model.subscribe(fullBins, lonelyBins, function(err, full, lonely){
        //Reactive function that is evaluated every time the results of the full bins query change.
        //Parses bin data for use in the bin status view
        model.fn('_full', full, function(full){
            return binBreakdown(full.slice());
        });

        //Reactive function that is evaluated every time the results of the lonley bins query change.
        //Parses bin data for use in the bin status view
        model.fn('_lonely', lonely, function(lonely){
            return binBreakdown(lonely.slice());
        });

    page.render('list-bin-status', 
            {daysOld: numDays, page_name: 'Bins To Check'});
    });
});


// CONTROLLER FUNCTIONS //

ready(function(model) {

    // "emptied"s a bin by adding a new event to the activity history
    exports.emptiedBin = function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now emptied bin
        var theTime = new Date();
        var recent = {'time': theTime, 'activity': 'emptied'};
        bin.push('Hist', recent);
        bin.set('Recent', recent);
    }

    // "full"s a bin by adding a new event to the activity history
    exports.fullBin= function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now full bin
        var theTime = new Date();
        var recent = {'time': theTime, 'activity': 'full'};
        bin.push('Hist', recent);
        bin.set('Recent', recent);
    }

    // "not-full"s a bin by adding a new event to the activity history
    exports.notFullBin= function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now not-full bin
        var theTime = new Date();
        var recent = {'time': theTime, 'activity': 'not-full'};
        bin.push('Hist', recent);
        bin.set('Recent', recent);
    }
});

