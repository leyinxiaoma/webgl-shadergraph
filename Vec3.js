var Vec3 = function(x, y, z) {
    if (x && x.length === 3) {
        this.data = new Float32Array(x);
        return;
    }

    this.data = new Float32Array(3);

    this.data[0] = x || 0;
    this.data[1] = y || 0;
    this.data[2] = z || 0;
};

Vec3.prototype = {
    add: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] += b[0];
        a[1] += b[1];
        a[2] += b[2];

        return this;
    },

    add2: function (lhs, rhs) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] + b[0];
        r[1] = a[1] + b[1];
        r[2] = a[2] + b[2];

        return this;
    },

    clone: function () {
        return new Vec3().copy(this);
    },

    copy: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];

        return this;
    },

    cross: function (lhs, rhs) {
        var a, b, r, ax, ay, az, bx, by, bz;

        a = lhs.data;
        b = rhs.data;
        r = this.data;

        ax = a[0];
        ay = a[1];
        az = a[2];
        bx = b[0];
        by = b[1];
        bz = b[2];

        r[0] = ay * bz - by * az;
        r[1] = az * bx - bz * ax;
        r[2] = ax * by - bx * ay;

        return this;
    },

    dot: function (rhs) {
        var a = this.data,
            b = rhs.data;

        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },

    equals: function (rhs) {
        var a = this.data,
            b = rhs.data;

        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    },

    length: function () {
        var v = this.data;

        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },


    lengthSq: function () {
        var v = this.data;

        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    },

    lerp: function (lhs, rhs, alpha) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] + alpha * (b[0] - a[0]);
        r[1] = a[1] + alpha * (b[1] - a[1]);
        r[2] = a[2] + alpha * (b[2] - a[2]);

        return this;
    },

    mul: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] *= b[0];
        a[1] *= b[1];
        a[2] *= b[2];

        return this;
    },

    mul2: function (lhs, rhs) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] * b[0];
        r[1] = a[1] * b[1];
        r[2] = a[2] * b[2];

        return this;
    },

    normalize: function () {
        var v = this.data;

        var lengthSq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
        if (lengthSq > 0) {
            var invLength = 1 / Math.sqrt(lengthSq);
            v[0] *= invLength;
            v[1] *= invLength;
            v[2] *= invLength;
        }

        return this;
    },


    project: function (rhs) {
        var a = this.data;
        var b = rhs.data;
        var a_dot_b = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        var b_dot_b = b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
        var s = a_dot_b / b_dot_b;
        a[0] = b[0] * s;
        a[1] = b[1] * s;
        a[2] = b[2] * s;
        return this;
    },


    scale: function (scalar) {
        var v = this.data;

        v[0] *= scalar;
        v[1] *= scalar;
        v[2] *= scalar;

        return this;
    },


    set: function (x, y, z) {
        var v = this.data;

        v[0] = x;
        v[1] = y;
        v[2] = z;

        return this;
    },


    sub: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] -= b[0];
        a[1] -= b[1];
        a[2] -= b[2];

        return this;
    },


    sub2: function (lhs, rhs) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] - b[0];
        r[1] = a[1] - b[1];
        r[2] = a[2] - b[2];

        return this;
    },

    toString: function () {
        return "[" + this.data[0] + ", " + this.data[1] + ", " + this.data[2] + "]";
    }
};


Object.defineProperty(Vec3.prototype, 'x', {
    get: function () {
        return this.data[0];
    },
    set: function (value) {
        this.data[0] = value;
    }
});


Object.defineProperty(Vec3.prototype, 'y', {
    get: function () {
        return this.data[1];
    },
    set: function (value) {
        this.data[1] = value;
    }
});


Object.defineProperty(Vec3.prototype, 'z', {
    get: function () {
        return this.data[2];
    },
    set: function (value) {
        this.data[2] = value;
    }
});


Object.defineProperty(Vec3, 'BACK', {
    get: (function () {
        var back = new Vec3(0, 0, 1);
        return function () {
            return back;
        };
    }())
});


Object.defineProperty(Vec3, 'DOWN', {
    get: (function () {
        var down = new Vec3(0, -1, 0);
        return function () {
            return down;
        };
    }())
});


Object.defineProperty(Vec3, 'FORWARD', {
    get: (function () {
        var forward = new Vec3(0, 0, -1);
        return function () {
            return forward;
        };
    }())
});


Object.defineProperty(Vec3, 'LEFT', {
    get: (function () {
        var left = new Vec3(-1, 0, 0);
        return function () {
            return left;
        };
    }())
});


Object.defineProperty(Vec3, 'ONE', {
    get: (function () {
        var one = new Vec3(1, 1, 1);
        return function () {
            return one;
        };
    }())
});


Object.defineProperty(Vec3, 'RIGHT', {
    get: (function () {
        var right = new Vec3(1, 0, 0);
        return function () {
            return right;
        };
    }())
});


Object.defineProperty(Vec3, 'UP', {
    get: (function () {
        var down = new Vec3(0, 1, 0);
        return function () {
            return down;
        };
    }())
});


Object.defineProperty(Vec3, 'ZERO', {
    get: (function () {
        var zero = new Vec3(0, 0, 0);
        return function () {
            return zero;
        };
    }())
});