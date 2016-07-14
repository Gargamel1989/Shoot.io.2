( function( e ) {

    e.world_particles = {};

    e.register = function( particle ) {

        e.world_particles[ particle.id ] = particle;

    };

    

    /**
     * KNIFE PARTICLE: SLASH
     */
    e.slash = function( id, creation_time, owner, hitbox_radius, duration, damage ) {

        this.id = id || UUID();
        this.type = 'Slash';

        this.creation_time = creation_time;
        this.owner = owner;

        this.hitbox_radius = hitbox_radius;
        this.duration = duration;
        this.damage = damage;

        this.offset = { x: 20, y: 0 };
        this.position = { x: 0, y: 0 };
        this.hitbox = { x: this.position.x, y: this.position.y, r: this.hitbox_radius };
        this.offset_mag = f.v_mag( this.offset );
        this.offset_angle = f.v_angle( this.offset );

        this.has_hit = [];
        this.has_faded = false;

        this.age = 0;
    };
    
    e.slash.create_from_snapshot = function( snapshot ) {
        
        var inst = new e.slash( snapshot.id, snapshot.c, null, snapshot.r, snapshot.d, snapshot.dmg );
        inst.update_from_snapshot( snapshot );

        return inst;

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
        
        this.set_position(
            this.owner.position.x + ( this.offset_mag * Math.cos( this.offset_angle + this.owner.direction ) ),
            this.owner.position.y + ( this.offset_mag * Math.sin( this.offset_angle + this.owner.direction ) ));

        if ( this.age > this.duration )
            this.has_faded = true;
        
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
            type: this.type,

            c: this.creation_time,
            r: this.hitbox_radius,
            d: this.duration,
            dmg: this.damage,

            p: this.position,
        };

    };

    e.slash.prototype.update_from_snapshot = function( snapshot ) {

        this.position = snapshot.p;

    };



    /**
     * HANDGUN, RIFLE PARTICLE: BULLET
     */
    e.bullet = function( id, creation_time, owner, origin, direction, hitbox_radius, speed, distance_to_live, damage ) {
        
        this.id = id || UUID();
        this.type = 'Bullet';

        this.creation_time = creation_time; 
        this.owner = owner;
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

    e.bullet.create_from_snapshot = function( snapshot ) {

        var s = snapshot;
        var inst = new e.bullet( s.id, s.c, null, s.o, s.d, s.r, s.s, s.dtl, s.dmg );
        inst.update_from_snapshot( s );

        return inst;

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
            type: this.type,

            c: this.creation_time,
            o: this.origin,
            d: this.direction,
            r: this.hitbox_radius,
            s: this.speed,
            dtl: this.distance_to_live,
            dmg: this.damage,

            p: this.position,
        };

    };

    e.bullet.prototype.update_from_snapshot = function( snapshot ) {

        this.position = snapshot.p;

    };

    

    /**
     * SHOTGUN PARTICLE: SHRAPNEL
     */
    e.shrapnel = function( id, creation_time, owner, origin, direction, hitbox_radius, speed, time_to_live, damage ) {

        this.id = id || UUID();
        this.type = 'Shrapnel';
        
        this.creation_time = creation_time;
        this.owner = owner;
        this.origin = origin;
        this.direction = direction;

        this.hitbox_radius = hitbox_radius;
        this.speed = speed;
        this.time_to_live = time_to_live;
        this.damage = damage;

        this.position = { x: this.origin.x, y: this.origin.y };
        this.hitbox = { x: this.position.x, y: this.position.y, r: this.hitbox_radius };

        this.movement_direction_vector = { 
            x: Math.cos( this.direction ),
            y: Math.sin( this.direction ),
        };

        this.has_hit = false;
        this.has_faded = false;

        this.age = 0;

    };

    e.shrapnel.create_from_snapshot = function( snapshot ) {

        var s = snapshot;
        var inst = new e.shrapnel( s.id, s.c, null, s.o, s.d, s.r, s.s, s.ttl, s.dmg );
        inst.update_from_snapshot( s );

        return inst;

    };
    
    e.shrapnel.prototype.hit = function( target ) {

        target.damage( this.damage );
        this.has_hit = true;

    };

    e.shrapnel.prototype.is_alive = function() {

        return ( !this.has_hit && !this.has_faded );

    };

    e.shrapnel.prototype.update = function( dt ) {

        this.age += dt;

        if ( this.age > this.time_to_live ) {

            this.has_faded = true;
            return;

        }

        var new_position = f.v_add( this.position, f.v_mul_scalar( this.movement_direction_vector, this.speed * g.pixels_per_m * dt / 1000 ) );

        this.set_position( new_position.x, new_position.y );
        
    };

    e.shrapnel.prototype.set_position = function( x, y ) {

        this.position.x = x;
        this.position.y = y;

        this.hitbox.x = x;
        this.hitbox.y = y;

    };

    e.shrapnel.prototype.snapshot = function() {

        return {
            id: this.id,
            type: this.type,

            c: this.creation_time,
            o: this.origin,
            d: this.direction,
            r: this.hitbox_radius,
            s: this.speed,
            ttl: this.time_to_live,
            dmg: this.damage,

            p: this.position,
        };

    };

    e.shrapnel.prototype.update_from_snapshot = function( snapshot ) {

        this.position.x = snapshot.p.x;
        this.position.y = snapshot.p.y;

    };

}( typeof exports === 'undefined' ? this.game_particle = {} : exports ) );
