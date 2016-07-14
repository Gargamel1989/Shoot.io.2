var game_animator = function( camera, avatar, debug ) {

	this.camera = camera;
	this.stage = this.camera.stage;
	
	this.avatar = avatar;

	this.debug = debug || true;

    this.feet_sprite = new createjs.Sprite( assets.getResult( 'feet' ), 'idle' );
    this.feet_sprite.scaleX = 0.3;
    this.feet_sprite.scaleY = 0.3;

    this.body_sprite = new createjs.Sprite( assets.getResult( 'body_knife' ), 'idle' );
    this.body_sprite.scaleX = 0.3;
    this.body_sprite.scaleY = 0.3;

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

    var camera_position = this.camera.world_to_camera_coordinates( this.avatar.position.x, this.avatar.position.y );

    this.feet_sprite.x = camera_position.x;
    this.feet_sprite.y = camera_position.y;
    this.feet_sprite.rotation = 360 * this.avatar.direction / ( 2 * Math.PI );

    this.body_sprite.x = camera_position.x;
    this.body_sprite.y = camera_position.y;

    this.health_bar_wrapper.x = camera_position.x - ( this.health_bar_width / 2 ) - this.health_bar_margin; 
    this.health_bar_wrapper.y = camera_position.y + this.health_bar_offset;

    this.health_bar.x = camera_position.x - ( this.health_bar_width / 2 );
    this.health_bar.y = camera_position.y + this.health_bar_offset + this.health_bar_margin;
    this.health_bar.scaleX = this.avatar.health / this.avatar.max_health;

    if ( this.debug ) {

        this.debug_position.x = this.feet_sprite.x;
        this.debug_position.y = this.feet_sprite.y;
            
    }
    
};
