( function( e ) {

    e.world_particles = {};

    e.register = function( particle ) {

        e.world_particles[ particle.id ] = particle;

    };



    e.bullet = function( id, creation_time, shot_by, origin, direction, hitbox_radius, speed, distance_to_live, damage ) {
        
        this.id = id || UUID();
        this.shot_by = shot_by;
        this.creation_time = creation_time; 
        this.origin = origin;
        this.direction = direction;

        this.hitbox_radius = hitbox_radius;
        this.speed = speed;
        this.distance_to_live = distance_to_live;
        this.damage = damage;

        this.position = { x: this.origin.x, y: this.origin.y };
        this.hitbox = { x: this.position.x, y: this.position.x, radius: this.hitbox_radius }

        this.movement_direction_vector = { 
            x: Math.cos( this.direction ),
            y: Math.sin( this.direction ),
        };

        this.has_hit = false;

    };

    e.bullet.prototype.hit = function( target ) {
console.log('hit');
        target.damage( this.damage );
        this.has_hit = true;

    };

    e.bullet.prototype.is_alive = function() {
        
        return ( this.has_hit || f.v_mag( f.v_sub( this.position, this.origin ) ) <= ( this.distance_to_live * g.pixels_per_m ) );

    };

    e.bullet.prototype.update = function( dt ) {
        
        var new_position = f.v_add( this.position, f.v_mul_scalar( this.movement_direction_vector, this.speed * g.pixels_per_m * dt / 1000 ) );

        // If this updates takes us over our distance to live, set our position to our distance to live
        if ( f.v_mag( f.v_sub( new_position, this.origin ) ) > ( this.distance_to_live * g.pixels_per_m ) )
            new_position = f.v_add( this.origin, f.v_mul_scalar( this.movement_direction_vector, this.distance_to_live * g.pixels_per_m ) );

        this.set_position( new_position.x, new_position.y );
        
    };

    e.bullet.prototype.set_position = function( x, y ) {

        this.position.x = x;
        this.position.y = y;

        this.hitbox.x = x;
        this.hitbox.y = y;

    };

    e.bullet.prototype.snapshot = function() {

        return {
            id: this.id,
            p: this.position,
            r: this.hitbox_radius,
        };

    };

    e.bullet.prototype.update_from_snapshot = function( snapshot ) {

        this.position = snapshot.p;

    };

}( typeof exports === 'undefined' ? this.game_particle = {} : exports ) );
