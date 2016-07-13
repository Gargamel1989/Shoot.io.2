( function( e ) {

    e.game_core = function() {

        this.avatars = {};

    };

    e.game_core.prototype.add_avatar = function( player_id ) {

        this.avatars[player_id] = new game_avatar.game_avatar();

        return this.avatars[player_id];

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
        
        for ( var player_id in world_snapshot ) {

            if ( !this.avatars[player_id] )
                this.add_avatar( player_id );
            
            this.avatars[player_id].update_from_snapshot( world_snapshot[player_id] );
            
        }

        for ( var player_id in this.avatars ) {

            if ( !world_snapshot[player_id] )
                delete this.avatars[player_id];

        }

    };

    e.game_core.prototype.update = function( dt ) {

        for ( var player_id in this.avatars )
            this.avatars[player_id].update( dt );

    };

    e.game_core.prototype.world_snapshot = function() {
       
        var snapshot = {};

        for ( var player_id in this.avatars )
            snapshot[player_id] = this.avatars[player_id].snapshot();

        return snapshot;

    };

}( typeof exports === 'undefined' ? this.game_core = {} : exports ) );
