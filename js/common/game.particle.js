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

    };

    e.bullet.prototype.is_alive = function() {
        
        return f.v_mag( f.v_sub( this.position, this.origin ) ) <= ( this.distance_to_live * g.pixels_per_m );

    };

    e.bullet.prototype.update = function( dt ) {
        
        this.movement_vector = { 
            x: Math.cos( this.direction ),
            y: Math.sin( this.direction ),
        };
        this.movement_vector = f.v_mul_scalar( this.movement_vector, this.speed * g.pixels_per_m * dt / 1000 );

        this.position = f.v_add( this.position, this.movement_vector );
        
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
