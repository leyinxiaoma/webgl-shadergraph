;(function (window) {
    function _isMobile() {
        return /iPhone|iPod|iPad|Android|BlackBerry/.test(navigator.userAgent);
    }

    function _handleResizeHandlerAttachment(actionType, callback) {
        var focusableElements = ['input', 'select', 'textarea'],
            body = document.getElementsByTagName('body')[0],
            action = actionType === 'add' ? HTMLElement.prototype.addEventListener : HTMLElement.prototype.removeEventListener,
            safeWindowsAction = actionType === 'add' ? window.addEventListener : window.removeEventListener,
            delegatedCallback = function(event) {
                var targetType = event.target.nodeName.toLowerCase();
                if (focusableElements.indexOf(targetType) > -1) {
                    callback();
                }
            };

        if (_isMobile()) {
            action.call(body, 'focusin', delegatedCallback, false);
            action.call(body, 'focusout', delegatedCallback, false);
            action.call(document, 'orientationchange', callback, false);
        } else {
            safeWindowsAction.call(window, 'resize', callback, false);
        }
    }


    var viewport = {

        onResize: function(callback) {
            _handleResizeHandlerAttachment('add', callback);
        },

        offResize: function(callback) {
            _handleResizeHandlerAttachment('remove', callback);
        }

    };



    var wcUtils = window.wcUtils = window.wcUtils || {};

    wcUtils.viewport = viewport;
})(window);
