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

        }

        weapon.update_from_snapshot( weapon_snapshot );

        return weapon;
    
    };        


    /**
     * KNIFE
     */
    e.knife = function() {

        this.name = 'Knife';

        this.STATES = {
            idle: 'idle',
            attacking: 'attacking',
        };
        this.state = this.STATES.idle;

        this.time_since_attack_start = 0;
        this.attack_duration = 1000;

    };

    e.knife.prototype.start_primary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        this.state = this.STATES.attacking;
        this.time_since_attack_start = 0;
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
            reloading: 'reloading',
        };
        this.state = this.STATES.idle;
        this.action_timeout = 0;

        this.shot_duration = 100; // ms

        this.reload_duration = 1000; // ms

        this.bullet_hitbox_radius = 3;
        this.bullet_speed = 10;
        this.bullet_distance_to_live = 7;
        this.bullet_damage = 10;

    };

    e.handgun.prototype.start_primary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        this.state = this.STATES.shooting;
        this.action_timeout = this.shot_duration;

        game_particle.register( new game_particle.bullet(
                null, 
                timestamp, 
                this.owner,
                this.owner.position,
                this.owner.direction,

                this.bullet_hitbox_radius,
                this.bullet_speed,
                this.bullet_distance_to_live,
                this.bullet_damage ) );
        
    }

    e.handgun.prototype.end_primary_action = function( timestamp ) {
        return;
    }

    e.handgun.prototype.start_secondary_action = function( timestamp ) {

        if ( this.state != this.STATES.idle )
            return;

        this.state = this.STATES.reloading;
        this.action_timeout = this.reload_duration;

    }

    e.handgun.prototype.end_secondary_action = function( timestamp ) {
        return;
    };

    e.handgun.prototype.snapshot = function() {
        
        return { 
            name: this.name,
            s: this.state,
        };

    };

    e.handgun.prototype.update_from_snapshot = function( snapshot ) {

        this.state = snapshot.s;

    };

    e.handgun.prototype.update = function( dt ) {

        if ( this.action_timeout > 0 )
            this.action_timeout -= dt;

        if ( this.state != this.STATES.idle && this.action_timeout <= 0 )
            this.state = this.STATES.idle;

    };

}( typeof exports === 'undefined' ? this.game_weapon = {} : exports ) );
