;(function(window){

    var a11y,
        _elementsFocusable = [
            'INPUT',
            'SELECT',
            'BUTTON',
            'TEXTAREA',
            'A',
            'AREA',
            'OBJECT'
        ];

    function _stopEvt(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    function _firstElementKeydownHandler(event, component) {
        if (event.shiftKey) {
            component.focus();
        }
    }

    function _lastElementBlurKeydownHandler(event, component) {
        if (!event.shiftKey) {
            component.focus();
        }
    }

    function _getTabIndex(elem) {
        if (elem.hasAttribute('tabIndex')) {
            return +elem.getAttribute('tabIndex');
        } else {
            return _elementsFocusable.indexOf(elem.tagName) > -1 ? 0 : undefined;
        }
    }

    function _isHidden(elem, component) {
        var isHidden,
            styles;
        if (component) {
            isHidden = false;
            do {
                isHidden = elem.style.display === 'none' || elem.style.visibility === 'hidden' ||
                    elem.classList.contains('hidden');
                elem = elem.parentElement;
            } while (elem && elem !== component && !isHidden);
            return isHidden;
        } else {
            styles = window.getComputedStyle(elem);
            return ((styles.display && styles.display === 'none') || (styles.visibility && styles.visibility === 'hidden'));
        }
    }

    a11y = {
        getBoundariesTabableElement: function(component, last, displayedOnly) {
            var elements = {},
                i = 0,
                innerElements = component.querySelectorAll('*'),
                currentElement,
                styles;

            elements.first = null;
            for (i; null === elements.first && i < innerElements.length; ++i) {
                currentElement = innerElements[i];
                if (displayedOnly) {
                    styles = window.getComputedStyle(currentElement);
                }
                if (currentElement && this.isTabNavigable(currentElement, component)) {
                    if (!displayedOnly || (styles.display !== 'none' && styles.visibility !== 'hidden')) {
                        elements.first = currentElement;
                    }
                }
            }

            elements.last = null;
            if (last) {
                i = innerElements.length - 1;
                for (i; null === elements.last && i > 0; --i) {
                    currentElement = innerElements[i];
                    if (displayedOnly) {
                        styles = window.getComputedStyle(currentElement);
                    }
                    if (innerElements[i] && this.isTabNavigable(innerElements[i], component)) {
                        if (!displayedOnly ||(styles.display !== 'none' && styles.visibility !== 'hidden')) {
                            elements.last = currentElement;
                        }
                    }
                }
            }

            return elements;
        },

        _getFirstTabable: function(component) {
            var innerElements = component.querySelectorAll('*'),
                element,
                i;

            element = null;
            for (i = 0; i < innerElements.length; ++i) {
                if (this.isTabNavigable(innerElements[i])) {
                    element = innerElements[i];
                    break;
                }
            }

            return element;
        },

        _getFirstFocusable: function(component) {
            var innerElements = component.querySelectorAll('*'),
                element,
                i;

            element = null;
            for (i = 0; i < innerElements.length; ++i) {
                if (this.isFocusable(innerElements[i])) {
                    element = innerElements[i];
                    break;
                }
            }

            return element;
        },

        isTabNavigable: function(elem, component) {
            return !elem.disabled && !_isHidden(elem, component) && _getTabIndex(elem)  >= 0;
        },

        isFocusable: function(elem) {
            return !elem.disabled && !_isHidden(elem) && _getTabIndex(elem) >= -1;
        },

        keepFocusInsideListener: function(evt, component) {
            var elements,
                target;

            if (evt.keyCode === keys.TAB) {
                elements = this.getBoundariesTabableElement(component, true);
                target = evt.target;

                if (elements.first && elements.last) {

                    if (evt.shiftKey) {

                        if (target === elements.first) {
                            _stopEvt(evt);
                            _firstElementKeydownHandler(evt, component);

                        } else if (target === component) {
                            _stopEvt(evt);
                            elements.last.focus();
                        }

                    } else if (target === (elements.last)) {
                        _stopEvt(evt);
                        _lastElementBlurKeydownHandler(evt, component);
                    }
                } else {
                    _stopEvt(evt);
                    _lastElementBlurKeydownHandler(evt, component);
                }
            }
        },

        setFocusOnFirst: function(component) {
            var elements = this.getBoundariesTabableElement(component);

            if (elements.first) {
                elements.first.focus();
                return elements.first;
            }
        },

        setFocusOnAnyFirst: function(component) {
            var element;

            element = this._getFirstTabable(component) ||  this._getFirstFocusable(component);

            if (element) {
                element.focus();
            }

            return element;
        },

        setFocusOnPreviousElement: function(component) {
            var parent = component.parentElement,
                previousSibling = component.previousElementSibling;

            while (previousSibling) {
                if (this.isFocusable(previousSibling) && !_isHidden(previousSibling)) {
                    previousSibling.focus();
                    return;
                }
                previousSibling = previousSibling.previousElementSibling;
            }

            if (this.isFocusable(parent)) {
                parent.focus();
                return;
            } else {
                //We force focusable
                parent.classList.add('hidden-focus-style');
                parent.setAttribute('tabindex', -1);
                parent.focus();
            }

        },

        addA11yFocus: function(component) {
            component._mouseActive = false;
            component.classList.add('wc-a11y-focus');
            component.listenTo(component, 'mousedown', function() {
                component._mouseActive = true;
                setTimeout(function() {
                    component._mouseActive = false;
                }, 150);
            });

            component.listenTo(component, 'focus', function() {
                if (!component._mouseActive) {
                    component.classList.add('wc-a11y-focused');
                }
            }, true);

            component.listenTo(component, 'blur', function() {
                component.classList.remove('wc-a11y-focused');
            }, true);
        },

        hideChildElementsFromAria: function(parentNode, exclusions) {
            var isExcluded = false,
                i,
                removals = [],
                attribute = 'aria-hidden';

            exclusions = exclusions || [];

            Array.prototype.slice.call(parentNode.children, 0).forEach(function(child) {
                isExcluded = false;

                for (i = 0; i < exclusions.length; i++) {
                    if (exclusions[i] === child) {
                        isExcluded = true;
                        break;
                    }
                }

                if (!isExcluded) {
                    removals.push({
                        element: child,
                        oldValue: child.getAttribute(attribute)
                    });
                    child.setAttribute(attribute, true);
                }
            });

            exclusions.forEach(function(node) {
                if (node) {
                    removals.push({
                        element: node,
                        oldValue: node.getAttribute(attribute)
                    });

                    node.removeAttribute('aria-hidden');
                }
            });

            return {
                remove: function() {
                    removals.forEach(function(values) {
                        if (!values.oldValue) {
                            values.element.removeAttribute(attribute);
                        } else {
                            values.element.setAttribute(attribute, values.oldValue);
                        }
                    });
                }
            };
        }
    };


    var wcUtils = window.wcUtils = window.wcUtils || {};

    wcUtils.a11y = a11y;

})(window);