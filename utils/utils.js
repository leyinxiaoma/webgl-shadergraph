var overflowRegex = /(auto|scroll)/;


// <3 Modernizr
// https://raw.githubusercontent.com/Modernizr/Modernizr/master/feature-detects/dom/dataset.js
function useNative() {
    const elem = document.createElement('div');
    elem.setAttribute('data-a-b', 'c');

    return Boolean(elem.dataset && elem.dataset.aB === 'c');
}

function nativeDataset(element) {
    return element.dataset;
}

function _allKeys(obj) {
    var keys = [],
        key;
    for (key in obj) {
        keys.push(key);
    }
    return keys;
}

function extendOrMixin(objs, override) {
    var obj = objs[0],
        length = objs.length,
        source,
        index = 1,
        i,
        key,
        keys,
        l;

    if (length < 2 || obj === null) {
        return obj;
    }
    for (index; index < length; index++) {
        source = objs[index];
        keys = _allKeys(source);
        l = keys.length;

        for (i = 0; i < l; i++) {
            key = keys[i];
            if (obj[key] === void 0 || override) {
                obj[key] = source[key];
            }
        }
    }
    return obj;
}


function isNode(content) {
    return !!content && !!content.nodeType;
}


function isArrayOfNodes(content) {
    return Array.isArray(content) && content.reduce(function(previousElementWasANode, currentElement) {
        return previousElementWasANode && isNode(currentElement);
    }, true);
}


function isObject(value) {
    return (!!value && value.toString() === '[object Object]');
}


function appendChildren(parent, children) {
    if (isNode(parent)) {
        children.filter(function(child) {
            return isNode(child);
        })
            .forEach(function(childNode) {
                parent.appendChild(childNode);
            });
    }
}

function createElement(tagName, properties, children) {
    var _element = document.createElement(tagName),
        _properties = isObject(properties) ? properties : {},
        _children = Array.isArray(children) ? children : [];

    function isAttribute(string) {
        return /^attr-/.test(string);
    }

    function parseAttribute(string) {
        return string.substring('attr-'.length, string.length);
    }

    Object.keys(_properties).forEach(function(prop) {
        var value = _properties[prop];

        if (isAttribute(prop)) {
            _element.setAttribute(parseAttribute(prop), value);
        } else {
            _element[prop] = value;
        }
    });

    appendChildren(_element, _children);

    return _element;
}


function removeAllChildrenFrom(parentNode) {
    while (parentNode && parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
}

function arrayOfChildrenFrom(element) {
    if (isNode(element)) {
        return Array.prototype.slice.call(element.children);
    } else {
        return [];
    }
}

function queryChildOf(parent, selector) {
    return queryChildrenOf(parent, selector)[0] || null;
}

function queryChildrenOf(parent, selector) {
    var results = [],
        hasChild = function(child) {
            return arrayOfChildrenFrom(parent).indexOf(child) !== -1;
        };

    if (isNode(parent) && !!selector) {
        results = Array.prototype.slice.call(parent.querySelectorAll(selector));
    }

    return results.filter(hasChild);
}

function ifSafeChain(root, chain, callback) {
    var bindIfFunction = function(prevLink, prop) {
            return ((typeof prop) === 'function') ? prop.bind(prevLink) : prop;
        },
        toFinalLink = function(prevLink, propName) {
            var prop = prevLink[propName];
            return (prevLink && prop) ? bindIfFunction(prevLink, prop) : null;
        },
        finalLink = (chain || []).reduce(toFinalLink, root);

    return (callback && finalLink) ? callback(finalLink) : undefined;
}

function getFunctionName(func) {
    if (typeof func === 'function') {
        if (func.name) {
            return func.name;
        } else {
            var funcName = func.toString().match(/^function\s*([^\s(]+)/);
            return funcName ? funcName[1] : 'anonymous func';
        }
    }
}

function checkReactChildrenType(children, componentName, types, typesString) {
    var childNodes = children || [],
        i, errorFlag, currentType;
    // handle single child prop http://facebook.github.io/react/tips/children-props-type.html
    childNodes = Array.isArray(childNodes) ? childNodes : [childNodes];
    types = Array.isArray(types) ? types : [types];
    for (var child in childNodes) {
        if (childNodes[child] && childNodes[child].type) {
            errorFlag = true;
            currentType = childNodes[child].type;
            for (i = 0; i < types.length; i++) {
                if (currentType === types[i]) {
                    errorFlag = false;
                    break;
                }
            }
        }
        if (errorFlag) {
            return new Error(componentName + '\'s children can only have one instance of the following types: ' +
                typesString + '; not accept type: ' + currentType);
        }
    }
}

var Utils = {
    getTextWidth: function(text, font, canvasElement) {
        var canvas = canvasElement || document.createElement('canvas'),
            context = canvas.getContext('2d'),
            width;

        context.font = font;

        width = Math.floor(context.measureText(text).width);
        // Width may be 0, in that case we don't want to add 1 px.
        return width ? width + 1 : width;
    },

    removeNodesSafe: function(component, nodeList) {
        var removedChildNodes = [],
            nodes;

        nodes = Array.prototype.slice.apply(nodeList);
        nodes.filter(function(node) {
            return component === node.parentNode;
        }).map(function(node) {
            removedChildNodes.push(component.removeChild(node));
            if (node.render) {
                node.render();
            }
        });

        return removedChildNodes;
    },
    appendChildCollection: function(component, nodeList) {
        var idx;

        for (idx = 0; idx < nodeList.length; ++idx) {
            component.appendChild(nodeList[idx]);
        }
    },

    stopEvent: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    },

    getAnimationEventNames: function() {
        var animationstart =
                'webkitAnimationName' in document.documentElement.style ?
                    'webkitAnimationStart' : 'animationstart',
            animationend =
                'webkitAnimationName' in document.documentElement.style ?
                    'webkitAnimationEnd' : 'animationend',
            transitionend =
                'onwebkittransitionend' in window ?
                    'webkitTransitionEnd' : 'transitionend';

        return {
            animationstart: animationstart,
            animationend: animationend,
            transitionend: transitionend
        };
    },

    getComponentFromElement: function(component, targetTagName) {
        while (component && component.tagName !== targetTagName) {
            component = component.parentNode;
        }
        return component;
    },

    getComponentFromElementByClassName: function(component, className) {
        while (component && !component.classList.contains(className)) {
            component = component.parentNode;
        }
        return component;
    },

    validationRequired: function(component) {
        return component.required || component.pattern || component.validator || component.min || component.max || component.numeric || component.password || component.minDate || component.maxDate;
    },

    extend: function() {
        return extendOrMixin(Array.prototype.slice.call(arguments), false);
    },

    mixin: function() {
        return extendOrMixin(Array.prototype.slice.call(arguments), true);
    },

    stopNativeEvent: function(component, element, eventName) {
        component.listenTo(element, eventName, function(ev) {
            ev.stopPropagation();
        });
    },

    getSafeTargetFromEvent: function(event) {
        return event.relatedTarget || event.explicitOriginalTarget || document.activeElement;
    },

    getNextSiblingOfType: function(node, nodeName) {
        while ((node = node.nextSibling) && node.nodeName !== nodeName) {
        }
        return node;
    },

    getPrevSiblingOfType: function(node, nodeName) {
        while ((node = node.previousSibling) && node.nodeName !== nodeName) {
        }
        return node;
    },
    getArrayDiff: function(a, b) {
        a = a ? a : [];
        b = b ? b : [];
        return a.filter(function(item) {
            return b.indexOf(item) < 0;
        });
    },

    getDirectChildByType: function(parentNode, type) {
        var children = parentNode.children,
            child;
        Array.prototype.forEach.call(children, function(node) {
            if (node.tagName.toLowerCase() === type) {
                child = node;
            }
        });
        return child;
    },
    getScrollParent: function(node) {

        var parent = node,
            style,
            excludeStaticParent = getComputedStyle(node).position === 'absolute',
            found = false;

        do {
            parent = parent.parentElement || parent.parentNode  || parent.host;
            if (parent === null) {
                return node.ownerDocument;
            }

            if(parent.nodeName === '#document-fragment'){
                continue;
            }

            if (parent === node.ownerDocument) {
                found = true;
                continue;
            }

            style = getComputedStyle(parent);

            if (excludeStaticParent && style.position === 'static') {
                continue;
            }

            if (overflowRegex.test(style.overflow) ||
                overflowRegex.test(style.overflowX) ||
                overflowRegex.test(style.overflowY)) {
                found = true;
            }
        } while (!found);

        return parent;
    },
    throttle: function(callback, delay) {
        var ready = true;

        return function() {
            if (ready) {
                ready = false;

                setTimeout(function() {
                    ready = true;
                }, delay);

                callback.apply(this, arguments);
            }
        };
    },
    throttleDebounce: function(callback, delay) {
        var ready = true,
            args = null;

        return function throttled() {
            var context = this;

            if (ready) {
                ready = false;

                setTimeout(function() {
                    ready = true;

                    if (args) {
                        throttled.apply(context);
                    }
                }, delay);

                if (args) {
                    callback.apply(this, args);
                    args = null;
                } else {
                    callback.apply(this, arguments);
                }
            } else {
                args = arguments;
            }
        };
    },
    type: function(value) {
        /*jshint indent:false, eqnull:true*/
        switch (value == null ? '' + value : Object.prototype.toString.call(value).slice(8, -1).toLowerCase()) {
            case 'string': return String;
            case 'boolean': return Utils.YesNoType; // booleans cannot have defaults, so use this instead
            case 'number': return Number;
            case 'object': return Object;
            case 'array': return Array;
        }
    },
    updateClassWithProps: function(component, classProps) {
        if (component.classList.length > 0) {
            var props, mergedClasses, preservedClasses = [];

            if (component.supportedClasses) {
                preservedClasses = component.supportedClasses.filter(function(supportedClass) {
                    return (component.classList.contains(supportedClass) &&
                        preservedClasses.indexOf(supportedClass) === -1);
                });

                if (classProps) {
                    mergedClasses = preservedClasses.concat(classProps.split(' '));
                } else {
                    mergedClasses = preservedClasses;
                }
                return mergedClasses.join(' ').trim();

            } else {
                // TOOD: old - keeping for now for testing on multiple components
                if (classProps) {
                    props = classProps.split(' ');
                    props.forEach(function(prop) {
                        if (!component.classList.contains(prop)) {
                            component.classList.add(prop);
                        }
                    });
                }

                return component.classList.toString();
            }
        } else {
            return classProps ? classProps : '';
        }
    },

    YesNoType: {
        parse: function(attrValue) {
            return attrValue.toLowerCase() === 'yes';
        },
        stringify: function(value) {
            return value ? 'yes' : 'no';
        }
    },

    toggleSuffixText: function(text, suffixText, state) {
        if (state) {
            if (text && text.slice(-2) !== suffixText) {
                text += suffixText;
            }
        } else {
            if (text && text.slice(-2) === suffixText) {
                text = text.slice(0, -2);
            }
        }

        return text;
    },

    debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments,
                later = function() {
                    timeout = null;
                    if (!immediate) {
                        func.apply(context, args);
                    }
                },
                callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    },

    createElement: createElement,

    appendChildren: appendChildren,

    attachContentToNode: function(newValue, parentNode) {
        if (newValue) {
            if (typeof newValue === 'string') {
                parentNode.textContent = newValue;
            } else if (Array.isArray(newValue)) {
                newValue.forEach(function(value) {
                    if (value && value.nodeType) {
                        parentNode.appendChild(value);
                    }
                });
            } else {
                if (newValue.nodeType) {
                    parentNode.appendChild(newValue);
                }
            }
        }

        return parentNode;
    },

    removeAllChildrenFrom: removeAllChildrenFrom,
    wrapIfNotWrapped: function(wrapperTagName, content) {
        var wrappedContent = null,
            toLowerCase = String.prototype.toLowerCase;

        if (wrapperTagName) {
            if (isNode(content)) {
                if (toLowerCase.call(content.tagName) === toLowerCase.call(wrapperTagName)) {
                    wrappedContent = content;
                } else {
                    wrappedContent = createElement(wrapperTagName, {}, [content]);
                }
            } else if (isArrayOfNodes(content)) {
                wrappedContent = createElement(wrapperTagName, {}, content);
            }
        }

        return wrappedContent;
    },
    setAttributes: function(element, attributes) {
        var value;
        if (isNode(element) && isObject(attributes)) {
            Object.keys(attributes).forEach(function(name) {
                value = attributes[name];
                element.setAttribute(name, value);
            });
        }

        return element;
    },

    arrayOfChildrenFrom: arrayOfChildrenFrom,

    queryChildOf: queryChildOf,

    queryChildrenOf: queryChildrenOf,

    isNode: isNode,

    getFunctionName: getFunctionName,

    checkReactChildrenType: checkReactChildrenType,

    isOpen: function(popoverOrModal) {
        return popoverOrModal && (
            (popoverOrModal.nodeName === 'WC-POPOVER' && popoverOrModal.open) ||
            (popoverOrModal.nodeName === 'WC-MODAL' && popoverOrModal.classList.contains('show'))
        );
    },

    showPopoverOrModal: function(component, positionTarget, popup) {
        if (component) {
            if (this.isOpen(component)) {
                popup.setPosition(component, positionTarget, ['bottom', 'top'], ['left', 'right']);
            } else {
                popup.show(component, positionTarget, ['bottom', 'top'], ['left', 'right']);
            }
        }
    },

    replaceChildrenOf: function(parent, newContent) {
        if (isNode(parent)) {
            if (isNode(newContent)) {
                removeAllChildrenFrom(parent);
                parent.appendChild(newContent);
            } else if (isArrayOfNodes(newContent)) {
                removeAllChildrenFrom(parent);
                appendChildren(parent, newContent);
            }
        }
    },

    contentQueryFactory: function(parent, renderMapping) {
        return function renderedOrUserProvided(tagName) {
            var renderedSelector = [renderMapping[tagName], tagName].join(' > '),
                rendered = parent.querySelector(renderedSelector),
                userProvided = queryChildOf(parent, tagName);

            return rendered || userProvided;
        };
    },

    ifSafeChain: ifSafeChain,

    ifExists: function(subject, callback) {
        return ifSafeChain(subject, [], callback);
    },

    customMixin: function(dest, source, copyFunc, visited) {
        var name,
            s,
            empty = {};
        for (name in source) {
            s = source[name];
            if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                dest[name] = copyFunc ? copyFunc(s, visited) : s;
            }
        }

        return dest; // Object
    },

    clone: function(src, visited) {
        visited = visited || [];
        if (visited.indexOf(src) >= 0) {
            return null;
        }
        if (!src || typeof src !== 'object' || typeof src === 'function') {
            // null, undefined, any non-object, or function
            return src;	// anything
        }
        if (src.nodeType && 'cloneNode' in src) {
            // DOM Node
            visited.push(src);
            return src.cloneNode(true); // Node
        }
        if (src instanceof Date) {
            // Date
            return new Date(src.getTime());	// Date
        }
        if (src instanceof RegExp) {
            // RegExp
            return new RegExp(src);   // RegExp
        }
        var r;
        if (Array.isArray(src)) {
            // array
            visited.push(src);
            r = [];
        } else {
            // generic objects
            visited.push(src);
            try {
                r = src.constructor ? new src.constructor() : {};
            } catch (exception) {
                r = {};
            }
        }
        return Utils.customMixin(r, src, Utils.clone, visited);
    },

    animateScrollTo: function(element, scrollTop, duration) {
        var start = (new Date()).valueOf(),
            target = scrollTop,
            original = element.scrollTop;

        setTimeout(function animate() {
            var now = (new Date()).valueOf(),
                t = Math.min((now - start) / duration, 1);

            element.scrollTop = original + (target - original) * t;

            if (t < 1) {
                setTimeout(animate, 33);
            }
        }, 33);
    },

    hidePopoverOrModal: function(component, popup) {
        if (component.nodeName === 'WC-MODAL') {
            component.close();
        } else {
            popup.hide(component);
        }
    },

    closest: function(elem, selector) {
        if (typeof elem.closest === 'function') {
            return elem.closest(selector);
        }

        var firstChar = selector.charAt(0),
            attribute,
            value;

        if (firstChar === '[') {
            selector = selector.substr(1, selector.length - 2);
            attribute = selector.split('=');

            if (attribute.length > 1) {
                value = true;
                attribute[1] = attribute[1].replace(/"/g, '').replace(/'/g, '');
            }
        }

        for (; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {
            if (firstChar === '.') {
                if (elem.classList.contains(selector.substr(1))) {
                    return elem;
                }
            } else if (firstChar === '#') {
                if (elem.id === selector.substr(1)) {
                    return elem;
                }
            } else if (firstChar === '[' && elem.hasAttribute(attribute[0])) {
                if (value) {
                    if (elem.getAttribute(attribute[0]) === attribute[1]) {
                        return elem;
                    }
                } else {
                    return elem;
                }
            } else if (elem.tagName.toLowerCase() === selector) {
                return elem;
            }
        }

        return null;
    },
    supplant: function(template, values, pattern) {
        pattern = pattern || /\{\{([^\{\}]*)\}\}/g;
        return template.replace(pattern, function(a, b) {
            var p = b.split('.'),
                r = values;
            try {
                for (var s in p) {
                    if (p.hasOwnProperty(s) ) {
                        r = r[p[s]];
                    }
                }
            } catch (e) {
                r = a;
            }
            return (typeof r === 'string' || typeof r === 'number') ? r : a;
        });
    },

    dataset: useNative()?nativeDataset :function(element){
        const map = {};
        const attributes = element.attributes;

        function getter() {
            return this.value;
        }

        function setter(name, value) {
            if (typeof value === 'undefined') {
                this.removeAttribute(name);

            } else {
                this.setAttribute(name, value);
            }
        }

        for (let i = 0, j = attributes.length; i < j; i++) {
            const attribute = attributes[i];

            if (attribute) {
                const name = attribute.name;

                if (name.indexOf('data-') === 0) {
                    const prop = name.slice(5).replace(/-./g, u => {
                        return u.charAt(1).toUpperCase();
                    });

                    const value = attribute.value;

                    Object.defineProperty(map, prop, {
                        enumerable: true,
                        get: getter.bind({value: value || ''}),
                        set: setter.bind(element, name)
                    });
                }
            }
        }

        return map;
    },
    isObject:isObject
};

var wcUtils = window.wcUtils = window.wcUtils || {};

wcUtils.utils = Utils;