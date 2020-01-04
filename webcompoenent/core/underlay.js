;(function(window){

    var wcUtils =  window.wcUtils;
    var a11y = wcUtils.a11y;
    var setFocusMethod,
        Underlay,
        previousZindexes = [];

    Underlay = {
        show: function (component) {
            var bodyEl = document.body,
                underlayElement = bodyEl.querySelector('.wc-underlay');
            if (underlayElement) {
                previousZindexes.push(underlayElement.style.zIndex);
            } else {
                underlayElement = document.createElement('div');
                underlayElement.classList.add('wc-underlay');
                underlayElement.tabIndex = -1;
                bodyEl.appendChild(underlayElement);
                setFocusMethod = function () {
                    a11y.setFocusOnFirst(this);
                }.bind(component);
                underlayElement.addEventListener('focus', setFocusMethod);
            }

            position.bringToFront(underlayElement);

            this._hiddenAriaRemoveHandle = a11y.hideChildElementsFromAria(document.body, [component]);

            return underlayElement;
        },
        hide: function () {
            var _animationend = 'webkitAnimationName' in document.documentElement.style ? 'webkitAnimationEnd' : 'animationend',
                bodyEl = document.body,
                underlayElement = bodyEl.querySelector('.wc-underlay');
            if (underlayElement && !underlayElement.classList.contains('fade-out')) {
                if (this._hiddenAriaRemoveHandle) {
                    this._hiddenAriaRemoveHandle.remove();
                    this._hiddenAriaRemoveHandle = null;
                }
                if (previousZindexes.length) {
                    underlayElement.style.zIndex = previousZindexes.pop();
                }else{
                    bodyEl.addEventListener(_animationend, function onHide() {
                        bodyEl.removeEventListener(_animationend, onHide);
                        underlayElement.removeEventListener('focus', setFocusMethod);
                        setFocusMethod = null;
                        underlayElement.parentNode.removeChild(underlayElement);
                    });
                    underlayElement.classList.add('fade-out');
                }
            }
        },
        setZIndex: function (zIndex) {
            var underlayElement = document.body.querySelector('.wc-underlay');
            if (underlayElement) {
                underlayElement.style.zIndex = zIndex;
            }
        }
    };

    var wcUtils = window.wcUtils = window.wcUtils || {};
    window.underlay = Underlay;
    wcUtils.underlay = Underlay;
})(window);