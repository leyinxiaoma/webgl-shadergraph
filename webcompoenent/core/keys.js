const keys = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SPACEBAR: 32,
    ESCAPE: 27,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    MINUS: 189,
    EQUALS: 187,
    NUM_PAD_MINUS: 109,
    NUM_PAD_PLUS: 107,
    H: 72,
    K: 75,
    M: 77,
    R: 82,
    T: 84,
    W: 87,
    Y: 89,
    isLetter: function(keycode) {
        return (keycode > 64 && keycode < 91);
    },
    isNumber: function(keycode) {
        return ((keycode > 47 && keycode < 58) || (keycode > 95 && keycode < 106));
    },
    isSpecialChar: function(keycode) {
        return ((keycode > 106 && keycode < 112) || (keycode > 185 && keycode < 223));
    }
};

window.keys= keys;