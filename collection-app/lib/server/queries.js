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

    //Returns bins where the most recent activity == full
    //Assumes the new fully-qualified structure for bins, which doesn't exist yet (commenting out for now)
    /*store.query.expose('bins', 'onlyFull', function(){
        return this.where('data.recent.activity').equals('full');
    });*/

    //Returns bins where the most recent activity time is less than or equal to the number of specified days ago
    //Assumes the new fully-qualified structure for bins, which doesn't exist yet (commenting out for now)
    /*store.query.expose('bins', 'onlyOld', function(numDays){
        var day = 24 * 3600 * 1000;
        return this.where('data.recent.time').lte(new Date(new Date() - numDays * day));
    });*/
};

