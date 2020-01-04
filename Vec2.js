var Vec2 = function (x, y) {
    if (x && x.length === 2) {
        this.data = new Float32Array(x);
        return;
    }

    this.data = new Float32Array(2);

    this.data[0] = x || 0;
    this.data[1] = y || 0;
};

Vec2.prototype = {
    add: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] += b[0];
        a[1] += b[1];

        return this;
    },
    add2: function (lhs, rhs) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] + b[0];
        r[1] = a[1] + b[1];

        return this;
    },

    clone: function () {
        return new Vec2().copy(this);
    },

    copy: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] = b[0];
        a[1] = b[1];

        return this;
    },

    dot: function (rhs) {
        var a = this.data,
            b = rhs.data;

        return a[0] * b[0] + a[1] * b[1];
    },

    equals: function (rhs) {
        var a = this.data,
            b = rhs.data;

        return a[0] === b[0] && a[1] === b[1];
    },

    length: function () {
        var v = this.data;

        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    },

    lengthSq: function () {
        var v = this.data;

        return v[0] * v[0] + v[1] * v[1];
    },


    lerp: function (lhs, rhs, alpha) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] + alpha * (b[0] - a[0]);
        r[1] = a[1] + alpha * (b[1] - a[1]);

        return this;
    },

    mul: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] *= b[0];
        a[1] *= b[1];

        return this;
    },

    mul2: function (lhs, rhs) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] * b[0];
        r[1] = a[1] * b[1];

        return this;
    },

    normalize: function () {
        var v = this.data;

        var lengthSq = v[0] * v[0] + v[1] * v[1];
        if (lengthSq > 0) {
            var invLength = 1 / Math.sqrt(lengthSq);
            v[0] *= invLength;
            v[1] *= invLength;
        }

        return this;
    },

    scale: function (scalar) {
        var v = this.data;

        v[0] *= scalar;
        v[1] *= scalar;

        return this;
    },

    set: function (x, y) {
        var v = this.data;

        v[0] = x;
        v[1] = y;

        return this;
    },

    sub: function (rhs) {
        var a = this.data,
            b = rhs.data;

        a[0] -= b[0];
        a[1] -= b[1];

        return this;
    },

    sub2: function (lhs, rhs) {
        var a = lhs.data,
            b = rhs.data,
            r = this.data;

        r[0] = a[0] - b[0];
        r[1] = a[1] - b[1];

        return this;
    },

    toString: function () {
        return "[" + this.data[0] + ", " + this.data[1] + "]";
    }
};


Object.defineProperty(Vec2.prototype, 'x', {
    get: function () {
        return this.data[0];
    },
    set: function (value) {
        this.data[0] = value;
    }
});


Object.defineProperty(Vec2.prototype, 'y', {
    get: function () {
        return this.data[1];
    },
    set: function (value) {
        this.data[1] = value;
    }
});

Object.defineProperty(Vec2, 'ONE', {
    get: (function () {
        var one = new Vec2(1, 1);
        return function () {
            return one;
        };
    }())
});

Object.defineProperty(Vec2, 'RIGHT', {
    get: (function () {
        var right = new Vec2(1, 0);
        return function () {
            return right;
        };
    }())
});

Object.defineProperty(Vec2, 'UP', {
    get: (function () {
        var down = new Vec2(0, 1);
        return function () {
            return down;
        };
    }())
});

Object.defineProperty(Vec2, 'ZERO', {
    get: (function () {
        var zero = new Vec2(0, 0);
        return function () {
            return zero;
        };
    }())
});