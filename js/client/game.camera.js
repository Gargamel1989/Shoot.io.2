var game_camera = function( game_core, debug ) {

    this.core = game_core;
    this.debug = debug || true;

    var body = document.getElementsByTagName( 'body' )[0];

    this.canvas = document.getElementById( 'canvas' );
    
    // Viewport size
    this.viewport_scale = {
        width: 1280,
        height: 960,
    };
    this.viewport_size = {
        width: this.viewport_scale.width,
        height: this.viewport_scale.height,
    };

    this.viewport_margins = {
        x: 20,
        y: 20,
    };
    
    this.stage = new createjs.Stage( this.canvas );

    // Layer containers for sprite ordering
    this.l_map_low = new createjs.Container();
        this.stage.addChild( this.l_map_low );
    this.l_objects = new createjs.Container();
        this.stage.addChild( this.l_objects );
    this.l_avatars = new createjs.Container();
        this.stage.addChild( this.l_avatars );
    this.l_particles = new createjs.Container();
        this.stage.addChild( this.l_particles );
    this.l_hud = new createjs.Container();
        this.stage.addChild( this.l_hud );
    this.l_map_high = new createjs.Container();
    this.l_map_high.alpha = 0.6;
        this.stage.addChild( this.l_map_high );
    this.l_ui = new createjs.Container();
        this.stage.addChild( this.l_ui );

    this.map = new createjs.Bitmap( assets.getResult( 'map_debug' ) );
    this.l_map_low.addChild( this.map );

    if ( this.debug ) {

        this.l_debug = new createjs.Container();
        this.l_debug.alpha = 0.3;
            this.stage.addChild( this.l_debug );

        this.debug_env_sprites = [];

        for ( env_i in this.core.environment ) {

            var env_obj = this.core.environment[env_i];
            var env_sprite = new createjs.Shape();
            env_sprite.graphics.clear().f( 'purple' ).dr( 0, 0, env_obj.w, env_obj.h );
            this.debug_env_sprites.push( env_sprite );
            this.l_debug.addChild( env_sprite );

        }

    } 

    this.ui = new game_ui( this.core, this.l_ui, this.viewport, this.debug, this.l_debug );

    this.viewport = new createjs.Shape();
    this.stage.mask = this.viewport;

    this.resize_viewport();

    this.world_position = { x: 0, y: 0 };

    this.object_to_follow = null;

    this.objects = {};
    this.animators = {};

	this.particle_sprites = {};

};

game_camera.prototype.resize_viewport = function() {
    
    var window_w = window.innerWidth;
    var window_h = window.innerHeight;

    this.canvas.width = window_w;
    this.canvas.height = window_h;

    var viewport_bestfit_scale = Math.min( ( window_w - ( 2 * this.viewport_margins.x ) ) / this.viewport_scale.width, ( window_h - ( 2 * this.viewport_margins.y ) ) / this.viewport_scale.height );
    this.viewport_size = {
        width: this.viewport_scale.width * viewport_bestfit_scale,
        height: this.viewport_scale.height * viewport_bestfit_scale,
    };
    
    this.viewport.graphics.clear().f( 'red' ).dr( 0, 0, this.viewport_size.width, this.viewport_size.height );
    this.viewport.x = ( window_w / 2 ) - ( this.viewport_size.width / 2 );
    this.viewport.y = ( window_h / 2 ) - ( this.viewport_size.height / 2 );

    this.ui.set_viewport( this.viewport.x, this.viewport.y, this.viewport_size.width, this.viewport_size.height );
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

    this.ui.set_player_avatar( object_to_follow );

};

game_camera.prototype.update = function( dt ) {
    
    if ( this.object_to_follow !== null ) {

        this.world_position.x = this.object_to_follow.position.x - ( this.canvas.width / 2 );
        this.world_position.y = this.object_to_follow.position.y - ( this.canvas.height / 2 );

    }
    
    // Map is always at world coordinates 0, 0
    var map_camera_pos = this.world_to_camera_coordinates( 0, 0 );
    this.map.x = map_camera_pos.x;
    this.map.y = map_camera_pos.y;

    for ( var object_id in this.core.objects ) {

        var object = this.core.objects[object_id];

        if ( !this.objects[object_id] ) {

            if ( object.type == game_object.TYPES.handgun )
                this.objects[object_id] = new createjs.Sprite( assets.getResult( 'weapons' ), 'handgun' );

            else if ( object.type == game_object.TYPES.handgun_ammo )
                this.objects[object_id] = new createjs.Sprite( assets.getResult( 'ammo' ), 'handgun' );

            else if ( object.type == game_object.TYPES.shotgun )
                this.objects[object_id] = new createjs.Sprite( assets.getResult( 'weapons' ), 'shotgun' );

            else if ( object.type == game_object.TYPES.shotgun_ammo )
                this.objects[object_id] = new createjs.Sprite( assets.getResult( 'ammo' ), 'shotgun' );


            this.objects[object_id].scaleX = 0.4;
            this.objects[object_id].scaleY = 0.4;

            this.l_objects.addChild( this.objects[object_id] );

        }
        
        var obj_sprite = this.objects[object_id];

        var cam_pos = this.world_to_camera_coordinates( object.position.x, object.position.y );
        obj_sprite.x = cam_pos.x;
        obj_sprite.y = cam_pos.y;

    }

    for ( var object_id in this.objects ) {

        if ( !this.core.objects[object_id] ) {

            this.stage.removeChild( this.objects[object_id] );
            delete this.objects[object_id];

        }

    }

    for ( var player_id in this.core.avatars ) {
        
        if ( !this.animators[player_id] )
            this.animators[player_id] = new game_animator( this, this.l_avatars, this.l_hud, this.core.avatars[player_id], this.debug, this.l_debug );

    }

    for ( var player_id in this.animators ) {

        var animator = this.animators[player_id];

        if ( !this.core.avatars[player_id] ) {

            this.animators[player_id].destroy();
            delete this.animators[player_id];

        }

        animator.update();

    };

	for ( var particle_id in game_particle.world_particles ) {

        var particle = game_particle.world_particles[particle_id];

        if ( !this.particle_sprites[particle_id] ) {

            switch ( particle.type ) {

                case 'Slash':

                    if ( this.debug ) {

                        this.particle_sprites[particle_id] = new createjs.Shape();
                        this.particle_sprites[particle_id].graphics.clear().f( 'white' ).dc( 0, 0, particle.hitbox_radius );

                        this.l_particles.addChild( this.particle_sprites[particle_id] );

                    }
                    break;

                case 'Bullet':
                case 'Shrapnel':

                    this.particle_sprites[particle_id] = new createjs.Shape();
                    this.particle_sprites[particle_id].graphics.clear().f( 'black' ).dc( 0, 0, particle.hitbox_radius );

                    this.l_particles.addChild( this.particle_sprites[particle_id] );
                    break;

            }

        }

        var cam_pos = this.world_to_camera_coordinates( particle.position.x, particle.position.y );

        this.particle_sprites[particle_id].x = cam_pos.x;
        this.particle_sprites[particle_id].y = cam_pos.y;

    }

    for ( var particle_id in this.particle_sprites ) {

        if ( !game_particle.world_particles[particle_id] ) {

            this.stage.removeChild( this.particle_sprites[particle_id] );
            delete this.particle_sprites[particle_id];

        }

    }

    this.ui.update( dt );

    if ( this.debug ) {

        for ( env_i in this.debug_env_sprites ) {
            
            var env_obj = this.core.environment[env_i];
            var cam_pos = this.world_to_camera_coordinates( env_obj.x, env_obj.y );
            this.debug_env_sprites[env_i].x = cam_pos.x;
            this.debug_env_sprites[env_i].y = cam_pos.y;

        }

    }

};

game_camera.prototype.draw = function() {

    this.stage.update();

};
