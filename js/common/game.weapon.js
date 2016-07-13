( function( e ) {

    e.weapon_from_snapshot = function( weapon_snapshot ) {

        var weapon;

        switch ( weapon_snapshot.name ) {

            case 'Knife':
                weapon = new e.knife();
                break;

        }

        weapon.update_from_snapshot( weapon_snapshot );

        return weapon;
    
    };        

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

    e.knife.prototype.start_primary_action = function() {

        if ( this.state != this.STATES.idle )
            return;

        this.state = this.STATES.attacking;
        this.time_since_attack_start = 0;
    }

    e.knife.prototype.end_primary_action = function() {
        return;
    }

    e.knife.prototype.start_secondary_action = function() {
        return;
    }

    e.knife.prototype.end_secondary_action = function() {
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

}( typeof exports === 'undefined' ? this.game_weapon = {} : exports ) );
