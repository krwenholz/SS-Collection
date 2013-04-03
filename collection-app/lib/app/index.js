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
    page.render('list-building', { bins: bins, page_name: 'Buildings'} );
})

// A route for the floors/locations in a building
get('/buildings-:building?', function(page, model, params) {
    var building = params.building;
    building || (building = 'null');

    var buildingBins = null;
    for (build in bins){
        if (bins[build]['title']==building) {
            buildingBins = bins[build];
        }
    }

    page.render('list-floor', 
        { building: buildingBins, 
            page_name: 'Locations for '+buildingBins['title']} );
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

    var loc = null;
    for (build in bins){
        // for every building
        if (bins[build]['title']==buildName) {
            for (fl in bins[build]['floors']) {
                // for every floor
                if (bins[build]['floors'][fl]['title'] == floorName) {
                    for(ll in bins[build]['floors'][fl]['locations']) {
                        // for every location
                        if(bins[build]['floors'][fl]['locations'][ll]['title']
                            == locName) {
                            loc = bins[build]['floors'][fl]['locations'][ll];
                            break;
                        }
                    }
                }
            }
        }
    }
	

    // Here comes the magic for our persistence and data sharing
    var pathName = buildName +'.'+ floorName +'.'+ loc['title'];
    model.set('pathName', pathName);
    model.subscribe('bins.' + pathName, function(err, curLoc){
        // Need underscore to keep it private for ref
    	model.ref('_bins', curLoc);
    	
        // Now define the default bin states. Bins take on values of 'not-full',
        // 'full', and 'emptied'.
        var binActivity = [];
        var basicBins = loc['bins'].map(function(binName){
            var theTime = new Date();
            return {'bName': binName, 
                    'activity':[{'time': theTime, 'activity': 'not-full'}]};
        });

        // Sets the value if it hasn't already been defined (should only happen on
        // first run)
        basicBins.forEach(function(oneBin) {
            curLoc.setNull(pathName +'.'+ oneBin['bName'], oneBin['activity']);
        });

        page.render('list-bins', 
                    { buildingName : buildName, 
                      floorName : floorName, 
                      locationName: loc['title'],
                      binNames: loc['bins'], 
                      page_name: 'bins for '+buildName+' in '+floorName+' at '+
                        loc['title']});
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
        model.unshift(bin.path(), {'time': theTime, 'activity': 'emptied'});
    }

    // "full"s a bin by adding a new event to the activity history
    exports.fullBin= function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now emptied bin
        var theTime = new Date();
        model.unshift(bin.path(), {'time': theTime, 'activity': 'full'});
    }

    // "not-full"s a bin by adding a new event to the activity history
    exports.notFullBin= function(e, el, next) {
        // Grab context nearest to this bin
        bin = model.at(el);
        // Add a new entry for the now emptied bin
        var theTime = new Date();
        model.unshift(bin.path(), {'time': theTime, 'activity': 'not-full'});
    }


    // EXAMPLES FROM OLD CODE
//  var timer
//
//  // Functions on the app can be bound to DOM events using the "x-bind"
//  // attribute in a template.
//  this.stop = function() {
//    // Any path name that starts with an underscore is private to the current
//    // client. Nothing set under a private path is synced back to the server.
//    model.set('_stopped', true)
//    clearInterval(timer)
//  }
//
//  this.start = function() {
//    model.set('_stopped', false)
//    timer = setInterval(function() {
//      model.set('_timer', (((+new Date()) - start) / 1000).toFixed(1))
//    }, 100)
//  }
//  this.start()
//    
})

// LOGIC CODE //

bins = [{'title': 'WSC', 
                floors: [{'title':'Basement', locations:[
                            {'title':'Shipping-Receiving', bins:[
                                'Toter','Glass','Cardboard']}, 
                            {'title':'Mail Room', bins:[
                                'Toter', 'Cardboard']},
                            {'title':'Cellar', bins:[
                                'Toter 1', 'Toter 2']}]},
                         {'title':'1st Floor', locations:[
                             {'title':'Diversions', bins:[
                                 'Toter']}]},
                         {'title':'2nd Floor', locations:[
                             {'title':'Elevator', bins:[
                                 'Toter', 'Glass']},
                             {'title':'ASUPS', bins:[
                                 'Toter']}]}]},
        {'title': 'Jones',
                  floors: [{'title':'Basement', locations:[
                              {'title':'Recycling Station', bins:[
                                  'Toter 1', 'Toter 2', 'Toter 3',
                                  'Toter 4', 'Cardboard', 'Glass', ]}]},
                           {'title':'1st Floor', locations:[
                               {'title':'Staff Kitchennette', bins:[
                                   'Glass']}]},
                           {'title':'2nd Floor', locations:[
                               {'title':'Hallway-North', bins:[
                                   'Toter 1', 'Toter 2']},
                               {'title':'Hallway-South', bins:[
                                   'Toter 1', 'Glass']}]}]}
]
