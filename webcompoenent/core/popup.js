;(function(window){

    var utils = window.Utils;
    var wcUtils = window.wcUtils;
    var viewport = wcUtils.viewport;
// 0-999 are for appliation elements
// 10,000+ are for dynamically displayed popup/modal elements
var baseZindex = 10000,
    topZindex = baseZindex;
function _hasDimension(elem) {
    return (elem.offsetWidth > 0) && (elem.offsetHeight > 0);
}

const position =  {

    get baseZindex() {
        return baseZindex;
    },

    set baseZindex(value) {
        if (baseZindex !== topZindex) {
            console.warn('The global z-index is already in use; baseZindex should be set at application initialization');
        } else {
            topZindex = value;
        }

        baseZindex = value;
    },
    getTopZindex: function() {
        return topZindex++;
    },
    bringToFront: function(element) {
        //#app 360mp
        var app360id = element.ownerDocument.querySelector('#app');
        if (element.parentNode !== app360id && app360id) {
            app360id.firstChild.appendChild(element);
        }else if (!app360id && (element.parentNode !== element.ownerDocument.body)) {
            element.ownerDocument.body.appendChild(element);
        }

        element.style.zIndex = this.getTopZindex();
    },
    getBoxShadowSize: function(element) {
        var style = window.getComputedStyle(element),
            shadowSize,
            shadowSizeArray,
            hShadow,
            vShadow,
            spread,
            blur,
            result = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };

        shadowSize = style.getPropertyValue('box-shadow');
        if (shadowSize === 'none') {
            return result;
        }

        // Remove all possible color definitions
        shadowSize = shadowSize.replace(/rgba?\([^\)]+\)/gi, '');
        shadowSize = shadowSize.replace(/#[0-9a-f]+/gi, '');

        // Remove any alpha characters
        shadowSize = shadowSize.replace(/[a-z]+/gi, '').trim();

        shadowSizeArray = shadowSize.split(' ');

        // Some browsers (IE) don't include a default value (0) for unspecified properties
        hShadow = shadowSizeArray.length > 0 ? parseInt(shadowSizeArray[0], 10) : 0;
        vShadow = shadowSizeArray.length > 1 ? parseInt(shadowSizeArray[1], 10) : 0;
        blur = shadowSizeArray.length > 2 ? parseInt(shadowSizeArray[2], 10) : 0;
        spread = shadowSizeArray.length > 3 ? parseInt(shadowSizeArray[3], 10) : 0;

        result.left = Math.max(spread - hShadow + 0.5 * blur, 0);
        result.right = Math.max(spread + hShadow + 0.5 * blur, 0);
        result.top = Math.max(spread - vShadow + 0.5 * blur, 0);
        result.bottom = Math.max(spread + vShadow + 0.5 * blur, 0);

        return result;

    },
    getDimension: function(elem) {
        var dimensions = {},
            style = {
                'position': '',
                'display': '',
                'top': '',
                'left': ''
            },
            moved = false,
            domRect,
            rect = {},
            key = '';
        if (!_hasDimension(elem)) {
            domRect = elem.getBoundingClientRect();

            if (!domRect.width || !domRect.height) {
                moved = true;
                for (key in style) {
                    style[key] = elem.style[key] || '';
                }
                // is performance.
                elem.style.position = 'absolute';
                elem.style.left = '-1000px';
                elem.style.top = '-1000px';
                elem.style.display = 'inline-block';
            } else {
                rect.width = domRect.width;
                rect.height = domRect.height;
            }
        }

        dimensions = {
            width: rect.width || elem.offsetWidth,
            height: rect.height || elem.offsetHeight
        };

        if (moved) {
            for (key in style) {
                elem.style[key] = style[key];
            }
        }

        return dimensions;

    },


    getPageSize: function(elementOwnerDocument) {
        var documentEl = elementOwnerDocument.documentElement,
            bodyEl = elementOwnerDocument.body;
        return {
            width: Math.max(
                bodyEl.scrollWidth, documentEl.scrollWidth,
                bodyEl.offsetWidth, documentEl.offsetWidth,
                bodyEl.clientWidth, documentEl.clientWidth
            ),
            height: Math.max(
                bodyEl.scrollHeight, documentEl.scrollHeight,
                bodyEl.offsetHeight, documentEl.offsetHeight,
                bodyEl.clientHeight, documentEl.clientHeight
            )
        };
    },


    getPositionInDocument: function(elem) {
        var rect = elem.getBoundingClientRect(),
            // IE11 does not play nice with window.scrollX and window.scrollY
            scroll = {
                x: window.pageXOffset || document.documentElement.scrollLeft,
                y: window.pageYOffset || document.documentElement.scrollTop
            },
            // round values since some browsers (Firefox) like to provide double values
            result = {
                left: Math.round(rect.left) + scroll.x,
                right: Math.round(rect.right) + scroll.x,
                top: Math.round(rect.top) + scroll.y,
                bottom: Math.round(rect.bottom) + scroll.y,
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            };

        return result;
    }
};




/* -------- Alignment --------*/
function _tryLeftAlignment(popup, currentPosition, currentPositionType) {
    var available = position.getPageSize(this.ownerDocument).width - popup.parentPosition.left,
        needed = popup.dimensions.width;

    currentPositionType.alignment = 'left';
    if (needed <= available) {
        currentPosition.x = popup.parentPosition.left;
    } else {
        currentPosition.x = popup.parentPosition.left - (needed - available);
    }
}


function _tryCenterAlignment(popup, currentPosition, currentPositionType) {
    var available = position.getPageSize(this.ownerDocument).width,
        needed = popup.dimensions.width,
        halfChild,
        targetCenterPos;

    /* istanbul ignore else */
    if (needed < available) {
        currentPositionType.alignment = 'center';

        halfChild = popup.dimensions.width / 2;
        targetCenterPos = popup.parentPosition.left + (popup.parentPosition.width / 2);

        if (targetCenterPos > halfChild) {
            if (targetCenterPos + halfChild < available) {
                currentPosition.x = targetCenterPos - halfChild;
                currentPosition.x = available - popup.dimensions.width;
            }
        } else {
            currentPosition.x = 0;
        }
    }
}

function _tryRightAlignment(popup, currentPosition, currentPositionType) {
    var available = popup.parentPosition.right,
        needed = popup.dimensions.width;

    if (needed < available) {
        currentPositionType.alignment = 'right';
        currentPosition.x = popup.parentPosition.left - popup.dimensions.width + popup.parentPosition.width;
    }
}

function _tryTopAlignment(popup, currentPosition, currentPositionType, force) {
    var available = position.getPageSize(this.ownerDocument).height - popup.parentPosition.top,
        needed = popup.dimensions.height;

    if ((needed < available) || force) {
        currentPositionType.alignment = 'top';
        currentPosition.y = popup.parentPosition.top;
    }
}

function _tryMiddleAlignment(popup, currentPosition, currentPositionType) {
    var available = position.getPageSize(this.ownerDocument).height,
        child,
        targetPos;

    currentPositionType.alignment = 'middle';

    child = popup.dimensions.height;
    targetPos = popup.parentPosition.top;
    if (targetPos + child < available) {
        currentPosition.y = targetPos;
    } else {
        currentPosition.y = Math.max(0, available - popup.dimensions.height);
    }
}

function _tryBottomAlignment(popup, currentPosition, currentPositionType) {
    var available = popup.parentPosition.bottom,
        needed = popup.dimensions.height;

    /* istanbul ignore else */
    if (needed < available) {
        currentPositionType.alignment = 'bottom';
        currentPosition.y = popup.parentPosition.bottom - needed;
    }
}

const  popupAlignmentUtils = {
    tryLeftAlignment: _tryLeftAlignment,
    tryRightAlignment: _tryRightAlignment,
    tryTopAlignment: _tryTopAlignment,
    tryBottomAlignment: _tryBottomAlignment,
    tryMiddleAlignment: _tryMiddleAlignment,
    tryCenterAlignment: _tryCenterAlignment
};




function _tryTopPosition(popup, currentPosition, currentPositionType) {
    var finalMargin = popup.margin + popup.boxShadow.bottom,
        available = popup.spaceToNextObject.top,
        needed = popup.dimensions.height + finalMargin;

    if (needed <= available) {
        currentPositionType.position = 'top';
        currentPosition.y = available - needed;
    }
}

function _tryBottomPosition(popup, currentPosition, currentPositionType, force) {
    var finalMargin = popup.margin + popup.boxShadow.top,
        available = position.getPageSize(this.ownerDocument).height - popup.spaceToNextObject.bottom,
        needed = popup.dimensions.height + finalMargin;

    if ((needed < available) || force) {
        currentPositionType.position = 'bottom';
        currentPosition.y = popup.parentPosition.bottom + finalMargin;
    }
}

function _tryRightPosition(popup, currentPosition, currentPositionType) {
    var finalMargin = popup.margin + popup.boxShadow.left,
        available = position.getPageSize(this.ownerDocument).width - popup.spaceToNextObject.right,
        needed = popup.dimensions.width + finalMargin;

    if (needed < available) {
        currentPositionType.position = 'right';
        currentPosition.x = popup.parentPosition.right + finalMargin;
    }
}

function _tryLeftPosition(popup, currentPosition, currentPositionType) {
    var finalMargin = popup.margin + popup.boxShadow.right,
        available = popup.parentPosition.left,
        needed = popup.dimensions.width + finalMargin;

    if (needed <= available) {
        currentPositionType.position = 'left';
        currentPosition.x = available - needed;
    }
}

const popupPositionUtils = {
    tryLeftPosition: _tryLeftPosition,
    tryRightPosition: _tryRightPosition,
    tryTopPosition: _tryTopPosition,
    tryBottomPosition: _tryBottomPosition
};




var BASE_MARGIN = 5,
    CONNECTOR_MARGIN = 4,
    VERTICAL_POSITIONS = ['top', 'bottom'],
    HORIZONTAL_POSITIONS = ['left', 'right'],
    VERTICAL_ALIGNMENTS = ['top', 'middle', 'bottom'],
    HORIZONTAL_ALIGNMENTS = ['left', 'center', 'right'];

function _getPopupPosition(component, target, positionOrder, alignmentOrder, margin, customPositioningMethods) {
    var currentPosition = {
            x: -1,
            y: -1
        },
        positionMap = {
            'top': popupPositionUtils.tryTopPosition,
            'left': popupPositionUtils.tryLeftPosition,
            'right': popupPositionUtils.tryRightPosition,
            'bottom': popupPositionUtils.tryBottomPosition
        },
        alignmentMap = {
            'top': popupAlignmentUtils.tryTopAlignment,
            'left': popupAlignmentUtils.tryLeftAlignment,
            'right': popupAlignmentUtils.tryRightAlignment,
            'bottom': popupAlignmentUtils.tryBottomAlignment,
            'middle': popupAlignmentUtils.tryMiddleAlignment,
            'center': popupAlignmentUtils.tryCenterAlignment
        },
        currentPositionType = {},
        connector = component.querySelector('.connector'),
        positionFound,
        alignmentFound,
        verticalPosition,
        method,
        possibleAlignments,
        popup = {
            boxShadow: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            },
            margin: 0,
            parentPosition: {},
            spaceToNextObject: {},
            dimensions: {}
        };

    customPositioningMethods = customPositioningMethods || {};

    /* ----------- Position -------------- */
    popup.parentPosition = position.getPositionInDocument(target);  // formally targetRect
    popup.spaceToNextObject = popup.parentPosition;                 // formally absoluteRect

    if (!component.style.minWidth) {
        component.style.minWidth = popup.parentPosition.width + 'px';
    }
    popup.dimensions = position.getDimension(component);            // formally popupDimensions

    // If the component has a connector, we need to add extra margin
    if (connector) {
        popup.margin = BASE_MARGIN + (margin || CONNECTOR_MARGIN);        // formally margin
    } else {
        popup.margin = BASE_MARGIN + (margin || 0);
        popup.boxShadow = position.getBoxShadowSize(component);                 // formally boxShadow
    }

    // Checks every position on the array until one fits on the page
    positionFound = positionOrder.some(function(pos) {
        var method = customPositioningMethods[pos] || positionMap[pos];
        if (method) {
            method.call(target, popup, currentPosition, currentPositionType);
            return currentPositionType.position;
        }
    });

    if (!positionFound) {
        method = customPositioningMethods.bottom || positionMap.bottom;
        // If there's no space anywhere, popup is forced to be added at the bottom
        method.call(target, popup, currentPosition, currentPositionType, true);
    }

    /* -------- Alignment -------- */

    verticalPosition = VERTICAL_POSITIONS.indexOf(currentPositionType.position) > -1;
    if (verticalPosition) {
        possibleAlignments = HORIZONTAL_ALIGNMENTS;
    } else {
        possibleAlignments = VERTICAL_ALIGNMENTS;
    }

    // Check every alignment on the array that matches with the position until one fits on the page
    alignmentFound = alignmentOrder.some(function(align) {
        var method;
        if (possibleAlignments.indexOf(align) > -1) {
            method = customPositioningMethods[align] || alignmentMap[align];
            method.call(target, popup, currentPosition, currentPositionType);       // This method is also called in validtable.js.
            return currentPositionType.alignment;
        }
    });

    // If there's no space anywhere, popup is forced to be aligned to the top
    if (!alignmentFound && !verticalPosition) {
        method = customPositioningMethods.top || alignmentMap.top;
        alignmentMap.top.call(target, popup, currentPosition, currentPositionType, true);
    }

    if (connector && currentPositionType.alignment === 'middle') {
        connector.style.top = ((Math.min(popup.dimensions.height, popup.parentPosition.height) - 14) / 2) + 'px';
    }

    return {
        'currentPosition': currentPosition,
        'currentPositionType': currentPositionType
    };
}


function _clearPosition(component) {
    VERTICAL_POSITIONS.forEach(function(pos) {
        this.classList.remove('position-' + pos);
    }, component);

    HORIZONTAL_POSITIONS.forEach(function(pos) {
        this.classList.remove('position-' + pos);
    }, component);

    VERTICAL_ALIGNMENTS.forEach(function(alignment) {
        this.classList.remove('alignment-' + alignment);
    }, component);

    HORIZONTAL_ALIGNMENTS.forEach(function(alignment) {
        this.classList.remove('alignment-' + alignment);
    }, component);
}

/**
 * Updates styles of component with position and alignments
 * @param  {HTMLElement}    component      Component to show as a popup
 * @param  {Object}         positionTarget Position and alignments to be set
 */
function _updateComponent(component, positionTarget) {
    _clearPosition(component);

    component.classList.add('position-' + positionTarget.currentPositionType.position);
    component.classList.add('alignment-' + positionTarget.currentPositionType.alignment);

    component.style.left = positionTarget.currentPosition.x + 'px';
    component.style.top = positionTarget.currentPosition.y + 'px';
}

//app
function getScrollingPopupParent(node) {

    if (node._scrollTarget) {
        return node._scrollTarget;
    }

    var parent = node.parentElement || node.parentNode || node.host;

    while (parent) {
        if (parent._scrollTarget) {
            return parent._scrollTarget;
        }

        if (parent.scrollHandler) {
            return parent;
        }

        if (parent === node.ownerDocument) {
            return;
        }

        if(parent.nodeName === '#document-fragment'){
            return;
        }
        parent = parent.parentElement || parent.parentNode || parent.host;
    }
}

function removeScrollHandler(popupElement) {
    if (popupElement.scrollHandler) {
        popupElement.scrollParent.removeEventListener('scroll', popupElement.scrollHandler);
        popupElement.scrollHandler = null;
        popupElement.scrollParent = null;
    }
}

var handleVisibilityChange = function(component, referenceElement) {
    if (component.classList.contains('leave') || component.classList.contains('closed')) {
        removeScrollHandler(component);
        component.addEventListener('close', function closeHandler(event) {
            if (event.target.classList.contains('no-transition')) {
                event.target.classList.remove('no-transition');
            }

            event.target.removeEventListener('close', closeHandler);
        });

        if (!component.classList.contains('no-transition')) {
            component.classList.add('no-transition');
        }

        return;
    }

    var referenceElementRect = position.getPositionInDocument(referenceElement);
    var parentRect = null;
    if(component.scrollParent){
        parentRect = position.getPositionInDocument(component.scrollParent);
    }


    if ((parentRect === null) || (referenceElementRect.bottom < parentRect.top) ||
        (referenceElementRect.top > parentRect.bottom) ||
        (referenceElementRect.right < parentRect.left) ||
        (referenceElementRect.left > parentRect.right)) {
        if (component.classList.contains('visible')) {
            if (component._closeOnBlur) {
                removeScrollHandler(component);
                component._tmpNoAutoFocusLastActiveElementOnClose = component._noAutoFocusLastActiveElementOnClose;
                component._noAutoFocusLastActiveElementOnClose = true;

                component.addEventListener('close', function closeHandler(event) {
                    if (event.target.classList.contains('no-transition')) {
                        event.target.classList.remove('no-transition');
                    }

                    event.target.removeEventListener('close', closeHandler);
                });

                if (!component.classList.contains('no-transition')) {
                    component.classList.add('no-transition');
                }

                component.close();
            } else {
                if (component.classList.contains('visible')) {
                    component.classList.remove('visible');
                    component.emit('wc-popup-obscured');
                }
            }
        }
    } else {
        if (!component.classList.contains('visible')) {
            component.classList.add('visible');
            component.emit('wc-popup-revealed');
        }
    }
};

function addScrollHandler(component, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var popupParent,
        requestId = 0;

    popupParent = getScrollingPopupParent(referenceElement);

    if (popupParent) {
        component._scrollTarget = popupParent;

        if (!component.moveHandler) {
            component.moveHandler = function(event) {
                component.style.left = (parseInt(component.style.left, 10) + event.dx) + 'px';
                component.style.top = (parseInt(component.style.top, 10) + event.dy) + 'px';
                component.style.zIndex = position.getTopZindex();
            };

            component.parentCloseHandler = function() {
                if (!component.classList.contains('no-transition')) {
                    component.classList.add('no-transition');
                }
            };

            component.parentObscuredHandler = function() {
                component.classList.add('no-transition');
                component.classList.remove('visible');
                setTimeout(function() {
                    component.classList.remove('no-transition');
                }, 20);
            };

            component.parentRevealedHandler = function() {
                component.classList.add('no-transition');
                component.classList.add('visible');
                setTimeout(function() {
                    component.classList.remove('no-transition');
                }, 20);
            };

            popupParent.addEventListener('wc-popup-move', component.moveHandler);
            popupParent.addEventListener('close', component.parentCloseHandler);
            popupParent.addEventListener('wc-popup-obscured', component.parentObscuredHandler);
            popupParent.addEventListener('wc-popup-revealed', component.parentRevealedHandler);
            /* istanbul ignore next */
            component.addEventListener('close', function closeHandler(event) {
                popupParent.removeEventListener('wc-popup-move', event.target.moveHandler);
                popupParent.removeEventListener('close', event.target.parentCloseHandler);
                popupParent.removeEventListener('wc-popup-obscured', event.target.parentObscuredHandler);
                popupParent.removeEventListener('wc-popup-revealed', event.target.parentRevealedHandler);
                event.target.moveHandler = null;
                event.target.parentCloseHandler = null;
                event.target.parentObscuredHandler = null;
                event.target.parentRevealedHandler = null;
                event.target.removeEventListener('close', closeHandler);
                if (event.target.classList.contains('no-transition')) {
                    event.target.classList.remove('no-transition');
                }
            });
        }

    } else if (!component.scrollHandler) {
        component.scrollParent = utils.getScrollParent(referenceElement);

        if (component.scrollParent !== component.ownerDocument) {

            component.scrollHandler = utils.throttleDebounce(function() {
                handleVisibilityChange(component, referenceElement);

                if (component.classList.contains('leave') || !component.classList.contains('visible')) {
                    return;
                }

                if (requestId === 0) {
                    requestId = requestAnimationFrame(function() {
                        _setPosition(component, referenceElement, positions, alignment, margin, customPositioningMethods);
                        requestId = 0;
                    });
                }
            }, 20);

            component.scrollParent.addEventListener('scroll', component.scrollHandler);

            if (!component.closeHandler) {
                component.closeHandler = function(event) {
                    if (requestId) {
                        cancelAnimationFrame(requestId);
                        requestId = 0;
                    }

                    removeScrollHandler(event.target);
                    component._noAutoFocusLastActiveElementOnClose = component._tmpNoAutoFocusLastActiveElementOnClose;
                    event.target.removeEventListener('close', component.closeHandler);
                    component.closeHandler = null;
                };

                component.addEventListener('close', component.closeHandler);
            }
        }
    }
}


function _setPosition(component, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var finalAlignment  = alignment || ['left', 'right'],
        orderPosition = positions || ['bottom', 'top'],
        positionTarget;

    addScrollHandler(component, referenceElement, positions, alignment, margin, customPositioningMethods);

    position.bringToFront(component);

    positionTarget = _getPopupPosition(component, referenceElement, orderPosition, finalAlignment, margin, customPositioningMethods);

    if (!positionTarget.currentPositionType.position || !positionTarget.currentPositionType.alignment) {
        _hide(component);
        return false;
    }
    if (component.style.top && component.style.left) {
        eventUtil.emit(component, 'wc-popup-move', {
            dx: positionTarget.currentPosition.x - parseInt(component.style.left, 10),
            dy: positionTarget.currentPosition.y - parseInt(component.style.top, 10)
        });
    }

    _updateComponent(component, positionTarget);

    return true;

}

function _installResizeMethod(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var resizeMethod;

    resizeMethod = function() {

        if (popupElement.classList.contains('visible')) {
            _setPosition(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods);
        }
    };

    viewport.onResize(resizeMethod);

    return resizeMethod;
}

function _uninstallResizeMethod(callback) {
    viewport.offResize(callback);
}


function _show(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var setupSuccessful = false;

    if (!document.body.contains(referenceElement)) {
        return;
    }

    if (popupElement.show && !popupElement.classList.contains('visible')) {
        setupSuccessful = _setPosition(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods);
        if (setupSuccessful) {
            popupElement.show();
        }
    }

}


function _hide(popupElement) {
    if (popupElement && popupElement.open) {
        popupElement.close();
    }
    removeScrollHandler(popupElement);
}

const popup = {
    installResizeMethod: _installResizeMethod,
    uninstallResizeMethod: _uninstallResizeMethod,
    clearPosition: _clearPosition,
    setPosition: _setPosition,
    show: _show,
    hide: _hide
};

window.position = position;
window.popup = popup;
})(window);