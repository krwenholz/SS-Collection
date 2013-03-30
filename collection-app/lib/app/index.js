var derby = require('derby')
  , app = derby.createApp(module)
  , get = app.get
  , view = app.view
  , ready = app.ready
  , start = +new Date()

derby.use(require('../../ui'))


// ROUTES //

// Derby routes can be rendered on the client and the server
get('/', function(page, model, params) {

  // Subscribes the model to any updates on this room's object. Calls back
  // with a scoped model equivalent to:
  //   room = model.at('rooms.' + roomName)
  page.render('home', {page_name: 'Get Started'})
//  model.subscribe('rooms.' + roomName, function(err, room) {
//    model.ref('_room', room)
//
//    // setNull will set a value if the object is currently null or undefined
//    room.setNull('welcome', 'Welcome to ' + roomName + '!')
//
//    room.incr('visits')
//
//    // This value is set for when the page initially renders
//    model.set('_timer', '0.0')
//    // Reset the counter when visiting a new route client-side
//    start = +new Date()
//
//    // Render will use the model data as well as an optional context object
//    page.render({
//      bins: bins
//    , roomName: roomName
//    , randomUrl: parseInt(Math.random() * 1e9).toString(36)
//    })
//  })
})

// A route for the buildings view
get('/buildings', function(page, model, params) {
    page.render('buildings', { bins: bins, page_name: 'Buildings'} );
})

// A route for the locations view
get('/locations/:building?', function(page, model, params) {
    var building = params.roomName;
    building || (building = 'null');

    var buildingBins = null;
    for (build in bins){
        if (build['title']==building) {
            buildingBins = build;
        }
    }
    page.render('locations', { bins: build, page_name: 'Locations'} );
})



// CONTROLLER FUNCTIONS //

ready(function(model) {

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
bins = [{title: 'WSC', 
                floors: [{title:'Basement', locations:[
                            {title:'Shipping/Receiving', bins:[
                                'Toter','Glass','Cardboard']}, 
                            {title:'Mail Room', bins:[
                                'Toter', 'Cardboard']},
                            {title:'Cellar', bins:[
                                'Toter 1', 'Toter 2']}]},
                         {title:'1st Floor', locations:[
                             {title:'Diversions', bins:[
                                 'Toter']}]},
                         {title:'2nd Floor', locations:[
                             {title:'Elevator', bins:[
                                 'Toter', 'Glass']},
                             {title:'ASUPS', bins:[
                                 'Toter']}]}]},
        {title: 'Jones',
                  floors: [{title:'Basement', locations:[
                              {title:'Recycling Station', bins:[
                                  'Toter 1', 'Toter 2', 'Toter 3',
                                  'Toter 4', 'Cardboard', 'Glass', ]}]},
                           {title:'1st Floor', locations:[
                               {title:'Staff Kitchennette', bins:[
                                   'Glass']}]},
                           {title:'2nd Floor', locations:[
                               {title:'Hallway-North', bins:[
                                   'Toter 1', 'Toter 2']},
                               {title:'Hallway-South', bins:[
                                   'Toter 1', 'Glass']}]}]}
]
