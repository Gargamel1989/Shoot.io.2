// Utility functions
( function( e ) {

    e.mod = function( n, m ) {
        return ( ( n % m ) + m ) % m;
    };

    e.v_add = function( v1, v2 ) {
        return { x: v1.x + v2.x, y: v1.y + v2.y };
    };

    e.v_angle = function( v ) {
        return Math.atan2( v.y, v.x );
    };

    e.v_mag = function( v ) {
        return Math.sqrt( v.x * v.x + v.y * v.y );
    };

    e.v_mul_scalar = function( v, scalar ) {
        return { x: v.x * scalar, y: v.y * scalar };
    };

    e.v_sub = function( v1, v2 ) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    };

}( typeof exports === 'undefined' ? this.f = {} : exports ) );
