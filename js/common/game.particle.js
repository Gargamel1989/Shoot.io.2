( function( e ) {

    e.bullet = function( id, creation_time, origin, direction, radius, speed, distance_to_live, damage ) {
        
        this.id = id || UUID();
        this.creation_time = creation_time; 
        this.origin = origin;
        this.direction = direction;

        this.radius = radius;
        this.speed = speed;
        this.distance_to_live = distance_to_live;
        this.damage = damage;

        this.position = { x: this.origin.x, y: this.origin.y };

    };

    e.bullet.prototype.is_alive = function() {
        
        return f.v_mag( f.v_sub( this.position, this.origin ) ) <= this.distance_to_live;

    };

    e.bullet.prototype.update = function( dt ) {
        
        this.movement_vector = { 
            x: Math.cos( this.direction ),
            y: Math.sin( this.direction ),
        };
        this.movement_vector = f.v_mul_scalar( this.movement_vector, this.speed * dt / 1000 );

        this.position = f.v_add( this.position, this.movement_vector );
        console.log('Bullet at ' + this.position.x + ', ' + this.position.y );
    };

    e.bullet.prototype.snapshot = function() {

        return {
            id: this.id,
            p: this.position,
        };

    };

}( typeof exports === 'undefined' ? this.game_particle = {} : exports ) );
