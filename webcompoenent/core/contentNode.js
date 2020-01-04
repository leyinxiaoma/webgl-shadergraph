;(function(window){

    function _parse(component, htmlFragment, targetSelector, transformations) {
        var parsedFragment;
        if (transformations && transformations.hasOwnProperty(targetSelector)) {
            parsedFragment = transformations[targetSelector](component, htmlFragment, targetSelector);
            component._cachedChildNodes[targetSelector] = parsedFragment;
        } else {
            component._cachedChildNodes[targetSelector] = htmlFragment.parentElement.removeChild(htmlFragment);
        }
    }

    function cacheInputContent(component, contentPropertyMap, transformations) {
        var key;

        if (contentPropertyMap && component.childNodes && component.childNodes.length) {
            component._cachedChildNodes = {};

            for (key in contentPropertyMap) {
                if (contentPropertyMap.hasOwnProperty(key) && component.querySelector(key)) {
                    _parse(component, component.querySelector(key), key, transformations);
                }
            }
        }
    }

    function storeCachedInput(component, contentPropertyMap) {
        var key,
            target;
        if (component._cachedChildNodes) {
            for (key in component._cachedChildNodes) {
                if (component._cachedChildNodes.hasOwnProperty(key)) {
                    target = contentPropertyMap[key];
                    component[target] = [].slice.call(component._cachedChildNodes[key].childNodes);
                }
            }

            delete component._cachedChildNodes;
        }
    }


    function addContent(component, contentConfig, contentPropertyMap) {
        var target,
            key,
            warningMessage;

        for (key in contentConfig) {
            if (contentConfig[key] && contentPropertyMap.hasOwnProperty(key)) {
                target = contentPropertyMap[key];
                if (Array.isArray(contentConfig[key])) {
                    component[target] = contentConfig[key];
                } else {
                    component[target] = [contentConfig[key]];
                }
            }
        }
    }

    const contentNode = {
        cacheInputContent: cacheInputContent,
        storeCachedInput: storeCachedInput,
        addContent: addContent
    };

    var wcUtils = window.wcUtils = window.wcUtils || {};

    wcUtils.contentNode = contentNode;


})(window);