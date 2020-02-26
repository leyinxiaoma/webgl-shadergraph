var TilingOffsetUid = (function uid(_uid){
    return function() { return _uid++ };
})(1);
function TilingOffset(evt){


    var _node = this;

    _node.tilingoffsetFunc = 'OffsetUV';

    var pid = TilingOffsetUid();

    var uniform1param = `OffsetUV_X_${pid}`;
    var uniform2param = `OffsetUV_Y_${pid}`;
    var uniform3param = `OffsetUV_TilingX_${pid}`;
    var uniform4param = `OffsetUV_TilingY_${pid}`;

       
        var el = wcUtils.utils.createElement;

        this.outdots = [
            {
                dom:el('span',{className:"out-dot",outType:"vec2"}),
                data:{
                    dotConnect:[]
                }
            }
        ];

        var node = el('div',{
            className:"node",
            style:"width:180px;border:1px solid #232323;"
        },[
            el('div',{className:"title",style:"background:#393939;color:#fff;font-size:12px;padding:5px 5px;"},[
                el('span',{innerHTML: 'TilingOffsetUV'}),
                el('wc-checkbox',{label:"clamp",style: "float:right;width:12px;height:12px;    position: relative; right: 42px;top: -4px;",className:"shadernode-edit"})
            ]),
            el('div',{style:"background:#393939;display:flex;"},[
                el('div',{className:'left-slot',style:"flex:1;background:#393939;border:1px solid #232323;border-left:none;min-height:50px;"},[
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:0,name:uniform1param,min:-1,max:1,className:"param-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'OffsetX',style:"color:#fff;font-size:12px;padding-left:5px;"})
                    ]),
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:0,name:uniform2param,min:-1,max:2,className:"param-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'OffsetY',style:"color:#fff;font-size:12px;padding-left:5px;"})
                    ]),
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:1,name:uniform3param,min:0.1,max:10,className:"param-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'TilingX',style:"color:#fff;font-size:12px;padding-left:5px;"})
                    ]),
                    el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                            el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                                el('wc-slider',{value:1,name:uniform4param,min:0.1,max:10,className:"param-slider", style:"width:70px;margin-left:2px;margin-right:2px;"}),
                                el('span',{className:"input-dot"}),
                                el('span',{className:"auto-in-dot"}),
                                el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                            ]),
                            el('span',{className:"in-dot"}),
                            el('span',{innerHTML: 'TilingY',style:"color:#fff;font-size:12px;padding-left:5px;"})
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
       

        Array.prototype.forEach.call(node.querySelectorAll("wc-slider"), function (slider) {
            slider.onmousedown = function () {
                gnode.enable_drag = false;
                window.addEventListener('mouseup', mouseup);

                function mouseup() {
                    gnode.enable_drag = true;
                    window.removeEventListener('mouseup', mouseup);
                }
            }

            slider.onchange = function (evt) {
                _node._settingNextShader();
            }
        });
        Array.prototype.forEach.call(node.querySelectorAll("wc-checkbox"), function (checkbox) {
            checkbox.onmousedown = function () {
                gnode.enable_drag = false;
                window.addEventListener('mouseup', mouseup);

                function mouseup() {
                    gnode.enable_drag = true;
                    window.removeEventListener('mouseup', mouseup);
                }
            }
            checkbox.onchange = function (evt) {
                

                if(evt.target.checked){
                    _node.tilingoffsetFunc = 'OffsetUVClamp';
                }else{
                    _node.tilingoffsetFunc = 'OffsetUV';
                }

                _node._updateNextShader();  
               // gnode.outcode.setting();          
            }
        });

        var gnode = new GraphNode();
        this._gnode = gnode;
        gnode._shaderNode = this;
        gnode.previewactions = previewactions;   
        var __globalid = globalUVid() 
        var outparams = [`outuv${__globalid}`];
        gnode.outcode = {
            def:`uniform float ${uniform1param};
            uniform float ${uniform2param};
            uniform float ${uniform3param};
            uniform float ${uniform4param};`,
            commonfunc:{
                name:'TilingAndOffset',
                code:`vec2 OffsetUV(vec2 uv, float offsetx, float offsety, float zoomx, float zoomy)
                {
                uv += vec2(offsetx, offsety);
                uv = mod(uv * vec2(zoomx, zoomy), 1.);
                return uv;
                }
                
                vec2 OffsetUVClamp(vec2 uv, float offsetx, float offsety, float zoomx, float zoomy)
{
uv += vec2(offsetx, offsety);
uv = mod(clamp(uv * vec2(zoomx, zoomy), 0.0001, 0.9999), 1.);
return uv;
}              
                `
            },
            params:[{name:uniform1param,type:"float"},{name:uniform2param,type:"float"},{name:uniform3param,type:"float"},{name:uniform4param,type:"float"}],
            outparams:outparams,
            priviewOutparams:[`vec4(${outparams},0,1)`],
            outtype:"uv2",
            setting:GraphNodeSettingFactory(gnode,function(node,p){
                var slider = gnode.dom.querySelector('wc-slider[name="' + p.name +'"]');       
                node.previewactions.uniformMap(p.name,p.type,Number(slider.value));
            })
        };

        _defineProperty( gnode.outcode, 'code', {
            get: function() {
                return `
                vec2 ${outparams[0]} = ${_node.tilingoffsetFunc}(outuv,${uniform1param},${uniform2param},${uniform3param},${uniform4param});
                `;
            }
        });


        gnode.dom.style.position = 'absolute';
        gnode.position = new Vec2((evt.clientX +  10),evt.clientY);
        gnode.dom.appendChild(node);


        this.nodemoveHandler(gnode);
        this.connectStart(gnode);
        this.connectEnd(gnode);


        setTimeout(() => {
            _node._updateShader();
        }, 0);

        return this;
}




TilingOffset.prototype = Object.create(ShaderNode.prototype);
TilingOffset.prototype.buildShader = function(){
    var inputnode = this._gnode;
    return {
        def: inputnode.outcode.def,
        code: inputnode.outcode.code,
        commonfunc: inputnode.outcode.commonfunc,
    }
}
