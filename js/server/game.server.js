g               = require( __base + 'js/common/game.globals.js' ),
f               = require( __base + 'js/common/game.functions.js' ),
game_core       = require( __base + 'js/common/game.core.js' ),
game_avatar     = require( __base + 'js/common/game.avatar.js' );
game_weapon     = require( __base + 'js/common/game.weapon.js' );
game_particle   = require( __base + 'js/common/game.particle.js' );

var UUID        = require( 'node-uuid' ),
    MainLoop    = require( 'mainloop.js' ),

    verbose     = true;

var game_server = module.exports = {

    core: new game_core.game_core(),
    players: {},

    inputs: {},

};

game_server.log = function( message ) {

    if ( verbose )
        console.log( 'Server\t:: ' + message );

};

game_server.start = function() {

    MainLoop.setBegin( game_server.begin )
            .setUpdate( game_server.update )
            .setDraw( game_server.draw )
            .start();
    
    game_server.log( 'Server startup complete!' );
};

game_server.begin = function( timestamp, delta ) {

    // Start time of the frame
    game_server.server_time = timestamp;

    // Handle user inputs since last frame
    for ( var player_id in game_server.inputs ) {

        var input_vector = game_server.core.process_inputs( timestamp, player_id, game_server.inputs[player_id] );

        delete game_server.inputs[player_id];

    }

};

game_server.update = function( delta ) {

    // Update the world
    game_server.core.update( delta );

};

game_server.draw = function() {

    // Send world state to each connected client
    world_snapshot = game_server.core.world_snapshot();

    for ( var player_id in game_server.players )
        game_server.players[player_id].emit( 'serverupdate', world_snapshot );

};



game_server.join = function( player ) {
    
    player.game_id = UUID();

    game_server.log( 'Player ' + player.game_id + ' joined the server.' );

    game_server.players[player.game_id] = player;

    game_server.core.add_avatar( player.game_id );

    // Tell the player they connected, giving them their id
    player.emit( 'connected', { id: player.game_id } );

};

game_server.leave = function( player ) {

    game_server.log( 'Player ' + player.game_id + ' left the server' );

    delete game_server.players[player.game_id];

    game_server.core.remove_avatar( player.game_id );

};

game_server.on_input = function( player, message_parts ) {

    var input_commands = message_parts[1].split( '$' );
    var input_time = message_parts[2];
    var input_seq = message_parts[3];
    
    if ( !game_server.inputs[player.game_id] )
        game_server.inputs[player.game_id] = [];

    Array.prototype.push.apply( game_server.inputs[player.game_id], input_commands );

};

game_server.on_message = function( player, message ) {
    
    var message_parts = message.split( '#' );

    var message_type = message_parts[0];

    switch ( message_type ) {

        case 'i':
            game_server.on_input( player, message_parts );
            break;

    }

};
