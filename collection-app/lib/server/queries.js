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

    store.query.expose('bin_def', 'withOnly', function(limit) {
        return this.only(limit);
    });

    // FIXME: I'm super broken and don't do what I should
    store.query.expose('bin_def', 'locationsForBuilding', function(building) {
        building = this.where('Building').equals(building);
        return building;
    });

};

