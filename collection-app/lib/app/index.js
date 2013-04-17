var derby = require('derby')
  , app = derby.createApp(module)
  , get = app.get
  , view = app.view
  , ready = app.ready

derby.use(require('../../ui'))

// ROUTES //

// Derby routes can be rendered on the client and the server
get('/', function(page, model, params) {
  page.render('home', {page_name: 'Get Started'})
})

// A route for the building select view
get('/buildings', function(page, model, params) {
    var buildingNames = model.query('bin_defs').onlyBuildings();
    model.fetch(buildingNames, function(err, buildNames) {
        allBuildings = buildNames.get();
        bNames = Array();
        for(var i=0; i<allBuildings.length; i++){
            if(bNames.indexOf(allBuildings[i].Building) < 0){
                bNames.push(allBuildings[i].Building);
            }
        }
        
        // TODO: Why isn't this sorting it?!
        bNames = bNames.sort(function(a, b) {
            if (a.floorName < b.floorName)
                 return -1;
            if (a.floorName > b.floorName)
                 return 1;
            // a must be equal to b
            return 0;
        });
        page.render('list-building', { buildings: bNames, page_name: 'Buildings'});
    });
})

//A route for viewing bins which are currently full or haven't been checked in a while
//Requires queries which require fully-qualified bins collection. Commenting out until this change is made
/*get('bin-status', function(page, model, params){
    fullBins = model.query('bins').onlyFull();
    numDays = 2; //number of days that need to pass for data bin to be "old"
    lonelyBins = model.query('bins').olderThan(numDays);
    model.subscribe(fullBins, lonelyBins, function(err, full, lonely){
        allFull = full.get();
        allLonely = lonely.get();
        page.render('list-bin-status', {fulls: allFull, lonelys: allLonely, daysOld: numDays, page_name: 'Bins To Check'});
    });
});*/

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
            .forLocation(locName).recAndDesc();

    // Here comes the magic for our persistence and data sharing
    // We use the .*.recent to only get the recent stuff (what we want)
    model.subscribe(binQuery, locationQuery, 
        function(err, curBins, locDef){
        // Need underscore to keep it private for ref
    	model.ref('_bins', curBins);
        console.log(curBins.get());
    	
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

