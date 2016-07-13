var game_camera = function( game_core, show_debug_shapes ) {

    this.core = game_core;
    this.show_debug_shapes = show_debug_shapes || true;

    var body = document.getElementsByTagName( 'body' )[0];
    

    this.viewport = document.getElementById( 'viewport' );
    
    // Viewport size
    this.viewport_size = {
        width: 1280,
        height: 960,
    };
    //this.viewport.style.width = this.viewport_size.width + 'px';
    //this.viewport.style.height = this.viewport_size.height + 'px';
    
    this.stage = new createjs.Stage( this.viewport );

    this.setup_viewport();

    this.world_position = { x: 0, y: 0 };

    this.object_to_follow = null;

    this.sprites = {};
    this.debug_shapes = {};

    this.map = new createjs.Bitmap( assets.getResult( 'map_debug' ) );
    this.stage.addChild( this.map );

};

game_camera.prototype.setup_viewport = function() {
    
    var window_w = window.innerWidth;
    var window_h = window.innerHeight;

    this.viewport.width = window_w;
    this.viewport.height = window_h;

};

game_camera.prototype.camera_to_world_coordinates = function( cam_x, cam_y ) {

    return {
        x: this.world_position.x + cam_x,
        y: this.world_position.y + cam_y,
    };

};

game_camera.prototype.world_to_camera_coordinates = function( world_x, world_y ) {
    
    return {
        x: world_x - this.world_position.x,
        y: world_y - this.world_position.y,
    };

};

game_camera.prototype.follow = function( object_to_follow ) {

    this.object_to_follow = object_to_follow;

};

game_camera.prototype.update = function( dt ) {
    
    if ( this.object_to_follow !== null ) {

        this.world_position.x = this.object_to_follow.position.x - ( this.viewport_size.width / 2 );
        this.world_position.y = this.object_to_follow.position.y - ( this.viewport_size.height / 2 );

    }

    // Map is always at world coordinates 0, 0
    var map_camera_pos = this.world_to_camera_coordinates( 0, 0 );
    this.map.x = map_camera_pos.x;
    this.map.y = map_camera_pos.y;

    for ( player_id in this.core.avatars ) {
        
        if ( !this.sprites[player_id] ) {

            var avatar = this.core.avatars[player_id];

            if ( this.show_debug_shapes ) {

                var debug_position = new createjs.Shape();
                debug_position.graphics.f( 'red' ).dc( 0, 0, 20 );

                this.stage.addChild( debug_position );

                if ( !this.debug_shapes[player_id] )
                    this.debug_shapes[player_id] = [];

                this.debug_shapes[player_id].push( debug_position );

                if ( avatar.equiped_weapon !== null && avatar.equiped_weapon.state != avatar.equiped_weapon.STATES.idle )
                    this.debug_shapes[player_id][0].color = 'green';

            }

            var sprite = new createjs.Sprite( assets.getResult( 'feet' ), 'idle' );
            sprite.scaleX = 0.3;
            sprite.scaleY = 0.3;

            this.stage.addChild( sprite );

            this.sprites[player_id] = sprite;

        }

    }

    for ( player_id in this.sprites ) {

        if ( !this.core.avatars[player_id] )
            delete this.sprites[player_id];

        var sprite = this.sprites[player_id];
        var avatar = this.core.avatars[player_id];

        var camera_position = this.world_to_camera_coordinates( avatar.position.x, avatar.position.y );
        
        
        sprite.x = camera_position.x;
        sprite.y = camera_position.y;
        sprite.rotation = 360 * avatar.direction / ( 2 * Math.PI );
        
        if ( this.show_debug_shapes && this.debug_shapes[player_id] ) {

            for ( var i = 0; i < this.debug_shapes[player_id].length; i++ ) {

                this.debug_shapes[player_id][i].x = sprite.x;
                this.debug_shapes[player_id][i].y = sprite.y;

            }

        }
    };

};

game_camera.prototype.draw = function() {

    this.stage.update();

};
