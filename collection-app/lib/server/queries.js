// AWESOME QUERY STUFF //
module.exports = function(store) {
    store.query.expose('bin_defs', 'forBuilding', function(building) {
        return this.where('Building').equals(building);
    });

    store.query.expose('bin_defs', 'forFloor', function(floor) {
        return this.where('Floor').equals(floor);
    });

    store.query.expose('bin_defs', 'forLocation', function(loc) {
        return this.where('Location').equals(loc);
    });

    store.query.expose('bin_defs', 'onlyBuildings', function(){
        return this.only('Building');
    });

    store.query.expose('bins', 'forBuilding', function(building) {
        return this.where('Building').equals(building);
    });

    store.query.expose('bins', 'forFloor', function(floor) {
        return this.where('Floor').equals(floor);
    });

    store.query.expose('bins', 'forLocation', function(loc) {
        return this.where('Location').equals(loc);//.except('Hist');
    });

    store.query.expose('bins', 'noHist', function(){
        return this.except('Hist');
    });

    //Returns bins where the most recent activity == full
    store.query.expose('bins', 'onlyFull', function(){
        return this.where('Recent.activity').equals('full').sort('Building', 'asc', 'Floor','asc', 'Location', 'asc');
    });

    //Returns bins where the most recent activity time is less than or equal to the number of specified days ago
    store.query.expose('bins', 'olderThan', function(numDays){
        var day = 24 * 3600 * 1000;
        return this.where('Recent.time').
            lte(new Date(new Date() - numDays * day)).sort('Building', 'asc', 'Floor','asc', 'Location', 'asc');
    });
};

