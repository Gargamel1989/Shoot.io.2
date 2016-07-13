( function( e ) {
    
    /*
     * The avatar class
     *
     * A simple class to maintain state of a players avatar in the game
     *
     */
    e.game_avatar = function( ) {

        // Attributes
        this.base_speed = 2.8; // m/s

        this.max_health = 100;
        this.health = this.max_health;

        this.inventory = [ new game_weapon.knife() ];
        this.equiped_weapon = this.inventory[0];

        // Input variables
        this.input_vector = null;
        this.movement_speed_vector = null;

        // Position variables
        // Current position of the player in the world
        this.position = { x: 0, y: 0 }
        // Degrees in radians between the line ((0, 0), (1, 0)) and the 
        // looking direction of the avatar
        this.direction = 0;

    }; //game_avatar.constructor

    e.game_avatar.prototype.set_input_vector = function( input_vector ) {
        
        this.input_vector = input_vector;

        if ( this.input_vector.forward == 0 && this.input_vector.right == 0 )
            this.movement_speed_vector = { x: 0, y: 0 };

        else {
            this.movement_speed_vector = { x: this.input_vector.forward, y: this.input_vector.right };
            // Normalize the input
            this.movement_speed_vector = f.v_mul_scalar( this.movement_speed_vector, 1 / f.v_mag( this.movement_speed_vector ) );
            
            // Calculate movement speed from the movement direction
            var movement_speed = this.base_speed;
            if ( this.movement_speed_vector.x < 0 )
                movement_speed *= 0.5;
    
            else if ( Math.abs( this.movement_speed_vector.y ) > this.movement_speed_vector.x )
                movement_speed *= 0.75;
 
            this.movement_speed_vector = f.v_mul_scalar( this.movement_speed_vector, movement_speed );

        }

        // Handle input for equiped weapon
        if ( this.equiped_weapon !== null ) {

            if ( this.input_vector.lmb == 'down' )
                this.equiped_weapon.start_primary_action();
            else if ( this.input_vector.lmb == 'up' )
                this.equiped_weapon.end_primary_action();

            if ( this.input_vector.rmb == 'down' )
                this.equiped_weapon.start_secondary_action();
            else if ( this.input_vector.rmb == 'up' )
                this.equiped_weapon.end_secondary_action();

        }
    
    };

    e.game_avatar.prototype.set_position = function( x, y ) {

        this.position.x = x;
        this.position.y = y;

    };

    e.game_avatar.prototype.update = function( dt ) {
    
        if ( this.input_vector === null )
            return;

        // Update angle of the avatar
        var mousepos_mag = f.v_mag( f.v_sub( this.position, { x: this.input_vector.mouse_x, y: this.input_vector.mouse_y } ) );
        
        if ( mousepos_mag == 0 )
            this.direction = 0;

        else {

            var mouse_x_diff = this.input_vector.mouse_x - this.position.x;
        
            this.direction = Math.acos( mouse_x_diff / mousepos_mag );

            if ( this.input_vector.mouse_y < this.position.y )
                this.direction = 2 * Math.PI - this.direction;
        
        }
        
        // Update position of the avatar
        var movement_vector = f.v_mul_scalar( this.movement_speed_vector, g.pixels_per_m * dt / 1000.0 );
        var movement_mag = f.v_mag( movement_vector );
        var movement_angle = f.v_angle( movement_vector );

        var absolute_movement = {
            x: movement_mag * Math.cos( this.direction + movement_angle ),
            y: movement_mag * Math.sin( this.direction + movement_angle ),
        };

        var new_position = f.v_add( this.position, absolute_movement );
        
        this.set_position( new_position.x, new_position.y );

        // Update equipment of the avatar
        if ( this.equiped_weapon !== null )
            this.equiped_weapon.update( dt );

    };

}( typeof exports === 'undefined' ? this.game_avatar = {} : exports ) );
