function matches(node, selector, contextNode) {
    /* istanbul ignore next */
    var matchesSelector = node.matches || node.webkitMatchesSelector || node.mozMatchesSelector || node.msMatchesSelector;

    while (node && node.nodeType === 1 && node !== contextNode) {
        if (matchesSelector.call(node, selector)) {
            return node;
        } else {
            node = node.parentNode;
        }
    }
    return false;
}

function matchesSelectorListener(selector, listener, contextNode) {
    return function(e) {
        var matchesTarget = matches(e.target, selector, contextNode);
        if (matchesTarget) {
            listener(e, matchesTarget);
        }
    };
}

function off(target, name, callback, useCapture) {
    target.removeEventListener(name, callback, !!useCapture);
}

function on(target, name, callback, useCapture) {
    var selector = name.match(/(.*):(.*)/);

    if (selector) {
        name = selector[2];
        selector = selector[1];
        callback = matchesSelectorListener(selector, callback, target);
    }

    target.addEventListener(name, callback, !!useCapture);

    return {
        remove: function() {
            return off(target, name, callback, useCapture);
        }
    };
}

function emit(target, eventName, eventObject) {
    var event;

    eventObject = eventObject || {};

    /* istanbul ignore else */
    if (!('bubbles' in eventObject)) {
        eventObject.bubbles = true;
    }

    /* istanbul ignore else */
    if (!('cancelable' in eventObject)) {
        eventObject.cancelable = false;
    }

    if (target.emit) {
        target.emit(eventName, eventObject);
    } else {
        event = document.createEvent('UIEvent');
        event.initUIEvent(eventName, eventObject.bubbles, eventObject.cancelable, window, 1);
        Object.keys(eventObject).forEach(function(eventProperty) {
            if (!(eventProperty in {bubbles: 1, cancelable: 1})) {
                event[eventProperty] = eventObject[eventProperty];
            }
        });
        target.dispatchEvent(event);
    }
}

const eventUtil = {
    on,
    off,
    emit
};

window.eventUtil = eventUtil;

