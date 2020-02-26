function BlendAdd(evt){

    var el = wcUtils.utils.createElement;

    this.indots = [
        {
            dom: el('span',{className:"in-dot",inType:"vec4",datain:"0"}),         
            data:{
                dotConnect:null
            }
        },
        {
            dom: el('span',{className:"in-dot",inType:"vec4",datain:"1"}),
            data:{
                dotConnect:null
            }
        }
    ];

    this.outdots = [
        {
            dom: el('span',{className:"out-dot",outType:"vec4"}),
            data:{
                dotConnect:[]
            }
        }
    ];

    var node = el('div',{
        className:"node",
        style:"width:180px;border:1px solid #232323;"
    },[
        el('div',{className:"title",style:"background:#393939;color:#fff;font-size:12px;padding:5px 5px;",innerHTML:'Blend Add'}),
        el('div',{style:"background:#393939;display:flex;"},[
            el('div',{className:'left-slot',style:"flex:1;background:#393939;border:1px solid #232323;border-left:none;min-height:50px;"},[
    
                el('div',{style:"display:flex;align-items: center;padding-left:5px;"},[
                    this.indots[0].dom,
                    el('span',{innerHTML: 'rgba(4)',style:"color:#fff;font-size:12px;padding-left:5px;"})
                ]),
    
                el('div',{style:"display:flex;align-items: center;padding-left:5px;"},[
                    this.indots[1].dom,
                    el('span',{innerHTML: 'rgba(4)',style:"color:#fff;font-size:12px;padding-left:5px;"})
                ])
            ]),
            el('div',{className:'right-slot',style:"flex:1;background:#2b2b2b;border:1px solid #232323;border-left:none;border-right:none;min-height:50px;"},[
                el('div',{
                    style:"display:flex;display: flex;justify-content: flex-end;padding-right: 5px;"
                },[
                    el('div',{style:"display:flex;align-items: center;"},[
                        el('span',{innerHTML: 'out(4)',style:"color:#fff;font-size:12px;padding-right:5px;"}),
                        this.outdots[0].dom
                    ])
                ])
            ])
        ]),
        el('canvas',{className:"preview-canvas",width:180,height:180})
    ]);
    
    
    
    var previewcanvas = node.querySelector('.preview-canvas'); 
    var previewactions = previewnode(previewcanvas,{def:'',code:''},{def:'',code:''});



    var gnode = new GraphNode();
    this._gnode = gnode;
    gnode._shaderNode = this;

    gnode.dom.style.position = 'absolute';
    gnode.dom.appendChild(node);
    gnode.position = new Vec2((evt.clientX +  10),evt.clientY);
    gnode.previewactions = previewactions;
    this.nodemoveHandler(gnode);
    this.connectStart(gnode);
    this.connectEnd(gnode);
    var __globalid = globalOutId();
    gnode.outcode = {
        def:``,
        commonfunc:{
            name:'BlendAdd',
            code:`vec4 OperationBlend(vec4 origin, vec4 overlay, float blend)
        {
        vec4 o = origin; 
        o.a = overlay.a + origin.a * (1. - overlay.a);
        o.rgb = (overlay.rgb * overlay.a + origin.rgb * origin.a * (1. - overlay.a)) * (o.a+0.0000001);
        o.a = clamp(o.a,0.0,1.0);
        o = mix(origin, o, blend);
        return o;
        }`
        },
        code:`
        vec4 outcolor${__globalid} = OperationBlend({{texture_1}},{{texture_2}},1.0);
        `,
        outparams:[`outcolor${__globalid}`],
        priviewOutparams:[`outcolor${__globalid}`],
        setting: function(gl){

        }
    }
    var _node = this;
    setTimeout(() => {
        _node._updateShader();
    }, 0);
    return this;
}



BlendAdd.prototype = Object.create(ShaderNode.prototype);
BlendAdd.prototype.buildShader = function(){
    var inputShaderNode = this;
    var in0 = !!inputShaderNode.indots[0].data.dotConnect; 
    var in1 = !!inputShaderNode.indots[1].data.dotConnect;

    var outputnode1 =  (in0 && inputShaderNode.indots[0].data.dotConnect.getLeftNode());
    var outputnode2 =  (in1 && inputShaderNode.indots[1].data.dotConnect.getLeftNode());

    var inputnode = inputShaderNode._gnode;
    var _outcode_in = wcUtils.utils.supplant(inputnode.outcode.code,{
        texture_1: !!outputnode1?outputnode1.outcode.outparams[0]:`vec4(0.,0.,0.,0.)`,
        texture_2: !!outputnode2?outputnode2.outcode.outparams[0]:`vec4(0.,0.,0.,0.)`
    });

    return {
        def: inputnode.outcode.def,
        code:`${_outcode_in}`,
        commonfunc:inputnode.outcode.commonfunc,
    }
}