var TwistUid = (function uid(_uid){
    return function() { return _uid++ };
})(1);

function TwistUV(evt){


    var el = wcUtils.utils.createElement;
    this.outdots = [
        {
            dom:el('span',{className:"out-dot",outType:"vec2"}),
            data:{
                dotConnect:[]
            }
        }
    ];

    var pid = TwistUid();

    var uniform1param = `TwistUV_Bend_${pid}`;
    var uniform2param = `TwistUV_PosX_${pid}`;
    var uniform3param = `TwistUV_PosY_${pid}`;
    var uniform4param = `TwistUV_Radius_${pid}`;



    var node = el('div',{
        className:"node",
        style:"width:180px;border:1px solid #232323;"
    },[
        el('div',{className:"title",style:"background:#393939;color:#fff;font-size:12px;padding:5px 5px;",innerHTML:'TwistUV'}),
        el('div',{style:"background:#393939;display:flex;"},[
            el('div',{className:'left-slot',style:"flex:1;background:#393939;border:1px solid #232323;border-left:none;min-height:50px;"},[
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:0,name:uniform1param,min:-1,max:1,className:"param-twist-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'Twist',style:"color:#fff;font-size:12px;padding-left:5px;"})
                    ]),
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:0.5,name:uniform2param,min:-1,max:2,className:"param-posx-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'PosX',style:"color:#fff;font-size:12px;padding-left:5px;"})
                    ]),
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:0.5,name:uniform3param,min:-1,max:2,className:"param-posy-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'PosY',style:"color:#fff;font-size:12px;padding-left:5px;"})
                    ]),
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:0.5,name:uniform4param,min:0,max:1,className:"param-radius-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'Radius',style:"color:#fff;font-size:12px;padding-left:5px;"})
                    ]),
            ]),
            el('div',{className:'right-slot',style:"flex:1;background:#2b2b2b;border:1px solid #232323;border-left:none;border-right:none;min-height:50px;"},[
                el('div',{
                       style:"display:flex;display: flex;justify-content: flex-end;padding-right: 5px;"
                    },[
                        el('div',{style:"display:flex;align-items: center;"},[
                            el('span',{innerHTML: 'out(2)',style:"color:#fff;font-size:12px;padding-right:5px;"}),
                            this.outdots[0].dom
                        ])
                ])
            ])
        ]),
        el('canvas',{className:"preview-canvas",width:180,height:180})
    ]);

    var canvas = node.querySelector('.preview-canvas'); 

var previewactions = previewnode(canvas,{def:'',code:''},{def:'',code:''});

var _node = this;

Array.prototype.forEach.call(node.querySelectorAll("wc-slider"),function(slider){
    slider.onmousedown = function(){
        gnode.enable_drag = false;
        window.addEventListener('mouseup',mouseup);
        function mouseup(){
            gnode.enable_drag = true;
            window.removeEventListener('mouseup',mouseup);
        }
    }

    slider.onchange = function(evt){
        _node._settingNextShader();
    }
});


var gnode = new GraphNode();
this._gnode = gnode;
gnode._shaderNode = this;
gnode.previewactions = previewactions;    
var outparams = [`outuv${globalUVid()}`];
gnode.outcode = {
    def:`
    uniform float ${uniform1param};
    uniform float ${uniform2param};
    uniform float ${uniform3param};
    uniform float ${uniform4param};
    `,
    commonfunc:{
        name:"TwistUV",

        code:`vec2 TwistUV(vec2 uv, float value, float posx, float posy, float radius)
{
vec2 center = vec2(posx, posy);
vec2 tc = uv - center;
float dist = length(tc);
if (dist < radius)
{
float percent = (radius - dist) / radius;
float theta = percent * percent * 16.0 * sin(value);
float s = sin(theta);
float c = cos(theta);
tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
}
tc += center;
return tc;
}`

    },
    params:[ {name:uniform1param,type:"float"},{name:uniform2param,type:"float"},{name:uniform3param,type:"float"},{name:uniform4param,type:"float"}],
    code: `
    vec2 ${outparams[0]} = TwistUV(outuv,${uniform1param},${uniform2param},${uniform3param},${uniform4param});
    `,
    outparams:outparams,
    priviewOutparams:[`vec4(${outparams},0,1)`],
    outtype:"uv2",
    setting:GraphNodeSettingFactory(gnode,function(node,p){
        var slider = gnode.dom.querySelector('wc-slider[name="' + p.name +'"]');               
        node.previewactions.uniformMap(p.name,p.type,Number(slider.value));
    })
};
gnode.dom.style.position = 'absolute';
gnode.position = new Vec2((evt.clientX +  10),evt.clientY);
gnode.dom.appendChild(node);


this.nodemoveHandler(gnode);
this.connectStart(gnode);
this.connectEnd(gnode);

var _node = this;
setTimeout(() => {
    _node._updateShader();
}, 0);
return this;

}


TwistUV.prototype = Object.create(ShaderNode.prototype);

TwistUV.prototype.buildShader = function(){
    var inputnode = this._gnode;
    return {
        def: inputnode.outcode.def,
        code: inputnode.outcode.code,
        commonfunc: inputnode.outcode.commonfunc,
    }
}