// AWESOME QUERY STUFF //
module.exports = function(store) {
    store.query.expose('bin_def', 'forBuilding', function(building) {
        return this.where('Building').equals(building);
    });

    store.query.expose('bin_def', 'forFloor', function(building, floor) {
        return this.where('Building').equals(building);
    });

    store.query.expose('bin_def', 'forLocation', 
            function(building, floor, location) {
                return this.where('Building').equals(building);
    });

    store.query.expose('bin_def', 'uniqueBuildings', function(){
        return this.only('Building');
    })

};

