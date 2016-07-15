var game_ui = function( game_core, stage, viewport, debug ) {

    this.core = game_core;
    this.stage = stage;
    this.debug = debug || true;

    this.ui_margin = 20;

    this.player_avatar = null;

    this.weapon_name_text = new createjs.Text( '', '20px Arial', '#FFF' );

    this.weapon_ammo_text = new createjs.Text( '', '20px Arial', '#FFF' );

    this.weapon_text_bg = new createjs.Shape();
    this.weapon_text_bg.graphics.clear().f( '#000000' ).dr( 0, 0, 300, 100 );
    this.weapon_text_bg.alpha = 0.3;
    
    this.stage.addChild( this.weapon_text_bg );
    this.stage.addChild( this.weapon_name_text );
    this.stage.addChild( this.weapon_ammo_text );

};

game_ui.prototype.set_player_avatar = function( player_avatar ) {

    this.player_avatar = player_avatar;

};

game_ui.prototype.set_viewport = function( x, y, w, h ) {

    this.weapon_text_bg.x = x + w - this.ui_margin - 300;
    this.weapon_text_bg.y = y + h - this.ui_margin - 100;

    this.weapon_name_text.x = this.weapon_text_bg.x + 10;
    this.weapon_name_text.y = this.weapon_text_bg.y + 10;

    this.weapon_ammo_text.x = this.weapon_text_bg.x + 10;
    this.weapon_ammo_text.y = this.weapon_text_bg.y + 40;

};

game_ui.prototype.update = function( dt ) {

    if ( this.player_avatar !== null ) {

        var e = this.player_avatar.equiped_weapon;

        this.weapon_name_text.text = e.name;

        if ( e.loaded_ammo ) {

            this.weapon_ammo_text.text = e.loaded_ammo + '/' + e.max_loaded_ammo + '(' + e.extra_ammo + ')';
            this.weapon_ammo_text.text = e.name

        } else {

            this.weapon_ammo_text = '';

        }

    }

};
