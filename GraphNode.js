const CURVETYPE = {
    0: 'Linear',
    1: 'Smooth Step',
    2: 'Spline',  // spline
    3: 'Step'
};

class  GraphNode extends BaseNode {
    constructor(TAG,args){
        super(TAG,args);

        this.hoststyle = document.createElement('style');
    }

    init(){
        super.init();

        this.prevConnectNodes = [];
        this.nextConnectNodes = [];
        this._slotins = [];
        this._slotouts = [];

        
        this._editor = editor;
        if (!editor) {
            throw new Error("Couldn't find current editor");
        }
        this._batchHandle = null;
        this.c = {};
        this._guid = null;
        this._request = null;
        this.enable_drag = true;

        this.setupProperties({
            linkdata:{
                type:Object,
                default:new Observer({})
            }
        });

    }


    addComponent(type, data) {
        var system = this._editor.systems[type];
        if (!system) {
            console.error("addComponent: System " + type + " doesn't exist");
            return null;
        }
        if (this.c[type]) {
            console.warn("addComponent: Entity already has " + type + " component");
            return null;
        }
        return system.addComponent(this, data);
    }

    removeComponent(type) {
        var system = this._editor.systems[type];
        if (!system) {
            console.error("removeComponent: System " + type + " doesn't exist");
            return;
        }
        if (!this.c[type]) {
            console.warn("removeComponent: Entity doesn't have " + type + " component");
            return;
        }
        system.removeComponent(this);
    }

    findComponent (type) {
        var entity = this.findOne(function (node) {
            return node.c && node.c[type];
        });
        return entity && entity.c[type];
    }

   findComponents(type) {
        var entities = this.find(function (node) {
            return node.c && node.c[type];
        });
        return entities.map(function (entity) {
            return entity.c[type];
        });
    }

    get resource_id(){
        return this.getGuid();
    }


    get Name(){
        return this._name;
    }

    set Name(value){
        this._name = value;
        this.linkdata.set('Name',this._name);
    }

    getGuid () {
        if (! this._guid) {
            this.setGuid(guid.create());
        }

        return this._guid;
    }

    setGuid(guid) {
        // var index = this._editor._entityIndex;
        // if (this._guid) {
        //     delete index[this._guid];
        // }

        this._guid = guid;
        this.linkdata.set('resource_id',this._guid);
     //   index[this._guid] = this;
    }
    attach(parentnode) {

        super.attach(parentnode);

        if(!this._attached){
            document.head.appendChild(this.hoststyle);
        }
        var pnode = parentnode;
        if(pnode.nodeType) {
            pnode = pnode.ui;
        }
        if(pnode.linkdata){
            this.linkdata.set('parent_id',pnode.linkdata.get('resource_id'));
        }

        this._attached = true;

    }

    destroy() {
        this._attached = false;
        document.head.removeChild(this.hoststyle);
        var name;

        this._destroying = true;

        for (name in this.c) {
            this.c[name].enabled = false;
        }

        for (name in this.c) {
            this.c[name].system.removeComponent(this);
        }

        if (this._parent){
            this._parent.removeChild(this);
            this.linkdata.set('parent_id','');
        }


        var children = this._children;
        var child = children.shift();
        while (child) {
            if (child instanceof pc.Entity) {
                child.destroy();
            }
            child._parent = null;
            child = children.shift();
        }

        this.emit('destroy', this);

        this.off();

        if (this._guid) {
            delete this._editor._entityIndex[this._guid];
        }

        this._destroying = false;
    }

}