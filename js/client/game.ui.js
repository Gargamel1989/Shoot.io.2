var game_ui = function( game_core, stage, viewport, debug ) {

    this.core = game_core;
    this.stage = stage;
    this.debug = debug || true;

    this.ui_margin = 20;

    this.player_avatar = null;

    this.event_log = [];

    this.weapon_name_text = new createjs.Text( '', '20px Arial', '#FFF' );

    this.weapon_ammo_text = new createjs.Text( '', '20px Arial', '#FFF' );

    this.weapon_text_bg = new createjs.Shape();
    this.weapon_text_bg.graphics.clear().f( '#000000' ).dr( 0, 0, 300, 100 );
    this.weapon_text_bg.alpha = 0.3;
    
    this.stage.addChild( this.weapon_text_bg );
    this.stage.addChild( this.weapon_name_text );
    this.stage.addChild( this.weapon_ammo_text );


    this.sb = {
        w: 300,
        h: 100
    };
    this.scoreboard_bg = new createjs.Shape();
    this.scoreboard_bg.graphics.clear().f( '#000000' ).dr( 0, 0, this.sb.w, this.sb.h );
    this.scoreboard_bg.alpha = 0.3;

    this.scoreboard_text = new createjs.Text( '', '20px Arial', '#FFF' );
    this.scoreboard_text.textAlign = 'end';

    this.stage.addChild( this.scoreboard_bg );
    this.stage.addChild( this.scoreboard_text );



    this.el = {
        w: 300,
        h: 300,
    };
    this.eventlog_bg = new createjs.Shape();
    this.eventlog_bg.graphics.clear().f( '#000000' ).dr( 0, 0, this.el.w, this.el.h );
    this.eventlog_bg.alpha = 0.3;

    this.eventlog_text = new createjs.Text( '', '20px Arial', '#FFF' );

    this.stage.addChild( this.eventlog_bg );
    this.stage.addChild( this.eventlog_text );


    this.game_loop_debug = null;

    if ( this.debug ) {

        this.debug_bar = new createjs.Shape();
        this.debug_bar.alpha = 0.3;

        this.server_debug_text = new createjs.Text( '', '16px Courier', '#FFF' );
        this.client_debug_text = new createjs.Text( '', '16px Courier', '#FFF' );

        this.stage.addChild( this.debug_bar );
        this.stage.addChild( this.server_debug_text );
        this.stage.addChild( this.client_debug_text );

    }

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


    this.scoreboard_bg.x = x + w - this.ui_margin - this.sb.w;
    this.scoreboard_bg.y = y + this.ui_margin;

    this.scoreboard_text.x = x + w - this.ui_margin - 10;
    this.scoreboard_text.y = this.scoreboard_bg.y + 10;


    this.eventlog_bg.x = x + this.ui_margin;
    this.eventlog_bg.y = y + h - this.ui_margin - this.el.h;

    this.eventlog_text.x = this.eventlog_bg.x + 10;
    this.eventlog_text.y = this.eventlog_bg.y + 10

    if ( this.debug ) {

        this.scoreboard_bg.y += 40;
        this.scoreboard_text.y += 40;

        this.debug_bar.graphics.clear().f( '#000' ).dr( x, y, w, 40 );

        this.server_debug_text.x = x + 14;
        this.server_debug_text.y = y + 10;

        this.client_debug_text.x = x + ( w / 2 ) + 14;
        this.client_debug_text.y = y + 10;

    }

};

game_ui.prototype.update = function( dt ) {

    if ( this.player_avatar !== null ) {

        var e = this.player_avatar.equiped_weapon;

        this.weapon_name_text.text = e.name;

        if ( e.loaded_ammo !== undefined ) {

            this.weapon_ammo_text.text = e.loaded_ammo + '/' + e.max_loaded_ammo + ' (' + e.extra_ammo + ')';

        } else {

            this.weapon_ammo_text.text = '';

        }

    }

    var top_ten_scores = Object.keys( this.core.avatars ).map( function( avatar_id ) {
        return this.core.avatars[avatar_id];
    }.bind( this ) ).sort( function( avatar ) { 
        return avatar.score; 
    } ).slice( 0, 10 );

    this.scoreboard_text.text = top_ten_scores.map( function( avatar, i ) { return '#' + ( i + 1 ) + ': ' + avatar.nickname + '\t\t' + avatar.score; } ).join( '\n' );

    this.eventlog_text.text = this.event_log.slice( -10 ).join( '\n' );

    if ( this.debug ) {

        if ( this.server_game_loop_debug )
            this.server_debug_text.text = 'begin: ' + this.server_game_loop_debug.dt_begin + ' update: ' + this.server_game_loop_debug.dt_update + ' draw: ' + this.server_game_loop_debug.dt_draw + ' upf: ' + this.server_game_loop_debug.updates_per_frame;

        if ( this.client_game_loop_debug )
            this.client_debug_text.text = 'begin: ' + this.client_game_loop_debug.dt_begin + ' update: ' + this.client_game_loop_debug.dt_update + ' draw: ' + this.client_game_loop_debug.dt_draw + ' upf: ' + this.client_game_loop_debug.updates_per_frame;

    }

};
