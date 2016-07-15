( function( e ) {

    e.weapon_from_snapshot = function( weapon_snapshot ) {

        var weapon;

        switch ( weapon_snapshot.name ) {

            case 'Knife':
                weapon = new e.knife();
                break;

            case 'Handgun':
                weapon = new e.handgun();
                break;

            case 'Shotgun':
                weapon = new e.shotgun();
                break;

        }

        weapon.update_from_snapshot( weapon_snapshot );

        return weapon;
    
    };        


    /**
     * KNIFE
     */
    e.knife = function( owner_avatar ) {

        this.name = 'Knife';

        this.owner = owner_avatar;

        this.STATES = {
            idle: 'idle',
            attacking: 'attacking',
        };
        this.state = this.STATES.idle;

        this.time_since_attack_start = 0;
        this.attack_duration = 1000;

        this.hitbox = { x: 10, y: 0, r: 20 };

    };

    e.knife.prototype.start_primary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        this.state = this.STATES.attacking;
        this.time_since_attack_start = 0;

        game_particle.register( new game_particle.slash(
            null,
            timestamp,
            this.owner,

            20,
            1000,
            30 ) );

    }

    e.knife.prototype.end_primary_action = function( timestamp ) {
        return;
    }

    e.knife.prototype.start_secondary_action = function( timestamp ) {
        return;
    }

    e.knife.prototype.end_secondary_action = function( timestamp ) {
        return;
    }

    e.knife.prototype.snapshot = function() {
             
        return { 
            name: this.name,
            s: this.state,
            t: this.time_since_attack_start,
        };

    };

    e.knife.prototype.update_from_snapshot = function( snapshot ) {

        this.state = snapshot.s;
        this.time_since_attack_start = snapshot.t;

    };

    e.knife.prototype.update = function( dt ) {

        if ( this.state == this.STATES.attacking ) {

            this.time_since_attack_start += dt;

            if ( this.time_since_attack_start >= this.attack_duration )
                this.state = this.STATES.idle;

        }
        
    }



    /**
     * HANDGUN
     */
    e.handgun = function( owner_avatar ) {

        this.name = 'Handgun';

        this.owner = owner_avatar;

        this.STATES = {
            idle: 'idle',
            shooting: 'shooting',
            blanking: 'blanking',
            reloading: 'reloading',
        };
        this.state = this.STATES.idle;
        this.action_timeout = 0;

        this.max_loaded_ammo = 12;
        this.loaded_ammo = this.max_loaded_ammo;
        this.extra_ammo = 0;

        this.shot_duration = 300; // ms
        this.blank_duration = 100;
        this.reload_duration = 1000; // ms

        this.bullet_origin_offset = { x: 43, y: 13 };
        this.bullet_origin_offset_mag = f.v_mag( this.bullet_origin_offset );
        this.bullet_origin_offset_angle = f.v_angle( this.bullet_origin_offset );

        this.bullet_hitbox_radius = 2;
        this.bullet_speed = 10;
        this.bullet_distance_to_live = 7;
        this.bullet_damage = 10;

    };

    e.handgun.prototype.start_primary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        if ( this.loaded_ammo > 0 ) {

            this.state = this.STATES.shooting;
            this.action_timeout = this.shot_duration;

            var origin = {
                x: this.owner.position.x + this.bullet_origin_offset_mag * Math.cos( this.owner.direction + this.bullet_origin_offset_angle ),
                y: this.owner.position.y + this.bullet_origin_offset_mag * Math.sin( this.owner.direction + this.bullet_origin_offset_angle ),
            };
    
            game_particle.register( new game_particle.bullet(
                null, 
                timestamp, 
                this.owner,
                origin,
                this.owner.direction,

                this.bullet_hitbox_radius,
                this.bullet_speed,
                this.bullet_distance_to_live,
                this.bullet_damage ) );
            
            this.loaded_ammo--;
            
        } else {

            this.state = this.STATES.blanking;
            this.action_timeout = this.blank_duration;

        }

    }

    e.handgun.prototype.end_primary_action = function( timestamp ) {
        return;
    }

    e.handgun.prototype.start_secondary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        if ( this.extra_ammo <= 0 )
            return;

        this.state = this.STATES.reloading;
        this.action_timeout = this.reload_duration;

        var ammo_needed = this.max_loaded_ammo - this.loaded_ammo;

        if ( this.extra_ammo > ammo_needed ) {

            this.loaded_ammo = this.max_loaded_ammo;
            this.extra_ammo -= ammo_needed;

        } else {

            this.loaded_ammo += this.extra_ammo;
            this.extra_ammo = 0;

        }

    }

    e.handgun.prototype.end_secondary_action = function( timestamp ) {
        return;
    };

    e.handgun.prototype.snapshot = function() {
        
        return { 
            name: this.name,
            s: this.state,
            a: this.loaded_ammo,
            e: this.extra_ammo,
        };

    };

    e.handgun.prototype.update_from_snapshot = function( snapshot ) {

        this.state = snapshot.s;
        this.loaded_ammo = snapshot.a;
        this.extra_ammo = snapshot.e;

    };

    e.handgun.prototype.update = function( dt ) {

        if ( this.action_timeout > 0 )
            this.action_timeout -= dt;

        if ( this.state != this.STATES.idle && this.action_timeout <= 0 )
            this.state = this.STATES.idle;

    };



    /**
     * SHOTGUN
     */
    e.shotgun = function( owner_avatar ) {

        this.name = 'Shotgun';

        this.owner = owner_avatar;

        this.STATES = {
            idle: 'idle',
            shooting: 'shooting',
            reloading: 'reloading',
        };
        this.state = this.STATES.idle;
        this.action_timeout = 0;

        this.max_loaded_ammo = 2;
        this.loaded_ammo = this.max_loaded_ammo;
        this.extra_ammo = 0;

        this.shot_duration = 800; // ms
        this.blank_duration = 100;
        this.reload_duration = 2000; // ms

        this.bullet_origin_offset = { x: 58, y: 9 };
        this.bullet_origin_offset_mag = f.v_mag( this.bullet_origin_offset );
        this.bullet_origin_offset_angle = f.v_angle( this.bullet_origin_offset );

        this.bullet_count = 20;
        this.bullet_spray_range = Math.PI / 4;
        this.bullet_speed_range = 0.2;
        this.bullet_hitbox_radius = 1;
        this.bullet_speed = 10;
        this.bullet_time_to_live = 250;
        this.bullet_damage = 3;

    };

    e.shotgun.prototype.start_primary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        if ( this.loaded_ammo > 0 ) {

            this.state = this.STATES.shooting;
            this.action_timeout = this.shot_duration;
   
            var origin = {
                x: this.owner.position.x + this.bullet_origin_offset_mag * Math.cos( this.owner.direction + this.bullet_origin_offset_angle ),
                y: this.owner.position.y + this.bullet_origin_offset_mag * Math.sin( this.owner.direction + this.bullet_origin_offset_angle ),
            };
    
            for ( var i = 0; i < this.bullet_count; i++ ) {

                var random_direction = this.owner.direction + ( this.bullet_spray_range * ( Math.random() - 0.5 ) );
                var random_speed = this.bullet_speed * ( 1 - ( this.bullet_speed_range * Math.random() ) )

                game_particle.register( new game_particle.shrapnel(
                    null, 
                    timestamp, 
                    this.owner,
                    origin,
                    random_direction,

                    this.bullet_hitbox_radius,
                    random_speed,
                    this.bullet_time_to_live,
                    this.bullet_damage ) );

            };

            this.loaded_ammo--;
            
        } else {

            this.state = this.STATES.blanking;
            this.action_timeout = this.blank_duration;

        };
        
    }

    e.shotgun.prototype.end_primary_action = function( timestamp ) {
        return;
    }

    e.shotgun.prototype.start_secondary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        if ( this.extra_ammo <= 0 )
            return;

        this.state = this.STATES.reloading;
        this.action_timeout = this.reload_duration;

        var ammo_needed = this.max_loaded_ammo - this.loaded_ammo;

        if ( this.extra_ammo > ammo_needed ) {

            this.loaded_ammo = this.max_loaded_ammo;
            this.extra_ammo -= ammo_needed;

        } else {

            this.loaded_ammo += this.extra_ammo;
            this.extra_ammo = 0;

        }

    }

    e.shotgun.prototype.end_secondary_action = function( timestamp ) {
        return;
    };

    e.shotgun.prototype.snapshot = function() {
        
        return { 
            name: this.name,
            s: this.state,
            a: this.loaded_ammo,
            e: this.extra_ammo,
        };

    };

    e.shotgun.prototype.update_from_snapshot = function( snapshot ) {

        this.state = snapshot.s;
        this.loaded_ammo = snapshot.a;
        this.extra_ammo = snapshot.e;

    };

    e.shotgun.prototype.update = function( dt ) {

        if ( this.action_timeout > 0 )
            this.action_timeout -= dt;

        if ( this.state != this.STATES.idle && this.action_timeout <= 0 )
            this.state = this.STATES.idle;

    };

}( typeof exports === 'undefined' ? this.game_weapon = {} : exports ) );
