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

        this.inventory = [];
        this.equiped_weapon = null;

        // Input variables
        this.input_vector = null;

        // Position variables
        // Current position of the player in the world
        this.position = { x: 0, y: 0 }
        // Degrees in radians between the line ((0, 0), (1, 0)) and the 
        // looking direction of the avatar
        this.direction = 0;

    }; //game_avatar.constructor

    e.game_avatar.prototype.set_input_vector = function( input_vector ) {
        
        this.input_vector = input_vector;

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
    
    };

}( typeof exports === 'undefined' ? this.game_avatar = {} : exports ) );
