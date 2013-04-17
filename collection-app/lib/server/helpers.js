//Helper function to replace underscores with spaces (used for building names)
view.fn('underToSpace', function(value){
    return value && value.replace(/_/g, ' ');
});

view.fn('dashToSlash', function(value){
    return value && value.relace(/-/g, '/');
});
