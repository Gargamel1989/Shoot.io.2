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

    e.v_angle_between = function( v1, v2 ) {
        return Math.acos( e.v_dot( v1, v2 ) / ( e.v_mag( v1 ) * e.v_mag( v2 ) ) );
    };

    e.v_cart = function( magnitude, angle ) {
        return { x: magnitude * Math.cos( angle ), y: magnitude * Math.sin( angle ) };
    };

    e.v_dot = function( v1, v2 ) {
        return ( v1.x * v2.x ) + ( v1.y * v2.y );
    };

    e.v_mag = function( v ) {
        return Math.sqrt( e.v_dot( v, v ) );
    };

    e.v_mul_scalar = function( v, scalar ) {
        return { x: v.x * scalar, y: v.y * scalar };
    };

    e.v_sub = function( v1, v2 ) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    };



    e.collision_test_circles = function( circle1, circle2 ) {
        return e.v_mag( e.v_sub( circle2, circle1 ) ) <= ( circle1.r + circle2.r );
    };

    e.collision_test_circle_rect = function( circle, rect ) {

        var dist_x = Math.abs( circle.x - rect.x - ( rect.w / 2 ) );
        var dist_y = Math.abs( circle.y - rect.y - ( rect.h / 2 ) );

        if ( dist_x > ( ( rect.w / 2 ) + circle.r ) )
            return false;

        if ( dist_y > ( ( rect.h / 2 ) + circle.r ) )
            return false;

        if ( dist_x <= ( rect.w / 2 ) )
            return true;

        if ( dist_y <= ( rect.h / 2 ) )
            return true;

        var d_x = dist_x - ( rect.w / 2 );
        var d_y = dist_y - ( rect.h / 2 );

        return ( ( d_x * d_x ) + ( d_y * d_y ) <= ( circle.r * circle.r ) );

    }

}( typeof exports === 'undefined' ? this.f = {} : exports ) );
