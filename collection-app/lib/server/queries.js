// AWESOME QUERY STUFF //
module.exports = function(store) {
    return store.query.expose('bin_def', 'forBuilding', function(building) {
        return this.where('Building').equals(building);
    });

    return store.query.expose('bin_def', 'forFloor', function(building, floor) {
        return this.where('Building').equals(building);
    });

    return store.query.expose('bin_def', 'forLocation', 
            function(building, floor, location) {
                return this.where('Building').equals(building);
    });

};

