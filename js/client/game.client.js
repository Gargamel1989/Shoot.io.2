var assets,
	assets_manifest = [
        { id: 'feet', src: 'assets/sprites/feet.json', type: 'spritesheet' },
        { id: 'body_knife', src: 'assets/sprites/body_knife.json', type: 'spritesheet' },
        { id: 'body_handgun', src: 'assets/sprites/body_handgun.json', type: 'spritesheet' },
        { id: 'body_shotgun', src: 'assets/sprites/body_shotgun.json', type: 'spritesheet' },
        { id: 'body_rifle', src: 'assets/sprites/body_rifle.json', type: 'spritesheet' },

        { id: 'weapons', src: 'assets/sprites/weapons.json', type: 'spritesheet' },
        { id: 'ammo', src: 'assets/sprites/ammo.json', type: 'spritesheet' },

        { id: 'map_tileset', src: 'assets/maps/tileset.json', type: 'spritesheet' },
        { id: 'map_tmx', src: 'assets/maps/test/example.tmx', type: 'text' },
        { id: 'map_debug', src: 'assets/maps/debug.png', type: 'image' },
    ];

window.onload = function() {
	
    assets = new createjs.LoadQueue( true, '/' );

    assets.addEventListener( 'complete', function() {    

	    var c = new game_client();
   
        document.getElementById( 'loader' ).style.display = 'none';
        document.getElementById( 'progress' ).style.display = 'none';
        document.getElementById( 'start-button-container' ).style.display = 'block';
        document.getElementById( 'start-button-container' ).onclick = function( ev ) {

            var nickname = document.getElementById( 'nickname' ).value;
            var color = document.getElementById( 'color' ).value;

            c.connect( nickname, color );

            document.getElementById( 'intro-wrapper' ).style.display = 'none';

        };

    } );

    assets.addEventListener( 'progress', function( ev ) {

        document.getElementById( 'progress' ).innerHTML = ( 100 * ev.progress ).toFixed(0) + '%';

    } );

    assets.loadManifest( assets_manifest );

};

var game_client = function() {

    this.debug = true;

	this.STATES = {
        connecting:     'connecting',
        connected:      'connected',
        disconnected:   'disconnected',
        not_connected:  'not-connected',
    };
	this.state = this.STATES.not_connected;

	this.keyboard = new THREEx.KeyboardState();
	
    this.mouse = {
        x: 0,
        y: 0,
        scroll: 0,
    };

	// A buffer for input events during the frame, will be processed
	// during the begin fase
	this.inputs = [];
	
	// Sequence number of the last input list sent to the server
	this.input_seq = -1;

    this.latest_server_update = null;

    if ( this.debug ) {

        this.game_loop_dt_begin = 0;
        this.game_loop_dt_update = 0;
        this.game_loop_dt_draw = 0;
        this.game_loop_updates_per_frame = 0;

    };

};

game_client.prototype.connect = function( nickname, color ) {
	
	this.state = this.STATES.connecting;
	
	this.socket = io.connect( {
        query: 'nickname=' + nickname + '&color=' + color,
    } );
	
	// On error we just show that we are not connected for now.
    this.socket.on( 'error', this.on_disconnect.bind( this ) );
    
	// Sent when we actually connect to the server
    this.socket.on( 'connected', this.on_connected.bind( this ) );
    
	// Sent when we are disconnected (network, server down, etc.)
    this.socket.on( 'disconnect', this.on_disconnect.bind( this ) );
   	
	// On message from the server, we parse the commands and send it to the handlers
    this.socket.on( 'message', this.on_message.bind( this ) );
    
	// Sent each tick of the server simulation. This is our authorotive update
    this.socket.on( 'serverupdate', this.on_server_update.bind( this ) );

    // Log server events
    this.socket.on( 'serverevent', this.on_server_event.bind( this ) );
    
};

game_client.prototype.on_connected = function( player ) {

    this.state = this.STATES.connected;

	this.player_id = player.id;

    this.core = new game_core.game_core( assets.getResult( 'map_tmx' ) );
    var player_avatar = this.core.add_avatar( this.player_id, player.nickname, player.color );

    this.camera = new game_camera( this.core );
    this.camera.follow( player_avatar );

    this.game_loop = MainLoop.setBegin( this.begin.bind( this ) )
                             .setUpdate( this.update.bind( this ) )
                             .setDraw( this.draw.bind( this ) )
                             .start();
	
	// Start listening to mouse events
    this.camera.stage.on( 'stagemousemove', ( function( event ) {

        this.mouse.x = event.stageX;
		this.mouse.y = event.stageY;

    } ).bind( this ) );

    this.camera.stage.on( 'stagemousedown', ( function( event ) {

        if ( event.nativeEvent.button == 0 )
			this.inputs.push( 'm|l|down' );

        else if ( event.nativeEvent.button == 2 )
			this.inputs.push( 'm|r|down' );

    } ).bind( this ) );
    
    

    this.camera.stage.on( 'stagemouseup', ( function( event ) {

        if ( event.nativeEvent.button == 0 )
			this.inputs.push( 'm|l|up' );

        else if ( event.nativeEvent.button == 2 )
			this.inputs.push( 'm|r|up' );

    } ).bind( this ) );

};

game_client.prototype.on_disconnect = function() {

    this.state = this.STATES.disconnected;

    this.game_loop.stop();
};

game_client.prototype.on_message = function( data ) {

    console.log( 'Server Message:' + data );

};

game_client.prototype.on_server_event = function( data ) {

    this.camera.ui.event_log.push.apply( this.camera.ui.event_log, data.events );

};

game_client.prototype.on_server_update = function( data ) {
    
    this.latest_server_update = data;    

};



game_client.prototype.begin = function( timestamp, delta ) {

    this.game_loop_updates_per_frame = 0;

    if ( this.debug )
        var start = new Date().getTime();

	this.input_seq++;
		
	if ( this.keyboard.pressed( 'Q' ) || this.keyboard.pressed( 'left' ) )
        this.inputs.push( 'l' );

    if ( this.keyboard.pressed( 'D' ) || this.keyboard.pressed( 'right' ) )
        this.inputs.push( 'r' );

    if ( this.keyboard.pressed( 'S' ) || this.keyboard.pressed( 'down' ) )
        this.inputs.push( 'd' );

    if ( this.keyboard.pressed( 'Z' ) || this.keyboard.pressed( 'up' ) )
        this.inputs.push( 'u' );

    // Previous or next weapon
    if ( this.keyboard.pressed( 'A' ) )
        this.inputs.push( 'p' );

    if ( this.keyboard.pressed( 'E' ) )
        this.inputs.push( 'n' );

    if ( this.keyboard.pressed( 'space' ) )
        this.inputs.push( 's' );
    
    // TODO: in the future check if the mouse position has changed since
    // last frame, if not, don't push it and if inputs is empty, don't send
    // a server message    
    var world_mouse = this.camera.camera_to_world_coordinates( this.mouse.x, this.mouse.y );
	this.inputs.push( 'm|' + world_mouse.x + '|' + world_mouse.y );

	// Send the input vector to the server
	var server_packet = 'i#';
		server_packet += this.inputs.join( '$' ) + '#';
		server_packet += timestamp.toFixed( 3 ) + '#';
		server_packet += this.input_seq;
	
	this.socket.send( server_packet );

	this.inputs = [];

    if ( this.debug )
        this.game_loop_dt_begin = new Date().getTime() - start;

};

game_client.prototype.update = function( dt ) {
    
    if ( this.debug )
        var start = new Date().getTime();

    if ( this.latest_server_update ) {

        this.core.update_world_from_snapshot( this.latest_server_update );

        if ( this.latest_server_update.game_loop_debug )
            this.camera.ui.server_game_loop_debug = this.latest_server_update.game_loop_debug;

    }

    this.camera.update();

    if ( this.debug )
        this.game_loop_dt_update = new Date().getTime() - start;

    this.game_loop_updates_per_frame++;

};

game_client.prototype.draw = function() {

    if ( this.debug )
        var start = new Date().getTime();

    this.camera.draw();

    if ( this.debug ) {

        this.game_loop_dt_draw = new Date().getTime() - start;

        this.camera.ui.client_game_loop_debug = {
            dt_begin: this.game_loop_dt_begin,
            dt_update: this.game_loop_dt_update,
            dt_draw: this.game_loop_dt_draw,
            updates_per_frame: this.game_loop_updates_per_frame,
        };

    }

};
