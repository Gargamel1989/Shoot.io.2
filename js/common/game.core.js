( function( e ) {

    e.game_core = function() {

        this.environment = game_avatar.environment;
        this.objects = game_avatar.objects;
        this.avatars = game_avatar.avatars;

        this.world_size = {
            width: 1292,
            height: 770,
        };

        // Base chance of a weapon spawn per second. This is modified by the
        // currrent amount of weapons on the map
        this.spawn_chance = 0.1;

        // Create world boundaries
        this.environment.push(
            { x: -1, y: -1, w: 1, h: this.world_size.height },
            { x: this.world_size.width, y: -1, w: 1, h: this.world_size.height },
            { x: -1, y: -1, w: this.world_size.width, h: 1 },
            { x: -1, y: this.world_size.height, w: this.world_size.width, h: 1 }
        );

    };

    e.game_core.prototype.add_avatar = function( player_id, player_nickname, player_color ) {

        var avatar = new game_avatar.game_avatar( player_nickname, player_color );
        this.avatars[player_id] = avatar;

        this.move_to_random_position( avatar );

        return avatar;

    };

    e.game_core.prototype.move_to_random_position = function( avatar ) {
		
		var collision = true;

        while ( collision ) {

            avatar.set_position( this.world_size.width * Math.random(), this.world_size.height * Math.random() );

            collision = false;

            for ( var player_id in this.avatars ) {

                if ( avatar !== this.avatars[player_id] && f.collision_test_circles( avatar.hitbox, this.avatars[player_id].hitbox ) ) {

                    collision = true;
                    break;

                }

            }

            if ( collision )
                break;

            for ( var env_i in this.environment ) {
    
                var env_obj = this.environment[env_i];

                if ( f.collision_test_circle_rect( avatar.hitbox, env_obj ) ) {

                    collision = true;
                    break;

                }

            }

        }

    };

    /**
     * Aggregates a list of input events into a single input
     * vector and assigns it to a player avatar to determine its movement
     * during the next frame.
     */
    e.game_core.prototype.process_inputs = function( timestamp, player_id, input_list ) {
        
        var avatar = this.avatars[player_id];

        if ( !avatar )
            return;

        var input_vector = {
            forward: 0,
            right: 0,

            space: false,

            mouse_x: 0,
            mouse_y: 0,

            lmb: 0,
            rmb: 0,

            scroll: 0,
        };

        for ( var i = 0; i < input_list.length; i++ ) {

            var ev = input_list[i];
            
            var parts = ev.split( '|' );
            var key = parts[0];

            switch ( key ) {

                case 'l':
                    input_vector.right -= 1;
                    break
                
                case 'r':
                    input_vector.right += 1;
                    break

                case 'u':
                    input_vector.forward += 1;
                    break;

                case 'd':
                    input_vector.forward -= 1;
                    break;

                case 'p':
                    input_vector.scroll -= 1;
                    break;

                case 'n':
                    input_vector.scroll += 1;
                    break;

                case 's':
                    input_vector.space = true;
                    break;

                case 'm':

                    if ( parts[1] == 'l' ) {
                        
                        // 'up' or 'down'
                        input_vector.lmb = parts[2];

                    } else if ( parts[1] == 'r' ) {

                        // 'up' or 'down'
                        input_vector.rmb = parts[2];

                    } else {

                        input_vector.mouse_x = parts[1];
                        input_vector.mouse_y = parts[2];

                    }
                    break;

            }
        }

        avatar.set_input_vector( timestamp, input_vector );

    };

    e.game_core.prototype.remove_avatar = function( player_id ) {
    
        delete this.avatars[player_id];

    };

    e.game_core.prototype.update_world_from_snapshot = function( world_snapshot ) {

        for ( var object_id in world_snapshot.objects ) {

            if ( !this.objects[object_id] )
                this.objects[world_snapshot.objects[object_id].id] = game_object.create_from_snapshot( world_snapshot.objects[object_id] );

        }

        for ( var object_id in this.objects ) {

            if ( !world_snapshot.objects[object_id] )
                delete this.objects[object_id];

        }
        
        for ( var player_id in world_snapshot.players ) {

            if ( !this.avatars[player_id] )
                this.add_avatar( player_id );
            
            this.avatars[player_id].update_from_snapshot( world_snapshot.players[player_id] );
            
        }

        for ( var player_id in this.avatars ) {

            if ( !world_snapshot.players[player_id] )
                delete this.avatars[player_id];

        }

        for ( var particle_id in world_snapshot.particles ) {

            var p = world_snapshot.particles[particle_id];

            if ( !game_particle.world_particles[particle_id] ) {

                switch ( p.type ) {

                    case 'Slash':
                        game_particle.register( new game_particle.slash.create_from_snapshot( p ) );
                        break;

                    case 'Bullet':
                        game_particle.register( new game_particle.bullet.create_from_snapshot( p ) );
                        break;

                    case 'Shrapnel':
                        game_particle.register( new game_particle.shrapnel.create_from_snapshot( p ) );
                        break;

                }

            } else {

                game_particle.world_particles[particle_id].update_from_snapshot( p );

            }

        }

        for ( var particle_id in game_particle.world_particles ) {

            if ( !world_snapshot.particles[particle_id] )
                delete game_particle.world_particles[particle_id];

        }

    };

    e.game_core.prototype.update = function( dt ) {

        for ( var object_id in this.objects ) {

            if ( this.objects[object_id].has_disappeared() )
                delete this.objects[object_id];

        }

        for ( var player_id in this.avatars ) {

            var avatar = this.avatars[player_id];

            avatar.update( dt );

            if ( !avatar.is_alive() ) {

                if ( avatar.killed_by )
                    avatar.killed_by.score += 100;

                avatar.score -= 30;

                avatar.reset();
                this.move_to_random_position( avatar );

            }

            for ( var object_id in this.objects ) {

                if ( f.collision_test_circles( avatar.hitbox, this.objects[object_id].hitbox ) )
                    this.objects[object_id].pick_up( avatar );

            }

        }

        for ( var particle_id in game_particle.world_particles ) {

            var particle = game_particle.world_particles[particle_id];
            
            particle.update( dt );

            for ( player_id in this.avatars ) {

                if ( particle.owner !== this.avatars[player_id] && f.collision_test_circles( particle.hitbox, this.avatars[player_id].hitbox ) )
                    particle.hit( this.avatars[player_id] );
            
            }

            if ( !game_particle.world_particles[particle_id].is_alive() )
                delete game_particle.world_particles[particle_id];
            

        }

    };

    e.game_core.prototype.world_snapshot = function() {
       
        var snapshot = {
            objects: {},
            players: {},
            particles: {}
        };

        for ( var object_id in this.objects )
            snapshot.objects[object_id] = this.objects[object_id].snapshot();

        for ( var player_id in this.avatars )
            snapshot.players[player_id] = this.avatars[player_id].snapshot();

        for ( var particle_id in game_particle.world_particles )
            snapshot.particles[particle_id] = game_particle.world_particles[particle_id].snapshot();

        return snapshot;

    };

}( typeof exports === 'undefined' ? this.game_core = {} : exports ) );
