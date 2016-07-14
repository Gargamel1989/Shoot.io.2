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

    this.map = new createjs.Bitmap( assets.getResult( 'map_debug' ) );
    this.stage.addChild( this.map );

    if ( this.debug ) {

        this.debug_env_sprites = [];

        for ( env_i in this.core.environment ) {

            var env_obj = this.core.environment[env_i];
            var env_sprite = new createjs.Shape();
            env_sprite.graphics.clear().f( 'purple' ).dr( 0, 0, env_obj.w, env_obj.h );
            this.debug_env_sprites.push( env_sprite );
            this.stage.addChild( env_sprite );

        }

    } 

    this.viewport = new createjs.Shape();
    this.map.mask = this.viewport;

    this.resize_viewport();

    this.world_position = { x: 0, y: 0 };

    this.object_to_follow = null;

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
    
    this.viewport.graphics.clear().f( 'red' ).dr( ( window_w / 2 ) - ( this.viewport_size.width / 2 ), ( window_h / 2 ) - ( this.viewport_size.height / 2 ), this.viewport_size.width, this.viewport_size.height );

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

    if ( this.debug ) {

        this.weapon_text = new createjs.Text( this.object_to_follow.equiped_weapon.name, "20px Arial", "#F00" );
        this.weapon_text.x = 10;
        this.weapon_text.y = 10;
        
        this.stage.addChild( this.weapon_text );

    }

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

    for ( var player_id in this.core.avatars ) {
        
        if ( !this.animators[player_id] )
            this.animators[player_id] = new game_animator( this, this.core.avatars[player_id], this.debug );

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

                        this.stage.addChild( this.particle_sprites[particle_id] );

                    }
                    break;

                case 'Bullet':
                case 'Shrapnel':

                    this.particle_sprites[particle_id] = new createjs.Shape();
                    this.particle_sprites[particle_id].graphics.clear().f( 'black' ).dc( 0, 0, particle.hitbox_radius );

                    this.stage.addChild( this.particle_sprites[particle_id] );
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

    if ( this.debug ) {

        for ( env_i in this.debug_env_sprites ) {
            
            var env_obj = this.core.environment[env_i];
            var cam_pos = this.world_to_camera_coordinates( env_obj.x, env_obj.y );
            this.debug_env_sprites[env_i].x = cam_pos.x;
            this.debug_env_sprites[env_i].y = cam_pos.y;

        }
            

        if ( this.weapon_text.text != this.object_to_follow.equiped_weapon.name )
            this.weapon_text.text = this.object_to_follow.equiped_weapon.name;

    }

};

game_camera.prototype.draw = function() {

    this.stage.update();

};
