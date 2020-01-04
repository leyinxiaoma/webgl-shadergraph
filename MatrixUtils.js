function transformPoints(matrix,_in,out){
    if (out == null) out = new Vec2();
    out.x = matrix.a * _in.x + matrix.c * _in.y + matrix.tx;
    out.y = matrix.d * _in.y + matrix.b * _in.x + matrix.ty;
    return out;
}


function toMatrix(_matrix){
    return {
        a:_matrix[0],
        b:_matrix[1],
        c:_matrix[2],
        d:_matrix[3],
        tx:_matrix[4],
        ty:_matrix[5],
    }
}
function prependMatrix(base, prep) {
    return [base.a * prep.a + base.c * prep.b,
        base.b * prep.a + base.d * prep.b,
        base.a * prep.c + base.c * prep.d,
        base.b * prep.c + base.d * prep.d,
        base.tx + base.a * prep.tx + base.c * prep.ty,
        base.ty + base.b * prep.tx + base.d * prep.ty];
}


var getmat = () => {

    var mat = [1,0,0,1,0,0];
    return {
        'translate': function (x, y) {
            mat[4] = mat[0] * x + mat[2] * y + mat[4];
            mat[5] = mat[1] * x + mat[3] * y + mat[5];
            return this;
        },
        'scale': function (x, y) {
            mat[0] = mat[0] * x;
            mat[1] = mat[1] * x;
            mat[2] = mat[2] * y;
            mat[3] = mat[3] * y;
            return this;
        },
        'rotation': function (r) {
            var a = mat[0],
                b = mat[1],
                c = mat[2],
                d = mat[3],
                sr = Math.sin(r),
                cr = Math.cos(r);

            mat[0] = a * cr + c * sr;
            mat[1] = b * cr + d * sr;
            mat[2] = a * -sr + c * cr;
            mat[3] = b * -sr + d * cr;
            return this;
        },
        'prematrix':function(_mat){
            mat[0] =_mat[0];
            mat[1] =_mat[1];
            mat[2] =_mat[2];
            mat[3] =_mat[3];
            mat[4] =_mat[4];
            mat[5] =_mat[5];

            return this;
        },
        'matrix':function(){
            return [mat[0],mat[1],mat[2],mat[3],mat[4],mat[5]];
        }
    }
};