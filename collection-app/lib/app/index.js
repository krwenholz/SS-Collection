var derby = require('derby')
  , app = derby.createApp(module)
  , get = app.get
  , view = app.view
  , ready = app.ready
  , start = +new Date()

derby.use(require('../../ui'))

//Example query motif to get the last time a bin was emptied
//THIS ISN'T A WORKING EXAMPLE AT THIS POINT. JUST ILLUSTRATING HOW WE MIGHT BUILD OUR QUERIES

/*store.query.expose('list-floor', 'lastEmptied', function (bin) { //Expose query syntax: .expose(namespace, motifName, fn) 
	return this
		.where('binID').equals(bin) //Get only the bin you're interested in
		.sort('emptyDates','desc') //Sort the results in descending order by the dates it was emptied
		.limit(1); //Only get the last time it was emptied
});*/

//We could now call this query in the app by doing something like this:
/*var lastEmptied = model.query('list-floor').lastEmptied(1234);*/


// ROUTES //

// Derby routes can be rendered on the client and the server
get('/', function(page, model, params) {
  page.render('home', {page_name: 'Get Started'})
})

// A route for the building select view
get('/buildings', function(page, model, params) {
    buildings = model.query("bin_def").forBuilding('WSC');
    buildingNames = model.query('bin_def').onlyBuildings();
    model.subscribe('bins.*', buildings, buildingNames, function(err, builds, builds1, builds2) {
        allBuildings = builds2.get();
        buildingNames = Array();
        for(var i=0; i<allBuildings.length; i++){
            if(buildingNames.indexOf(allBuildings[i].Building) < 0){
                buildingNames.push(allBuildings[i].Building);
            }
        }
        page.render('list-building', { buildings: buildingNames, page_name: 'Buildings'} );
    });
})

// A route for the floors/locations in a building
get('/buildings-:building?', function(page, model, params) {
    var building = params.building;
    building || (building = 'null');

    // Grab all bin_defs for this building
    byBuilding = 
        model.query('bin_def').forBuilding(building);

    model.subscribe(byBuilding, function(err, buildingBins) {
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
        model.query('bin_def').forBuilding(buildName).forFloor(floorName)
            .forLocation(locName);

    // Here comes the magic for our persistence and data sharing
    var pathName = buildName +'.'+ floorName +'.'+ locName;
    model.subscribe('bins.' + pathName, locationQuery, 
        function(err, curLoc, locDef){
        // Need underscore to keep it private for ref
    	model.ref('_bins', curLoc);
    	
        // Grab the bin names
        var binNames = locDef.get().map(function(bin) {
            return bin['Description'];
        });

        // Now define the default bin states. Bins take on values of 'not-full',
        // 'full', and 'emptied'.
        var basicBins = binNames.map(function(binName){
            var theTime = new Date();
            return {'bName': binName, 
                    'activity':[{'time': theTime, 'activity': 'not-full'}]};
        });

        // Sets the value if it hasn't already been defined (should only happen on
        // first run)
        basicBins.forEach(function(oneBin) {
            curLoc.setNull(oneBin['bName'], oneBin['activity']);
        });

        page.render('list-bins', 
                    { buildingName : buildName, 
                      floorName : floorName, 
                      locationName: locName,
                      binNames: binNames, 
                      page_name: 'bins for '+buildName+' in '+floorName+' at '+
                        locName});
	});
})


// CONTROLLER FUNCTIONS //

ready(function(model) {

    // "emptied"s a bin by adding a new event to the activity history
    exports.emptiedBin = function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now emptied bin
        var theTime = new Date();
        bin.unshift({'time': theTime, 'activity': 'emptied'});
    }

    // "full"s a bin by adding a new event to the activity history
    exports.fullBin= function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now emptied bin
        var theTime = new Date();
        bin.unshift({'time': theTime, 'activity': 'full'});
    }

    // "not-full"s a bin by adding a new event to the activity history
    exports.notFullBin= function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now emptied bin
        var theTime = new Date();
        bin.unshift({'time': theTime, 'activity': 'not-full'});
    }
});

// LOGIC CODE //

