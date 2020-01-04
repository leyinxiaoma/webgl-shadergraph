var matchesSelector = (function() {
    var matcher =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    return function(root, element, selector) {
        return (element.parentElement === null || element.parentElement === root) && matcher.call(element, selector);
    };
})();

function pause(observer) {
    observer.disconnect();
}

function resume(observer, root, properties) {
    observer.observe(root, properties);
}

function _observe(root, observerProperties, matcher, callback) {
    var observer = new MutationObserver(function(mutations) {
        var doesMatch = false,
            i;

        for (i = 0; i < mutations.length; i++) {
            if (matcher(mutations[i])) {
                doesMatch = true;
                break;
            }
        }

        if (doesMatch) {
            pause(observer);
            callback(mutations);
            resume(observer, root, observerProperties);
        }
    });

    observer.observe(root, observerProperties);

    return {
        remove: function() {
            observer.disconnect();
        },
        pauses: 0,
        pause: function() {
            if (!this.pauses) {
                pause(observer);
            }
            this.pauses++;
        },
        resume: function() {
            this.pauses = Math.max(0, this.pauses - 1);
            if (!this.pauses) {
                resume(observer, root, observerProperties);
            }
        }
    };
}

/**
 * Observe an element for changes to its content. Content changes would be any change in
 * an element that is a descendant of the `root` element (including text nodes). The
 * callback function is called from the `root` context.
 *
 * @param {HTMLElement} root            The node to monitor for content changes
 * @param {Function}    callback        A function to call when changes are detected.
 * @returns {{remove, pause, resume}|*} An object containing methods for managing the observer lifecycle
 */
function observeContent(root, callback) {
    return _observe(root, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true
    }, function(mutation) {
        // attribute modifications to the node we are watching don't count
        return !(mutation.type === 'attributes' && mutation.target === root);
    }, function() {
        callback.call(root);
    });
}

/**
 * Observe an element for changes to children that match a particular CSS selector. To
 * increase performance, only additions/removals/attribute changes to the elements child list are monitored.
 * The callback function is called from the `root` context with an array of elements that match the selector as the
 * only parameter.
 *
 * @param {HTMLElement} root            The node to monitor for element changes
 * @param {string}      selector        A CSS selector specifying what nodes to watch
 * @param {Function}    callback        A function to call when changes are detected
 * @returns {{remove, pause, resume}|*} An object containing methods for managing the observer lifecycle
 */
function observeElements(root, selector, callback) {
    return _observe(root, {
        childList: true,
        characterData: false,
        subtree: true,
        attributes: true
    }, function(mutation) {
        var i;

        if (mutation.type === 'childList' && mutation.target === root) {
            if (mutation.addedNodes.length > 0) {
                for (i = 0; i < mutation.addedNodes.length; i++) {
                    if (matchesSelector(root, mutation.addedNodes[i], selector)) {
                        return true;
                    }
                }
            }

            if (mutation.removedNodes.length > 0) {
                for (i = 0; i < mutation.removedNodes.length; i++) {
                    if (matchesSelector(root, mutation.removedNodes[i], selector)) {
                        return true;
                    }
                }
            }
        } else if (mutation.type === 'attributes' && matchesSelector(root, mutation.target, selector)) {
            return true;
        }

        return false;
    }, function() {
        var elements = [];

        Array.prototype.slice.call(root.querySelectorAll(selector), 0).forEach(function(element) {
            if (element.parentElement === root) {
                elements.push(element);
            }
        });

        callback.call(root, elements);
    });
}

/**
 * Update an object property when the contents of a DOM node change. This method
 * is a continence wrapper for `observeContentChanges`.
 *
 * @param {HTMLElement} node        The node in which to watch for content changes
 * @param {Object}      object      The object whose property will get updated
 * @param {string}      property    The name of the property to update
 * @param {Function}    valueFn     A function that returns a value that the property will be set to
 */
function bindContentChanges(node, object, property, valueFn) {
    var value = valueFn();

    if (object[property] !== value) {
        object[property] = value;
    }

    return observeContent(node, function() {
        object[property] = valueFn();
    });
}

function areNodesDifferent(list1, list2) {
    if (list1.length !== list2.length) {
        return true;
    }

    for (var i = 0; i < list1.length; i++) {
        if (!list1[i].isEqualNode(list2[i])) {
            return true;
        }
    }

    return false;
}

function bindChildrenChanges(node, selector, object, property) {
    var existingNodes = [];

    Array.prototype.slice.call(node.querySelectorAll(selector), 0).forEach(function(element) {
        if (element.parentElement === node) {
            existingNodes.push(element);
        }
    });

    if (areNodesDifferent(existingNodes, object[property])) {
        object[property] = existingNodes;
    }

    return observeElements(node, selector, function(newNodes) {
        object[property] = newNodes;
    });
}

const domObservable =  {
    observeContentChanges: observeContent,
    observeElementChanges: observeElements,
    bindContentChanges: bindContentChanges,
    bindChildrenChanges: bindChildrenChanges
};


window.domObservable = domObservable