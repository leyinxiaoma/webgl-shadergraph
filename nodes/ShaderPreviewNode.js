
function ShaderPreviewNode(evt){
    var el = wcUtils.utils.createElement;
    var node = el('div',{
        className:"node",
        style:"width:180px;border:1px solid #232323;"
    },[
        el('div',{className:"title",style:"background:#393939;color:#fff;font-size:12px;padding:5px 5px;",innerHTML:'Preview Node'}),
        el('div',{style:"background:#393939;display:flex;"},[
            el('div',{className:'left-slot',style:"flex:1;background:#393939;border:1px solid #232323;border-left:none;min-height:50px;"},[
    
                el('div',{style:"display:flex;align-items: center;padding-left:5px;"},[
                    el('span',{className:"in-dot",inType:"vec4"}),
                    el('span',{innerHTML: 'RGBA(4)',style:"color:#fff;font-size:12px;padding-left:5px;"})
                ])
            ])
        ]),
        el('canvas',{className:"preview-canvas",width: 180,height: 180})
    ]);


    var previewcanvas = node.querySelector(".preview-canvas"); 
    var fsshader = {
        def:``,
        code:` color = vec4(1.0,0.0,0.0,1.0);
               gl_FragColor = color;`
    }; 
    var previewactions = previewnode(previewcanvas,{def:'',code:''},fsshader);


    var gnode = new GraphNode();

    gnode.outcode = {
        def:fsshader.def
    }
    gnode.fsshader = fsshader;


    gnode.dom.style.position = 'absolute';
    gnode.dom.appendChild(node);
    evt  && (gnode.position = new Vec2((evt.clientX +  10),evt.clientY));
    gnode.previewactions = previewactions;

    this.nodemoveHandler(gnode);
    this.connectEnd(gnode);



    return gnode;

}


ShaderPreviewNode.prototype = Object.create(ShaderNode.prototype);