// AWESOME QUERY STUFF //
module.exports = function(store) {
    store.query.expose('bin_def', 'forBuilding', function(building) {
        return this.where('Building').equals(building);
    });

    store.query.expose('bin_def', 'forFloor', function(floor) {
        return this.where('Floor').equals(floor);
    });

    store.query.expose('bin_def', 'forLocation', function(loc) {
        return this.where('Location').equals(loc);
    });

    store.query.expose('bin_def', 'onlyBuildings', function(){
        return this.only('Building');
    });

    store.query.expose('bin_def', 'onlyBins', function(){
        return this.only('Description');
    });

};

