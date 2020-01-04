;(function(window){
    var componentIdCounter = 0,
        listenToCounter = 0,
        _defineProperty = Object.defineProperty;

    function matchesSelectorListener(selector, listener, contextNode) {
        return function(e) {
            var matchesTarget = matches(e.target, selector, contextNode);
            if (matchesTarget) {
                listener(e, matchesTarget);
            }
        };
    }

    function _isTypeObject(what) {
        return what.stringify && what.parse;
    }

    function _parseTypeCast(what, propertyName) {
        if (what) {
            if (typeof what === "function") {
                what = {
                    stringify: what,
                    parse: what
                };
            }
            if (!_isTypeObject(what)) {
                throw new TypeError(propertyName + ": invalid type");
            }
        }
        return what || null;
    }

    function _assertMethodIfExists(what, optionName, propertyName) {
        var type = typeof what;
        if (what && !(type === "function" || type === "string")) {
            throw new TypeError(propertyName + ": " + optionName + " not a function or method name");
        }
        return what || null;
    }

    function _objectMap(object, propertyName) {
        if (!object.hasOwnProperty(propertyName)) {
            _defineProperty(object, propertyName, {
                value: Object.create(null)
            });
        }
        return object[propertyName];
    }


    function matches(node, selector, contextNode) {
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

    function _makeGetConverter(propertyName, typeCast, defaultValue) {
        if (defaultValue === undefined) {
            defaultValue = null;
        }

        var parse = typeCast && typeCast.parse;

        return parse === Boolean ? function(value) {
            return value !== null && value !== "false";
        } : parse ? function(value) {
            return value === null ? defaultValue : parse(value, propertyName);
        } : function(value) {
            return value === null ? defaultValue : value;
        };
    }

    function _makeAttributeGetterSetter(object, propertyName, attributeName, typeCast, getConverter) {
        var stringify = typeCast && typeCast.stringify;

        _defineProperty(object, propertyName, {
            get: function() {
                return getConverter(this.getAttribute(attributeName));
            },
            set: stringify === Boolean ? function(value) {
                if (value) {
                    this.setAttribute(attributeName, attributeName);
                } else {
                    this.removeAttribute(attributeName);
                }
            } : stringify ? function(value) {
                value = (value === null ? value : stringify(value, propertyName));

                if (value === null) {
                    this.removeAttribute(attributeName);
                } else {
                    this.setAttribute(attributeName, value);
                }
            } : function(value) {
                if (value === null) {
                    this.removeAttribute(attributeName);
                } else {
                    this.setAttribute(attributeName, value);
                }
            }
        });
    }

    function _findChildren(parent) {
        var children = [];

        function loop(el) {
            var nodes = el.children,
                node;

            for (var i = 0; i < nodes.length; ++i) {
                node = nodes[i];
                if (node.tagName.indexOf("-") >= 0) {
                    // custom elements must contain a "-"
                    children.push(node);
                } else if (node.children.length){
                    loop(node);
                }
            }
        }

        loop(parent);

        return children;
    }

    class UIComponent extends HTMLElement {

        constructor() {
            super();
            _defineProperty(this, "_attrChangeCalls", {
                value: {}
            });
            this.init();
        }

        init() {
            this.baseClass = "";
            this.componentId = 0;
            this.template = null;
            this.componentId = ++componentIdCounter;
        }

        connectedCallback(){     //createdCallback

            if (this.baseClass) {
                let classNames = this.baseClass.split(" ").filter(Boolean);
                classNames.forEach(function(item) {
                    this.classList.add(item);
                }, this);
            }

            this._setupEventAttrbutes();

            this.render();

            this._listenforReady();

            this._rendered = true;

            //属性初始化 change
            this._initBoundProperties();

        }
        disconnectedCallback() { //detachedCallback


        }
        adoptedCallback(){ //attachedCallback


        }

        _listenforReady() {
            var eventName = "component-upgraded",
                children = _findChildren(this),
                numUpgraded = children.reduce(function(prev, child) {
                    return child._upgraded ? prev + 1 : prev;
                }, 0),
                numChildren = children.length,
                func = function(event) {
                    event.stopPropagation();
                    if (++numUpgraded === numChildren) {
                        this.removeEventListener(eventName, func);
                        this.ready();
                    }
                }.bind(this);

            if (numChildren) {
                this.addEventListener(eventName, func);
            } else {
                this.ready();
            }
        }

        ready() {
            this._upgraded = true;
            this.emit("component-upgraded", { bubbles: true });
        }

        preRender() { }

        postRender() { }

        render() {
            var str,hostdiv;

            if (this._rendered) {
                return;
            }

            this.preRender();

            if (this.template) {
                str = this.template(this);
                hostdiv = this.hostdiv || this;
                hostdiv.innerHTML = str.replace(/<[\/]{0,1}(template|TEMPLATE)[^><]*>/g, "");
            }

            this.postRender();
        }

        attributeChangedCallback(attrName, oldValue, newValue) {
            var attrRecord  = this._attributes && this._attributes[attrName.toLowerCase()];

            attrName = attrName.toLowerCase();

            if (attrRecord) {
                var pendingChangeCalls = this._attrChangeCalls;
                if (pendingChangeCalls[attrName] > 0) {
                    pendingChangeCalls[attrName]--;
                } else {
                    this._attributeChanged(attrName, oldValue, newValue);
                }
            }
        }
        _attributeChanged(attrName, oldAttrValue, newAttrValue) {
            var attrRecord  = this._attributes && this._attributes[attrName.toLowerCase()],
                changeCallback;

            if (attrRecord && (changeCallback = attrRecord.c)) {
                var typeCast = attrRecord.g,
                    newValue = typeCast(newAttrValue),
                    oldValue = typeCast(oldAttrValue);

                if (typeof changeCallback === "function") {
                    changeCallback.call(this, newValue, oldValue);
                } else {
                    this[changeCallback](newValue, oldValue);
                }
            }
        }
        _setupEventAttrbutes() {
            var EVENT_ATTRIBUTE_RE = /^data-on-(.+)$/,
                attributes = this.attributes;

            for (var i = 0, l = attributes.length; i < l; i++) {
                var attribute = attributes[i],
                    attrNameMatch;
                if ((attrNameMatch = EVENT_ATTRIBUTE_RE.exec(attribute.name))) {
                    var eventName = attrNameMatch[1],
                        handlerName = attribute.value,
                        handlerFunc = this[handlerName];

                    if (typeof handlerFunc === "function") {
                        this.on(eventName, handlerFunc);
                    } else {
                        console.warn(this.nodeName + ": event handler \"" + handlerName + "\" is not " +  handlerName ? "a function" : "defined");
                    }
                }

            }
        }
        on(type, callback) {
            return this.listenTo(this, type, callback);
        }

        once(type, callback) {
            var _component = this;
            var oncefunction = function() {
                callback && callback.apply(this,arguments);
                _component.off(type, oncefunction);
            };

            oncefunction._notProxy = true;
            return this.on(type, oncefunction);
        }

        off(type, callback) {
            return this.stopListening(this, type, callback);
        }

        emit(type, eventObj) {
            eventObj = eventObj || {};

            var nativeEvent,
                bubbles = "bubbles" in eventObj ? eventObj.bubbles : true,
                cancelable = "cancelable" in eventObj ? eventObj.cancelable : true;

            nativeEvent = this.ownerDocument.createEvent("HTMLEvents");
            nativeEvent.initEvent(type, bubbles, cancelable);

            for (var i in eventObj) {
                if (!(i in nativeEvent)) {
                    nativeEvent[i] = eventObj[i];
                }
            }
            return this.dispatchEvent(nativeEvent);
        }

        listenTo(obj, name, callback, useCapture) {
            var listeningTo, id;

            if (!callback && typeof name === "object") {
                callback = this;
            }

            listeningTo = this._listeningTo || (this._listeningTo = {});
            id = "l" + (++listenToCounter);
            listeningTo[id] = {object: obj, name: name, callback: callback};

            if (obj.addEventListener) {
                var selector = name.match(/(.*):(.*)/);
                if (selector) {
                    name = selector[2];
                    selector = selector[1];
                    callback = matchesSelectorListener(selector, callback, obj);
                    listeningTo[id].callback = callback;
                    listeningTo[id].name = name;
                }

                if(callback._notProxy){
                    var AddEventListener = window.oldAddEventListener || HTMLElement.prototype.addEventListener;
                    window.oldAddEventListener = AddEventListener;
                    AddEventListener.call(obj,name, callback, !!useCapture);
                }else{
                    obj.addEventListener(name, callback, !!useCapture);
                }


            } else if (obj.on) {
                obj.on(name, callback, this);
            }

            return this;
        }

        stopListening(obj, name, callback, useCapture) {
            var listeningTo = this._listeningTo,
                map = {},
                item,
                id;

            if (!listeningTo) {
                return this;
            }

            if (obj && !name && !callback) {
                for (id in listeningTo) {
                    if (listeningTo[id].object === obj) {
                        map[id] = listeningTo[id];
                    }
                }
            } else if (obj && name && !callback) {
                for (id in listeningTo) {
                    if (listeningTo[id].object === obj && listeningTo[id].name === name) {
                        map[id] = listeningTo[id];
                    }
                }
            } else if (obj && name && callback) {
                for (id in listeningTo) {
                    if (listeningTo[id].object === obj && listeningTo[id].name === name && listeningTo[id].callback === callback) {
                        map[id] = listeningTo[id];
                    }
                }
            } else if (!obj && !name && !callback) {
                map = listeningTo;
            }

            for (id in map) {
                item = map[id];
                if (item.object.removeEventListener) {
                    item.object.removeEventListener(item.name, item.callback, !!useCapture);
                } else if (item.object.off) {
                    item.object.off(item.name, item.callback, this);
                }

                delete this._listeningTo[id];
            }

            return this;
        }


        setupProperties(attributeMap) {

            var boundAttributes = _objectMap(this, "_attributes"),
                boundProperties = _objectMap(this, "_properties");

            for (var propertyName in attributeMap) {
                var attrOptions = attributeMap[propertyName],
                    typeCast, defaultValue, attrName, attrChangeCallback;

                if (typeof attrOptions === "function" || _isTypeObject(attrOptions)) {
                    typeCast = attrOptions;
                    attrOptions = {};
                } else {
                    typeCast = attrOptions.type || null;
                }
                typeCast = _parseTypeCast(typeCast, propertyName);

                attrChangeCallback = attrOptions.change;

                attrName = attrOptions.attribute || propertyName.toLowerCase();
                defaultValue = attrOptions["default"];

                var getConverter = _makeGetConverter(propertyName, typeCast, defaultValue);

                if (propertyName in boundProperties) {
                    throw new Error("Property " + propertyName + " already bound");
                }
                if (attrName.toLowerCase() in boundAttributes) {
                    throw new Error("Attribute " + attrName + " already bound");
                }

                _makeAttributeGetterSetter(this, propertyName, attrName, typeCast, getConverter);

                boundAttributes[attrName.toLowerCase()] = boundProperties[propertyName] = {
                    p: propertyName,
                    c: _assertMethodIfExists(attrOptions.change, "change callback", propertyName),
                    g: getConverter
                };
            }

            return this;
        }

        _initBoundProperties() {
            var attrChangeCalls = this._attrChangeCalls;

            for (var attrName in this._attributes) {
                attrChangeCalls[attrName.toLowerCase()] = 0;
                this._attributeChanged(attrName, null, this.getAttribute(attrName));
            }
        }


        setAttribute(attrName, /* jshint unused:false */ attrValue) {
            this._attrChangeCalls[ ("" + attrName).toLowerCase() ]++;

            var oldValue = this.getAttribute(attrName);
            super.setAttribute.apply(this, arguments);
            var newValue = this.getAttribute(attrName);

            if (oldValue !== newValue && this._rendered) {
                this._attributeChanged(attrName, oldValue, newValue);
            }
        }


        removeAttribute(attrName) {
            this._attrChangeCalls[ ("" + attrName).toLowerCase() ]++;

            var oldValue = this.getAttribute(attrName);
            super.removeAttribute.apply(this, arguments);

            if (oldValue !== null && this._rendered) {
                this._attributeChanged(attrName, oldValue, null);
            }
        }
    }
    window.UIComponent = UIComponent;

})(window);