( function( e ) {

    e.world_particles = {};

    e.register = function( particle ) {

        e.world_particles[ particle.id ] = particle;

    };

    

    /**
     * KNIFE PARTICLE: SLASH
     */
    e.slash = function( id, creation_time, slicer, offset, hitbox_radius, duration, damage ) {

        this.id = id || UUID();
        this.creation_time = creation_time;
        this.slicer = slicer;

        this.offset = offset;
        this.hitbox_radius = hitbox_radius;
        this.duration = duration;
        this.damage = damage;

        this.position = { x: this.slicer.position.x, y: this.slicer.position.y };
        this.hitbox = { x: this.position.x, y: this.position.y, r: this.hitbox_radius };
        this.offset_mag = f.v_mag( this.offset );
        this.offset_angle = f.v_angle( this.offset );

        this.has_hit = [];
        this.has_faded = false;

        this.age = 0;
    };

    e.slash.prototype.hit = function( target ) {
    
        // Only do damage on the first hit of a target    
        if ( this.has_hit.indexOf( target ) < 0 )
            target.damage( this.damage );

    };

    e.slash.prototype.is_alive = function() {

        return ( !this.has_faded );

    };

    e.slash.prototype.update = function( dt ) {

        this.age += dt;
        
        this.set_position( {
            x: this.slicer.position.x + ( this.offset_mag * Math.cos( this.offset_angle + this.slicer.direction ) ),
            y: this.slicer.position.y + ( this.offset_mag * Math.sin( this.offset_angle + this.slicer.direction ) ),
        } );

        if ( this.age > this.duration )
            this.faded = true;
        
    };

    e.slash.prototype.set_position = function( x, y ) {

        this.position.x = x;
        this.position.y = y;

        this.hitbox.x = x;
        this.hitbox.y = y;

    };

    e.slash.prototype.snapshot = function() {

        return {
            id: this.id,
            p: this.position,
            r: this.hitbox_radius,
        };

    };

    e.slash.prototype.update_from_snapshot = function( snapshot ) {

        this.position = snapshot.p;

    };



    /**
     * HANDGUN, RIFLE PARTICLE: BULLET
     */
    e.bullet = function( id, creation_time, shot_by, origin, direction, hitbox_radius, speed, distance_to_live, damage ) {
        
        this.id = id || UUID();
        this.creation_time = creation_time; 
        this.shot_by = shot_by;
        this.origin = origin;
        this.direction = direction;

        this.hitbox_radius = hitbox_radius;
        this.speed = speed;
        this.distance_to_live = distance_to_live;
        this.damage = damage;

        this.position = { x: this.origin.x, y: this.origin.y };
        this.hitbox = { x: this.position.x, y: this.position.x, r: this.hitbox_radius }

        this.movement_direction_vector = { 
            x: Math.cos( this.direction ),
            y: Math.sin( this.direction ),
        };

        this.has_hit = false;
        this.has_faded = false;

    };

    e.bullet.prototype.hit = function( target ) {

        target.damage( this.damage );
        this.has_hit = true;

    };

    e.bullet.prototype.is_alive = function() {

        return ( !this.has_hit && !this.has_faded );

    };

    e.bullet.prototype.update = function( dt ) {
        
        var new_position = f.v_add( this.position, f.v_mul_scalar( this.movement_direction_vector, this.speed * g.pixels_per_m * dt / 1000 ) );

        // If this updates takes us over our distance to live, set our position to our distance to live
        if ( f.v_mag( f.v_sub( new_position, this.origin ) ) > ( this.distance_to_live * g.pixels_per_m ) ) {

            new_position = f.v_add( this.origin, f.v_mul_scalar( this.movement_direction_vector, this.distance_to_live * g.pixels_per_m ) );

            this.has_faded = true;

        }
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
