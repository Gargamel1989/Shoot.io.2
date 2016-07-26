g               = require( __base + 'js/common/game.globals.js' ),
f               = require( __base + 'js/common/game.functions.js' ),
game_core       = require( __base + 'js/common/game.core.js' ),
game_avatar     = require( __base + 'js/common/game.avatar.js' );
game_weapon     = require( __base + 'js/common/game.weapon.js' );
game_particle   = require( __base + 'js/common/game.particle.js' );
game_object     = require( __base + 'js/common/game.object.js' );

UUID            = require( 'node-uuid' );

var MainLoop    = require( 'mainloop.js' ),

    debug       = true,
    verbose     = true;

var game_server = module.exports = {

    core: new game_core.game_core(),
    players: {},

    inputs: {},

    game_loop_dt_begin: 0,
    game_loop_dt_update: 0,
    game_loop_dt_draw: 0,

    game_loop_updates_per_frame: 0,

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

    game_server.game_loop_updates_per_frame = 0;

    if ( debug )
        var start = new Date().getTime();

    // Start time of the frame
    game_server.server_time = timestamp;

    // Handle user inputs since last frame
    for ( var player_id in game_server.inputs ) {

        var input_vector = game_server.core.process_inputs( timestamp, player_id, game_server.inputs[player_id] );

        delete game_server.inputs[player_id];

    }

    if ( debug )
        game_server.game_loop_dt_begin = new Date().getTime() - start;

};

game_server.update = function( delta ) {

    if ( debug )
        var start = new Date().getTime();

    game_server.spawn_random_shit( delta );

    // Update the world
    game_server.core.update( delta );

    if ( debug )
        game_server.game_loop_dt_update = new Date().getTime() - start;

    game_server.game_loop_updates_per_frame++;

};

game_server.draw = function() {

    if ( debug )
        var start = new Date().getTime();

    // Send world state to each connected client
    world_snapshot = game_server.core.world_snapshot();

    if ( debug )
        world_snapshot.game_loop_debug = {
            dt_begin: game_server.game_loop_dt_begin,
            dt_update: game_server.game_loop_dt_update,
            dt_draw: game_server.game_loop_dt_draw,
            updates_per_frame: game_server.game_loop_updates_per_frame,
        };

    for ( var player_id in game_server.players )
        game_server.players[player_id].emit( 'serverupdate', world_snapshot );

    if ( debug )
        game_server.game_loop_dt_draw = new Date().getTime() - start;

};



game_server.join = function( player, nickname, color ) {

    player.game_id = UUID();

    nickname = game_server.sanitize_input( nickname );
    color = game_server.sanitize_input( color, 6 );

    if ( nickname == '' )
        nickname = random_nicknames[Math.floor( Math.random() * random_nicknames.length )];

    var extra = 0,
        unduplicated_nickname = nickname;
    while ( game_server.nickname_exists( unduplicated_nickname ) ) {

        extra++;
        unduplicated_nickname = nickname + '#' + extra;

    }

    if ( color == '' || !color.match( /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ ) )
        color = '#000000'.replace( /0/g, function() {
            return ( ~~( Math.random() * 16 ) ).toString( 16 );
        } );

    else
        color = '#' + color;

    player.nickname = unduplicated_nickname;
    player.color = color;
   
    game_server.log( 'Player ' + player.game_id + ' joined the server.' );

    game_server.players[player.game_id] = player;

    game_server.core.add_avatar( player.game_id, player.nickname, player.color );

    // Tell the player they connected, giving them their id
    player.emit( 'connected', { 
        id: player.game_id,
        nickname: player.nickname,
        color: player.color,
    } );

};

game_server.leave = function( player ) {

    game_server.log( 'Player ' + player.game_id + ' left the server' );

    delete game_server.players[player.game_id];

    game_server.core.remove_avatar( player.game_id );

};

game_server.nickname_exists = function( nickname ) {

    for ( player_id in game_server.players ) {

        if ( game_server.players[player_id].nickname == nickname )
            return true;

    }

    return false;

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

game_server.sanitize_input = function( input_string, max_length ) {

    var allowed_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_ ';
    max_length = max_length || 15;

    sanitized_string = '';

    for ( var i = 0, len = input_string.length; i < len; i++ ) {

        if ( allowed_chars.indexOf( input_string.charAt( i ) ) > -1 )
            sanitized_string += input_string.charAt( i );

        if ( sanitized_string.length >= max_length )
            break;

    }

    return sanitized_string;

};

/**
 * Item Spawn Rate:
 *
 * p: Number of players online
 * P(i, p): Chance per second of an item spawning, function of the number
 *          of items on the floor and players online
 * n_i: A per-item parameter that determines the maximum amount of items
 *      on the floor of that kind at any given time by the formula:
 *      max(I) = n_i * #players
 * i: Number of items on the floor of this type
 *
 * P(0, p) = 1
 * Exponential decline
 * P(n_i * p, p) = 0
 *
 */
var spawn_chance_per_second = function( n_i, p, i ) {

    return ( 1 / ( Math.exp( n_i * p ) - 1 ) ) * ( Math.exp( ( n_i * p ) - i ) - 1 );

};

game_server.spawn_info = {};

game_server.spawn_random_shit = function( dt ) {
    
    // Check if we spawn something this update
    var spawn_chance = game_server.core.spawn_chance * dt / 1000;

    if ( Math.random() > spawn_chance )
        return;
 
    var no_weapons = 0,
        no_ammo = 0,
        no_players = Object.keys( game_server.core.avatars ).length;

    for ( object_id in game_server.core.objects ) {

        var o = game_server.core.objects[object_id];

        if ( o.type == game_object.TYPES.handgun || o.type == game_object.TYPES.shotgun )
            no_weapons++;

        else if ( o.type == game_object.TYPES.handgun_ammo || o.type == game_object.TYPES.shotgun_ammo )
            no_ammo++;

    }

    var new_spawn,
        w = Math.random();

    // If there are less weapons on the field than there are players, we 
    // get a 70% chance of spawning a weapon
    if (  Math.random() < 0.7 && ( no_weapons < no_players || Math.random() < Math.exp( -2.3 / Math.max( 1, no_weapons - no_players ) ) ) ) {
        
        if ( w < 0.7 )
            new_spawn = new game_object.game_object( null, game_object.TYPES.handgun, { 
                x: game_server.core.world_size.width * Math.random(),
                y: game_server.core.world_size.height * Math.random(),
            } );

        else if ( w < 1 )
            new_spawn = new game_object.game_object( null, game_object.TYPES.shotgun, { 
                x: game_server.core.world_size.width * Math.random(),
                y: game_server.core.world_size.height * Math.random(),
            } );

    } else if ( no_ammo < no_players || Math.random() < 2 * Math.exp( -2.3 / Math.max( 1, no_weapons - no_players ) ) ) {

        if ( w < 0.5 )
            new_spawn = new game_object.game_object( null, game_object.TYPES.handgun_ammo, { 
                x: game_server.core.world_size.width * Math.random(),
                y: game_server.core.world_size.height * Math.random(),
            } );


        else if ( w < 1 )
            new_spawn = new game_object.game_object( null, game_object.TYPES.shotgun_ammo, { 
                x: game_server.core.world_size.width * Math.random(),
                y: game_server.core.world_size.height * Math.random(),
            } );

    }

    if ( !new_spawn )
        return;
        
    game_server.core.objects[new_spawn.id] = new_spawn;

    game_server.log( new_spawn.type + ' spawn at x: ' + new_spawn.position.x + ' y: ' + new_spawn.position.y );

};

var random_nicknames = [
    'ahole', 'anus', 'asshole', 'ass-monkey', 'assface', 'asswipe', 'bastard',
    'bitch', 'lil-bitch', 'butthole', 'buttwipe', 'cock', 'cockhead', 
    'cocksucker', 'cunt', 'dick', 'dickbut', 'dildo', 'enema', 'fart',
    'fucker', 'jackoff', 'jizzer', 'knob', 'dipshot', 'masturbator', 
    'peenus', 'peenor', 'penis', 'pussy', 'rectum', 'semen', 'shit',
    'skank', 'shitter', 'lil-shit', 'slag', 'slut', 'turd', 'vagina',
    'arschloch', 'nutsack', 'wanker',
];
