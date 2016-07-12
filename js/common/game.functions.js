( function( e ) {

    e.v_mag = function( v ) {
        
        var sum = 0;

        for ( attr in v )
            sum += v[attr] * v[attr];

        return Math.sqrt( sum );

    };

    e.v_sub = function( v1, v2 ) {

        v_res = {};

        for ( attr in v1 )
            v_res[attr] = v1[attr] - v2[attr];

        return v_res;
    
    };

}( typeof exports === 'undefined' ? this.f = {} : exports ) );
