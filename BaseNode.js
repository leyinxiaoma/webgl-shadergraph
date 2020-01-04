var componentIdCounter = 0,
    _defineProperty = Object.defineProperty;

var fromEvent = rxjs.fromEvent;
var Subject = rxjs.Subject;
var tap =  rxjs.operators.tap;
var takeUntil = rxjs.operators.takeUntil;
var skipUntil = rxjs.operators.skipUntil;
var take = rxjs.operators.take;
var flatMap = rxjs.operators.flatMap;
var merge  = rxjs.operators.merge;
var map  = rxjs.operators.map;
var debounceTime  = rxjs.operators.debounceTime;
var throttleTime  = rxjs.operators.throttleTime;
var skip  = rxjs.operators.skip;
var withLatestFrom  = rxjs.operators.withLatestFrom;



const CLASS_DISABLED = 'animatorweb-disabled';
const CLASS_READONLY = 'animatorweb-readyonly';
const CLASS_HIDDEN = 'animatorweb-hidden';
const CLASS_TAPSELECT = 'animatorweb-tapselect';
const CLASS_EMPTY = 'animatorweb-empty';
class BaseNode extends Events{

    constructor(ELEMENT_TAG = 'DIV',args){

        super(ELEMENT_TAG);
        if (!args) args = {};
        this.enabled = args.enabled !== undefined ? args.enabled : true;
        this.hidden = args.hidden || false;
        this.readOnly = args.readOnly || false;
        this.tapselect = args.tapselect || false;
        this._dom.ui = this;
        this._eventsParent = [];


        this.componentId = 0;
        this.template = null;
        this.componentId = ++componentIdCounter;

        _defineProperty(this, "_attrChangeCalls", {
            value: {}
        });

        this.__attributes = {};
        this._attribute = {};
        this._properties = {};

        this._children = [];

        this._nodeType = 'BaseNode';
        this._dirty = true;


        this.renderstyle();
        this.init(args);
    }


    init(){
        this.setupProperties({
            scale:{
                default: new Vec2(1,1),
                type: Object,
                change: function(newValue,oldValue) {
                    if(newValue !== oldValue){
                        this._dirty = true;
                        this.render();
                    }
                }
            },
            position:{
                default: new Vec2(0,0),
                type: Object,
                change: function(newValue,oldValue) {
                    if(newValue !== oldValue){
                        this._dirty = true;
                        this.render();
                    }
                }
            },
            localMatrix:{
                default: [1,0,0,1,0,0],
                type: Object,
                change: function(newValue,oldValue) {

                }
            }
        });


        this.enable_tap = true;
        this.enable_drag = false;
        this.enable_wheel_drag = false;
        this.enable_contextmenu_drag = false;
        var _element = this;

        this.tapstart$$ =  merge2(fromEvent(this._dom, 'mousedown'),fromEvent(this._dom, 'touchstart').pipe(map(e => e.touches[0])));

        this.holdTime$$ = touchend$$.pipe(
            map(_ => ({t:new Date().getTime(),x:  _.clientX,y:_.clientY})),
            withLatestFrom(this.tapstart$$.pipe(map(_ => ({t:new Date().getTime(),x:  _.clientX,y:_.clientY}),debounceTime(100)))
            )).pipe(
            map(([t2,t1]) => ({dt:t2.t - t1.t,dx:t2.x - t1.x,dy:t2.y - t1.y})),
            filter(d => d.dt < 180 && Math.abs(d.dx) < 10 &&  Math.abs(d.dy) < 10),
        );


        this.touchstart$$ = this.tapstart$$.pipe(filter(function(e){

                if (e.which === 3) {
                    return  _element.enable_contextmenu_drag;
                } else if (e.which === 2) {
                    return _element.enable_wheel_drag
                } else if (e.which === 1) {
                    return  _element.enable_drag;
                }
                return  _element.enable_drag;
        }));


        this.touchstart_contextmenu$$ =  fromEvent(this._dom, 'contextmenu')
            .pipe(
                tap(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                }),
                filter(function(e){
                    return  _element.enable_contextmenu_drag;
                })).subscribe();



        this.drag$$ = this.touchstart$$.pipe(
            flatMap((function(md){

                var startX = md.clientX,//+ window.scrollX,
                    startY = md.clientY,   //+ window.scrollY,
                    startLeft = parseInt(this.position.x, 10) || 0,
                    startTop = parseInt(this.position.y, 10) || 0;

                md.stopPropagation && md.stopPropagation();
                md.preventDefault && md.preventDefault();

                return touchmove$$.pipe(
                    map((mm) => {
                        mm.stopPropagation && mm.stopPropagation();
                        mm.preventDefault && mm.preventDefault();

                        return {
                            tX: startLeft + mm.clientX - startX,
                            tY: startTop + mm.clientY - startY,
                            dx:mm.clientX - startX,
                            dy:mm.clientX - startY
                        };
                    }), takeUntil(touchend$$))
            }).bind(this))
        );

        this.drop$$ = this.touchstart$$.pipe(
            flatMap((function(md){

                var startX = md.clientX,//+ window.scrollX,
                    startY = md.clientY,   //+ window.scrollY,
                    startLeft = parseInt(this.position.x, 10) || 0,
                    startTop = parseInt(this.position.y, 10) || 0,
                    starttime = Date.now();

                    md.stopPropagation && md.stopPropagation();
                    md.preventDefault && md.preventDefault();


                var source$ =  touchmove$$.pipe(
                    map((mm) => {
                        mm.stopPropagation && mm.stopPropagation();
                        mm.preventDefault && mm.preventDefault();

                        var data = {
                            vxRate: (mm.clientX - startX)/ (Date.now() - starttime),
                            vyRate: (mm.clientY - startY)/ (Date.now() - starttime),
                            tX: startLeft + mm.clientX - startX,
                            tY: startTop + mm.clientY - startY,
                            dx:mm.clientX - startX,
                            dy:mm.clientX - startY
                        };
                        return data;
                    }),skipUntil(touchend$$),take(1));
                return source$;
            }).bind(this))
        );




        var _node = this._dom;


        this.subscriptions =  [

            this.drag$$.pipe(throttleTime(13)).subscribe((x) => {
                var _lastX = this.position.x,_lastY =  this.position.y;
                this.position.x =  x.tX;
                this.position.y =  x.tY;

                this._dirty = true;
                this.render();

                this.emit('node_move');

            }),

            // this.drop$$.subscribe( (x) => {

            //     var vxRate = x.vxRate,vyRate = x.vyRate;

            //     if(vxRate > 1){
            //         vxRate = Math.max(2,vxRate);
            //     }else if(vxRate <  -1){
            //         vxRate = Math.min(-2,vxRate);
            //     }else{
            //         vxRate = 0;
            //     }

            //     if(vyRate > 1){
            //         vyRate = Math.max(2,vyRate);
            //     }else if(vyRate <  -1){
            //         vyRate = Math.min(-2,vyRate);
            //     }else{
            //         vyRate = 0;
            //     }

            //     var vRate = Math.max(Math.abs(vxRate),Math.abs(vyRate));

            //     // if(vxRate < 0 ) {
            //     //     vxRate = -vRate;
            //     // }else if(vxRate > 0 ){
            //     //     vxRate = vRate;
            //     // }
            //     //
            //     // if(vyRate < 0 ) {
            //     //     vyRate = -vRate;
            //     // }else if(vyRate > 0){
            //     //     vyRate = vRate;
            //     // }

            //     if(Math.abs(vRate) > 1){

            //         this._dirty = true;


            //         this.tween({
            //             sv:{_posx:this.position.x,_posy:this.position.y},
            //             ev:{_posx:x.tX +  vxRate * 30,_posy:x.tY +  vyRate * 30},
            //             easingFunction:1,
            //             delay:0,
            //             easingType:0,
            //             duration:100,
            //             update:function(obj){

            //                 this.position.x = obj._posx;
            //                 this.position.y = obj._posy;
            //                 this._dirty = true;
            //                 this.render();
            //             },
            //             complete:function(){

            //             }
            //         });

            //         _node.addEventListener('transitionend',function onShow(){
            //             _node.removeEventListener('transitionend', onShow);
            //             _node.style.transition = 'none';
            //         });
            //         //this._dom.style.transition = 'transform 0.15s ease';
            //         this.render();
            //     }

            // })
        ];


        this._initBoundProperties();
    };


    get enabled() {
        return this._enabled && (!this._parent || this._parent.enabled);
    }

    set enabled(value) {

        if (this._enabled === value) return;

        const enabled = this.enabled;

        this._enabled = value;

        if (enabled !== value) {
            this._onEnabledChange(value);
        }
    }
    get dom() {
        return this._dom;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        if (value === this._parent) return;

        const oldEnabled = this.enabled;
        const oldReadonly = this.readOnly;

        if (this._parent) {
            for (let i = 0; i < this._eventsParent.length; i++) {
                this._eventsParent[i].unbind();
            }
            this._eventsParent.length = 0;
        }

        this._parent = value;

        if (this._parent) {
            this._eventsParent.push(this._parent.once('destroy', this._onParentDestroy.bind(this)));
            this._eventsParent.push(this._parent.on('disable', this._onParentDisable.bind(this)));
            this._eventsParent.push(this._parent.on('enable', this._onParentEnable.bind(this)));
            this._eventsParent.push(this._parent.on('readOnly', this._onParentReadOnlyChange.bind(this)));
        }

        this.emit('parent', this._parent);

        const newEnabled = this.enabled;
        if (newEnabled !== oldEnabled) {
            this._onEnabledChange(newEnabled);
        }

        const newReadonly = this.readOnly;
        if (newReadonly !== oldReadonly) {
            this._onReadOnlyChange(newReadonly);
        }

    }

    get hidden() {
        return this._hidden;
    }

    set hidden(value) {
        if (value === this._hidden) return;

        this._hidden = value;

        if (value) {
            this.class.add(CLASS_HIDDEN);
        } else {
            this.class.remove(CLASS_HIDDEN);
        }

        this.emit(value ? 'hide' : 'show');
    }

    get readOnly() {
        return this._readOnly || (this._parent && this._parent.readOnly);
    }

    set readOnly(value) {
        if (this._readOnly === value) return;
        this._readOnly = value;

        this._onReadOnlyChange(value);
    }
    get style() {
        return this._dom.style;
    }

    get class() {
        return this._dom.classList;
    }

    get width() {
        return this._dom.clientWidth;
    }

    set width(value) {
        if (typeof value === 'number') {
            value += 'px';
        }
        this.style.width = value;
    }

    get height() {
        return this._dom.clientHeight;
    }

    set height(value) {
        if (typeof value === 'number') {
            value += 'px';
        }
        this.style.height = value;
    }

    get disabled() {
        return !this.enabled;
    }

    set disabled(value) {
        this.enabled = !value;
    }

    get element() {
        return this.dom;
    }

    set element(value) {
        this.dom = value;
    }

    set tapselect(value){
        if(value) {
            this.class.add(CLASS_TAPSELECT);
        }else{
            this.class.remove(CLASS_TAPSELECT);
        }
    }
    get tapselect(){
        return this.class.contains(CLASS_TAPSELECT);
    }

    get innerElement() {
        return this.domContent;
    }

    set innerElement(value) {
        this.domContent = value;
    }
    _onEnabledChange(enabled) {
        if (enabled) {
            this.class.remove(CLASS_DISABLED);
        } else {
            this.class.add(CLASS_DISABLED);
        }

        this.emit(enabled ? 'enable' : 'disable');
    }

    _onParentDestroy() {
        this.destroy();
    }

    _onParentDisable() {
        if (this._enabled) {
            this._onEnabledChange(false);
        }
    }

    _onParentEnable() {
        if (this._enabled) {
            this._onEnabledChange(true);
        }
    }

    _onReadOnlyChange(readOnly) {
        if (readOnly) {
            this.class.add(CLASS_READONLY);
        } else {
            this.class.remove(CLASS_READONLY);
        }

        this.emit('readOnly', readOnly);
    }

    _onParentReadOnlyChange(readOnly) {
        if (readOnly) {
            if (!this._readOnly) {
                this._onReadOnlyChange(true);
            }
        } else {
            if (!this._readOnly) {
                this._onReadOnlyChange(false);
            }
        }

    }


    find(attr, value) {
        var result, results = [];
        var len = this._children.length;
        var i, descendants;

        if (attr instanceof Function) {
            var fn = attr;

            result = fn(this);
            if (result)
                results.push(this);

            for (i = 0; i < len; i++) {
                descendants = this._children[i].ui.find(fn);
                if (descendants.length)
                    results = results.concat(descendants);
            }
        } else {
            var testValue;

            if (this[attr]) {
                if (this[attr] instanceof Function) {
                    testValue = this[attr]();
                } else {
                    testValue = this[attr];
                }
                if (testValue === value)
                    results.push(this);
            }

            for (i = 0; i < len; ++i) {
                descendants = this._children[i].ui.find(attr, value);
                if (descendants.length)
                    results = results.concat(descendants);
            }
        }

        return results;
    }

    findOne (attr, value) {
        var i;
        var len = this._children.length;
        var result = null;

        if (attr instanceof Function) {
            var fn = attr;

            result = fn(this);
            if (result)
                return this;

            for (i = 0; i < len; i++) {
                result = this._children[i].ui.findOne(fn);
                if (result)
                    return result;
            }
        } else {
            var testValue;
            if (this[attr]) {
                if (this[attr] instanceof Function) {
                    testValue = this[attr]();
                } else {
                    testValue = this[attr];
                }
                if (testValue === value) {
                    return this;
                }
            }

            for (i = 0; i < len; i++) {
                result = this._children[i].ui.findOne(attr, value);
                if (result !== null)
                    return result;
            }
        }

        return null;
    }

}

BaseNode.prototype._getTargetCoords = function(event){
    var rect = this._dom.getBoundingClientRect();
    var left = Math.floor(rect.left);
    var top = Math.floor(rect.top);
    if (event.clientX < left ||
        event.clientX >= left + this._dom.clientWidth ||
        event.clientY < top ||
        event.clientY >= top + this._dom.clientHeight) {

        return null;
    }
    return  new Vec2(event.clientX - left,event.clientY - top);
};


BaseNode.prototype.render = function(){
    if(this._dirty){

        var _parent = this._parent;
        var _globalScale = new Vec2(1,1);
        while(_parent){
            console.log(_parent.scale);
            _globalScale = new Vec2().mul2(_parent.scale,_globalScale);
            _parent = _parent._parent;
        };


        var out = new Vec2(1/_globalScale.x,1/_globalScale.y).mul(this.position);

        console.log(out);

        let _matrix = prependMatrix(toMatrix([1,0,0,1,0,0]),toMatrix([this.scale.x,0,0,this.scale.y,out.x,out.y]));
        _matrix = toMatrix(_matrix);
        this._dom.style.transform = 'matrix(' + _matrix.a +',' +  _matrix.b + ',' +  _matrix.c +','
        + _matrix.d +',' +  _matrix.tx + ',' +  _matrix.ty +')';

        this.worldMatrix = _matrix;

    }
    this._dirty = false;
};


BaseNode.prototype.renderstyle = function() {

};




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

BaseNode.prototype.setupProperties = function(attributeMap) {

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


        this.__attributes[attrName] = getConverter(defaultValue);
    }

    return this;
};


BaseNode.prototype._initBoundProperties = function(){
    var attrChangeCalls = this._attrChangeCalls;

    for (var attrName in this._attributes) {
        attrChangeCalls[attrName.toLowerCase()] = 0;
        this._attributeChanged(attrName, null, this.getAttribute(attrName));
    }
};

BaseNode.prototype._attributeChanged = function(attrName, oldAttrValue, newAttrValue) {
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
};


BaseNode.prototype.setAttribute = function(attrName,attrValue) {
    this._attrChangeCalls[ ("" + attrName).toLowerCase() ]++;
    var oldValue = this.getAttribute(attrName);
    this.__attributes[attrName] = attrValue;
    var newValue = this.getAttribute(attrName);

    if (oldValue !== newValue) {
        this._attributeChanged(attrName, oldValue, newValue);
    }
};



BaseNode.prototype.getAttribute = function(attrName) {
    return this.__attributes[attrName];
};


BaseNode.prototype.removeAttribute = function(attrName) {
    this._attrChangeCalls[ ("" + attrName).toLowerCase() ]++;

    var oldValue = this.getAttribute(attrName);
    delete this.__attributes[attrName];

    if (oldValue !== null) {
        this._attributeChanged(attrName, oldValue, null);
    }
};
BaseNode.prototype.attach = function(parentnode) {
    if(!parentnode) return;
    var node = this;

    node._dom.parentNode && node._dom.parentNode.removeChild(node._dom);
    if(parentnode.nodeType){
        node._parent = parentnode.ui;
        parentnode.appendChild(node._dom);
    }else{
        node._parent = parentnode;
        parentnode._dom.appendChild(node._dom);
    }
};

BaseNode.prototype.append = function(childnode) {
    var node = this;
    if(childnode.nodeType){
        childnode.parentNode && childnode.parentNode.removeChild(childnode);
        if(!node._dom.contains(childnode)){
            node._dom.appendChild(childnode);
        }
    }else if(childnode instanceof BaseNode){
        childnode._dom.parentNode && childnode._dom.parentNode.removeChild(childnode._dom);
        childnode._parent = node;
        node._dom.appendChild(childnode._dom);
    }
};




BaseNode.prototype.dispose = function(node) {
    this.detach();
    this._dom = null;

    this.subscriptions && this.subscriptions.forEach(sub => {
        sub && sub.unsubscribe();
    });
    this.subscriptions = [];
};

BaseNode.prototype.detach = function() {
    this._parent = null;
    this._dom.parentNode && this._dom.parentNode.removeChild(this._dom);
};

BaseNode.prototype.tween = function({sv,ev,duration,repeat = 0,yoyo= false,repeatDelay = 0,delay = 0,easingFunction = 0,easingType,complete,update}) {

    var easingTypes = [ 'In', 'Out', 'InOut' ];
    var easingFuncs = [ 'Linear', 'Quadratic', 'Cubic', 'Quartic', 'Quintic', 'Sinusoidal', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce'];

    var easingFunc;
    if (easingFunction === 0) {
        easingFunc = TWEEN.Easing[easingFuncs[easingFunction]].None;
    } else {
        easingFunc = TWEEN.Easing[easingFuncs[easingFunction]][easingTypes[easingType]];
    }

    if (this._tween) {
        this._tween.stop();
    }


    this._tween = new TWEEN.Tween(sv)
        .to(ev,duration)
        .easing(easingFunc)
        .onStart(function (obj) {

        }.bind(this))
        .onStop(function (obj) {

        }.bind(this))
        .onUpdate(function (obj) {
            for (var prop in obj) {
                if(this.hasOwnProperty(prop)){
                    this[prop] = obj[prop]
                }
            }
            update && update.call(this,obj);

        }.bind(this))
        .onComplete(function (obj) {
            complete && complete.call(this,obj);
        }.bind(this))
        .onRepeat(function (obj) {

        }.bind(this))
        .repeat(repeat)
        .repeatDelay(repeatDelay)
        .yoyo(yoyo)
        .delay(delay)
        .start();
};