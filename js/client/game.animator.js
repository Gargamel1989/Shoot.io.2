var game_animator = function( camera, avatar, debug ) {

	this.camera = camera;
	this.stage = this.camera.stage;
	
	this.avatar = avatar;
    this.last_equiped_weapon_name = null;

	this.debug = debug || true;

    this.weapon_sprites = {
        knife_sprite: new createjs.Sprite( assets.getResult( 'body_knife' ), 'idle' ),
        handgun_sprite: new createjs.Sprite( assets.getResult( 'body_handgun' ), 'idle' ),
        shotgun_sprite: new createjs.Sprite( assets.getResult( 'body_shotgun' ), 'idle' ),
        rifle_sprite: new createjs.Sprite( assets.getResult( 'body_rifle' ), 'idle' ),
    };

    this.sprite_scale = 0.3;

    this.feet_sprite = new createjs.Sprite( assets.getResult( 'feet' ), 'backstep' );
    this.feet_sprite.scaleX = this.sprite_scale;
    this.feet_sprite.scaleY = this.sprite_scale;

    this.body_sprite = this.weapon_sprites.knife_sprite;
    this.body_sprite.scaleX = this.sprite_scale;
    this.body_sprite.scaleY = this.sprite_scale;

    this.health_bar_width = 50;
    this.health_bar_height = 5;
    this.health_bar_margin = 2;
    this.health_bar_offset = -40;

    this.health_bar_wrapper = new createjs.Shape();
    this.health_bar_wrapper.graphics.clear().f( 'black' ).dr( 0, 0, this.health_bar_width + ( 2 * this.health_bar_margin ), this.health_bar_height + ( 2 * this.health_bar_margin ) );

    this.health_bar = new createjs.Shape();
    this.health_bar.graphics.clear().f( 'red' ).dr( 0, 0, this.health_bar_width, this.health_bar_height );

    if ( this.debug ) {

        this.debug_position = new createjs.Shape();
        this.debug_position.graphics.clear().f( 'red' ).dc( 0, 0, 20 );
        
        this.stage.addChild( this.debug_position );
    }

	this.visible = true;
    this.stage.addChild( this.feet_sprite );
    this.stage.addChild( this.body_sprite );
    this.stage.addChild( this.health_bar_wrapper );
    this.stage.addChild( this.health_bar );

};

game_animator.prototype.destroy = function() {

    this.stage.removeChild( this.feet_sprite );
    this.stage.removeChild( this.body_sprite );
    this.stage.removeChild( this.health_bar_wrapper );
    this.stage.removeChild( this.health_bar );

    if ( this.debug ) {

        this.stage.removeChild( this.debug_position );

    }

};

game_animator.prototype.update = function( dt ) {

	if ( !this.visible )
		return

    if ( this.last_equiped_weapon_name != this.avatar.equiped_weapon.name ) {

        this.stage.removeChild( this.body_sprite );

        switch ( this.avatar.equiped_weapon.name ) {

            case 'Knife':
                this.body_sprite = this.weapon_sprites.knife_sprite;
                break;

            case 'Handgun':
                this.body_sprite = this.weapon_sprites.handgun_sprite;
                break;

            case 'Shotgun':
                this.body_sprite = this.weapon_sprites.shotgun_sprite;
                break;

            case 'Rifle':
                this.body_sprite = this.weapon_sprites.rifle_sprite;
                break;

        }

        this.body_sprite.scaleX = this.sprite_scale;
        this.body_sprite.scaleY = this.sprite_scale;

        this.stage.addChild( this.body_sprite );

    }

    var camera_position = this.camera.world_to_camera_coordinates( this.avatar.position.x, this.avatar.position.y );

    this.feet_sprite.x = camera_position.x;
    this.feet_sprite.y = camera_position.y;
    this.feet_sprite.rotation = 360 * this.avatar.direction / ( 2 * Math.PI );

    this.body_sprite.x = camera_position.x;
    this.body_sprite.y = camera_position.y;
    this.body_sprite.rotation = this.feet_sprite.rotation;

    this.health_bar_wrapper.x = camera_position.x - ( this.health_bar_width / 2 ) - this.health_bar_margin; 
    this.health_bar_wrapper.y = camera_position.y + this.health_bar_offset;

    this.health_bar.x = camera_position.x - ( this.health_bar_width / 2 );
    this.health_bar.y = camera_position.y + this.health_bar_offset + this.health_bar_margin;
    this.health_bar.scaleX = this.avatar.health / this.avatar.max_health;

    if ( this.debug ) {

        this.debug_position.x = this.feet_sprite.x;
        this.debug_position.y = this.feet_sprite.y;
            
    }

    var wanted_animation;
    if ( this.avatar.movement_speed_vector ) {

        // Animate the sprite according to avatar movement
        if ( this.avatar.movement_speed_vector.x < 0 )
            wanted_animation = 'backstep';

        else if ( this.avatar.movement_speed_vector.y > 0 && this.avatar.movement_speed_vector.x < this.avatar.movement_speed_vector.y )
            wanted_animation = 'strafe_left';

        else if ( this.avatar.movement_speed_vector.y < 0 && this.avatar.movement_speed_vector.x < -this.avatar.movement_speed_vector.y )
            wanted_animation = 'strafe_right';

        else if ( f.v_mag( this.avatar.movement_speed_vector ) > 0.001 )
            wanted_animation = 'run';

        else
            wanted_animation = 'idle';

    } else
        wanted_animation = 'idle';
    
    if ( this.feet_sprite.currentAnimation != wanted_animation )
        this.feet_sprite.gotoAndPlay( wanted_animation );
    
    if ( this.avatar.equiped_weapon.name == 'Knife' ) {

        if ( this.avatar.equiped_weapon.state == this.avatar.equiped_weapon.STATES.attacking )
            wanted_animation = 'attack';

        else if ( f.v_mag( this.avatar.movement_speed_vector ) > 0.001 )
            wanted_animation = 'run';

        else
            wanted_animation = 'idle';

    }

    if ( this.body_sprite.currentAnimation != wanted_animation )
        this.body_sprite.gotoAndPlay( wanted_animation );

};
