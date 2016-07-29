( function( e ) {

    e.game_map = function( tmx_map_data ) {

        var oParser = new DOMParser();
        this.tmx = oParser.parseFromString( tmx_map_data, 'text/xml' ).documentElement;

    };

    e.game_map.prototype.size = function() {

        return {
            width: this.tmx.getAttribute( 'width' ) * this.tmx.getAttribute( 'tilewidth' ),
            height: this.tmx.getAttribute( 'height' ) * this.tmx.getAttribute( 'tileheight' ),
        };

    };

}( typeof exports === 'undefined' ? this.game_map = {} : exports ) );
