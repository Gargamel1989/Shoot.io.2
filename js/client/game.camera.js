var game_camera = function( game_core ) {

    this.core = game_core;

    // Viewport size
    this.viewport_size = {
        width: 1024,
        height: 786,
    };
    this.viewport = document.getElementById( 'viewport' );
    //this.viewport.style.width = this.viewport_size.width + 'px';
    //this.viewport.style.height = this.viewport_size.height + 'px';
    
    this.stage = new createjs.Stage( this.viewport );

    this.world_position = { x: 0, y: 0 };

    this.object_to_follow = null;

    this.sprites = {};

};

game_camera.prototype.camera_to_world_coordinates = function( cam_x, cam_y ) {

    return {
        x: this.world_position.x + cam_x,
        y: this.world_position.y + cam_y,
    };

};

game_camera.prototype.world_to_camera_coordinates = function( world_x, world_y ) {
    
    return {
        x: world_x - this.world_position.x,
        y: world_y - this.world_position.y,
    };

};

game_camera.prototype.follow = function( object_to_follow ) {

    this.object_to_follow = object_to_follow;

};

game_camera.prototype.update = function( dt ) {
    
    if ( this.object_to_follow !== null ) {

        this.world_position.x = this.object_to_follow.position.x - ( this.viewport_size.width / 2 );
        this.world_position.y = this.object_to_follow.position.y - ( this.viewport_size.height / 2 );

    }

    for ( player_id in this.core.avatars ) {
        
        if ( !this.sprites[player_id] ) {

            var a = this.core.avatars[player_id];
            var a_p = this.world_to_camera_coordinates( a.position.x, a.position.y );
            var c = new createjs.Shape();
            c.graphics.beginFill('red').drawCircle(0, 0, 10);
            this.stage.addChild(c);

            this.sprites[player_id] = c;

        }

    }

    for ( player_id in this.sprites ) {

        if ( !this.core.avatars[player_id] )
            delete this.sprites[player_id];

        var sprite = this.sprites[player_id];
        var avatar = this.core.avatars[player_id];

        var camera_position = this.world_to_camera_coordinates( avatar.position.x, avatar.position.y );
        
        
//        sprite.x = camera_position.x;
  //      sprite.y = camera_position.y;
  sprite.y = 100;
        sprite.angle = 360 * avatar.direction / ( 2 * Math.PI );
        console.log(sprite.x, sprite.y);
    };

};

game_camera.prototype.draw = function() {

    this.stage.update();

};
