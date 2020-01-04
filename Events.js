var listenToCounter = 0;
function Events(ELEMENT_TAG){
    this._dom = document.createElement(ELEMENT_TAG);
}

Events.prototype.on = function(type, callback) {
    this.listenTo(this._dom, type, callback);
    var _element = this;
    return {
        unbind:function(){
            _element.stopListening(_element._dom, type, callback)
        }
    }
};

Events.prototype.once = function(type, callback) {
    var _component = this;
    var oncefunction = function() {
        callback && callback.apply(_component,arguments);
        _component.off(type, oncefunction);
    };
    return this.on(type, oncefunction);
};

Events.prototype.off = function(type, callback) {
    return this.stopListening(this._dom, type, callback);
};

Events.prototype.emit = function(type, args1,args2,args3,args4,args5) {
    if(arguments.length === 1 || arguments.length === 2){
        var eventObj = args1 || {};
        eventObj.args = [args1];
    }else{
        eventObj = {args:[args1,args2,args3,args4,args5]};
    }

    var nativeEvent,
        bubbles = "bubbles" in eventObj ? eventObj.bubbles : true,
        cancelable = "cancelable" in eventObj ? eventObj.cancelable : true;

    nativeEvent = this._dom.ownerDocument.createEvent("HTMLEvents");
    nativeEvent.initEvent(type, bubbles, cancelable);

    for (var i in eventObj) {
        if (!(i in nativeEvent)) {
            nativeEvent[i] = eventObj[i];
        }
    }
    return this._dom.dispatchEvent(nativeEvent);
};
Events.prototype.call = function(type,args,args1,args2,args3,args4,args5){
    var callmethods  = this._callmethods || (this._callmethods = {});
    var _args = [],i;
    for(i = 1; i < arguments.length; i++){
        if(arguments[i] !== undefined){
            _args.push(arguments[i]);
        }
    }
    return callmethods[type] && callmethods[type].apply(this,_args);
};
Events.prototype.method = function(type,callback){
    var callmethods  = this._callmethods || (this._callmethods = {});
    callmethods[type] = callback || function(){};
};
Events.prototype.listenTo = function(obj, name, callback, useCapture) {
    var listeningTo, id;

    if (!callback && typeof name === "object") {
        callback = this;
    }
    listeningTo = this._listeningTo || (this._listeningTo = {});
    id = "l" + (++listenToCounter);
    listeningTo[id] = {object: obj, name: name, callback: callback};

    if (obj.addEventListener) {
        // var selector = name.match(/(.*):(.*)/);
        // if (selector) {
        //     name = selector[2];
        //     selector = selector[1];
        //     callback = matchesSelectorListener(selector, callback, obj);
        //     listeningTo[id].callback = callback;
        //     listeningTo[id].name = name;
        // }

        obj.addEventListener(name, callback, !!useCapture);
    } else if (obj.on) {
        obj.on(name, callback, this);
    }

    return this;
};

Events.prototype.stopListening = function(obj, name, callback, useCapture) {
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
};

