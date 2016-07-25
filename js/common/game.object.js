( function( e ) {

    e.TYPES = {
        handgun: 'Handgun',
        handgun_ammo: 'Handgun Ammo',

        shotgun: 'Shotgun',
        shotgun_ammo: 'Shotgun Ammo',

        health: 'First Aid Kit',
        armor: 'Bulletproof Vest',
        money: 'Money',

    };

    e.create_from_snapshot = function( snapshot ) {

        return new e.game_object( snapshot.id, snapshot.t, snapshot.p );

    };

    e.game_object = function( id, type, position ) {

        this.id = id || UUID();
        this.type = type;
        this.position = position;
        this.hitbox = { x: position.x, y: position.y, r: 5 };

        this.picked_up = false;

    };

    e.game_object.prototype.has_disappeared = function() {

        return this.picked_up;

    };

    e.game_object.prototype.pick_up = function( avatar ) {

        if ( this.type == e.TYPES.handgun || this.type == e.TYPES.shotgun ) {

            var has_item = false;
            for ( item_i in avatar.inventory ) {

                if ( avatar.inventory[item_i].name == this.type ) {

                    has_item = true;
                    break;

                }

            }

            if ( has_item )
                return;

            var new_weapon;
            if ( this.type == e.TYPES.handgun )
                new_weapon = new game_weapon.handgun( avatar );

            else if ( this.type == e.TYPES.shotgun )
                new_weapon = new game_weapon.shotgun( avatar );

            else
                console.log( 'Unknown weapon type: ' + this.type );

            avatar.inventory.push( new_weapon );
            avatar.equiped_weapon = new_weapon;

        } else if ( this.type == e.TYPES.handgun_ammo ) {

            var handgun = null;
            for ( item_i in avatar.inventory ) {

                if ( avatar.inventory[item_i].name == e.TYPES.handgun ) {

                    handgun = avatar.inventory[item_i];
                    break;

                }

            }

            if ( !handgun )
                return;

            handgun.extra_ammo += 24;

        } else if ( this.type == e.TYPES.shotgun_ammo ) {

            var shotgun = null;
            for ( item_i in avatar.inventory ) {

                if ( avatar.inventory[item_i].name == e.TYPES.shotgun ) {

                    shotgun = avatar.inventory[item_i];
                    break;

                }

            }

            if ( !shotgun )
                return;

            shotgun.extra_ammo += 4;

        } else if ( this.type == e.TYPES.health ) {

        } else if ( this.type == e.TYPES.armor ) {

        } else if ( this.type == e.TYPES.money ) {

        };

        this.picked_up = true;

    };

    e.game_object.prototype.snapshot = function() {

        return {
            id: this.id,
            t: this.type,
            p: this.position,
        };

    };
    
}( typeof exports === 'undefined' ? this.game_object = {} : exports ) );
