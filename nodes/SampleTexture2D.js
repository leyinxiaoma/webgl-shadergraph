
var globalChannelId = (function(_chanelId) {
    return function() { return _chanelId++; };
})(0);
var sourcelist = {};



function SampleTexture2D(evt){
    var el = wcUtils.utils.createElement;

    this.indots = [
        {
            dom:el('span',{className:"in-dot",inType:"vec4",datain:"0"}),         
            data:{
                dotConnect:null
            }
        },
        {
            dom: el('span',{className:"in-dot",inType:"vec2",datain:"1"}),
            data:{
                dotConnect:null
            }
        }
    ];

    this.outdots = [
        {
            dom:el('span',{className:"out-dot",outType:"vec4"}),
            data:{
                dotConnect:[]
            }
        }
    ];

    
    var node = el('div',{
        className:"node",
        style:"width:180px;border:1px solid #232323;"
    },[
        el('div',{className:"title",style:"background:#393939;color:#fff;font-size:12px;padding:5px 5px;",innerHTML:'Sample Texture 2D'}),
        el('div',{style:"background:#393939;display:flex;"},[
            el('div',{className:'left-slot',style:"flex:1;background:#393939;border:1px solid #232323;border-left:none;min-height:50px;"},[
                el('div',{style:"display:flex;align-items: center;padding-left:5px;position:relative"},[
                    el('div',{style:"position:absolute;display:flex;align-items: center;right:100px;height:20px;width:100px;background:#393939;"},[
                        el('div',{className:"input-preview", style:"width:70px;margin-left:2px;height:16px;margin-right:2px;border:1px solid #232323;"}),
                        el('span',{className:"input-dot"}),
                        el('span',{className:"auto-in-dot"}),
                        el('div',{style:"position:absolute;height:2px;width: 24px;background: #d85d15b3;right: -20px;mix-blend-mode: color;"}),
                    ]),
                    this.indots[0].dom,
                    el('span',{innerHTML: 'Texture(T2)',style:"color:#fff;font-size:12px;padding-left:5px;"})
                ]),

                el('div',{style:"display:flex;align-items: center;padding-left:5px;"},[
                    this.indots[1].dom,
                    el('span',{innerHTML: 'UV(2)',style:"color:#fff;font-size:12px;padding-left:5px;"})
                ])
            ]),
            el('div',{className:'right-slot',style:"flex:1;background:#2b2b2b;border:1px solid #232323;border-left:none;border-right:none;min-height:50px;"}, [
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


    var fileinput = fileinput || el('input',{
        type:"file",
        accept:"image/*"
    });
    fileinput.addEventListener('change',function(evt){
        evt.preventDefault();
        var files = evt.target.files || evt.dataTransfer.files;
        if (files) {
            Array.prototype.forEach.call(files,file => {
    
                var sourcename = evt.target.name
                var reader = new FileReader();
                reader.onload = () => {
                    var img = new Image();
                    img.onload = () => {
                        sourcelist[sourcename] = {
                            file:img,
                            filename: file.name,
                            src: img.src,
                            width:img.width,
                            height:img.height
                        }
                        fileinput.name = "";
    
                        sourcein();
                    };
                    img.src = reader.result
                };
                reader.readAsDataURL(file)
            });
        }
    });

    var previewcanvas = node.querySelector('.preview-canvas'); 
    var previewactions = previewnode(previewcanvas,{def:'',code:''},{def:'',code:''});

    function sourcein(){
        var _sourcein = sourcelist[gnode.resource_id + "_t1"];
        var inputpreview = node.querySelector('.input-preview'); 
        inputpreview.style.background = 'url(' + _sourcein.src + ')';
      
        gnode.outcode.params[0].source = _sourcein.file;
      
        gnode.emit("connect-change");
      }

      var inputdom = node.querySelector('.input-dot');
      inputdom.addEventListener('click',function(){
          fileinput.name = gnode.resource_id + "_t1";
          fileinput.click();
      });
      
      var gnode = new GraphNode();
      this._gnode = gnode;
      gnode._nodeName = "SampleTexture2D";
      gnode._shaderNode = this;   
      var __chanelId = globalChannelId();
      var attributeParams = "iChannel" + __chanelId;
      
      gnode.on("connect-change",function(){
          var _curnode = gnode;
          console.log('texture change');
          _curnode.outcode.setting();      
      });
      
      gnode.outcode = {
        def:`
        uniform sampler2D ${attributeParams};
        `,
        commonfunc: null,
        params:[{
            name:attributeParams,
            type:"int",
            value:__chanelId,
            source:null
        }],
        code: `
        vec4 color${__chanelId} = texture2D(${attributeParams},{{uvholder}});
        `,
        outparams:[`color${__chanelId}`],
        priviewOutparams:[`color${__chanelId}`],
        setting:GraphNodeSettingFactory(gnode,function(node,p,gl){
            var realChannelPos = 0;
            if(p.source && (p.source !== (node.previewactions[p.name] && node.previewactions[p.name].getRaw()))){

                var declareChannelPos,realChannelPos;

                var _influNodes = gnode._shaderNode.influNodes || [];
                for(var i = 0; i < _influNodes.length; i++){
                    if(_influNodes[i][0] === node){
                        declareChannelPos = _influNodes[i][1];
                        break;
                    }
                }

                //real  slot is what?
                // get real slot pos;

                if(gnode === node){
                    realChannelPos = 0;
                }else{
                    realChannelPos = declareChannelPos;
                }
                // if(declareChannelPos !== 0 && !node.previewactions["iChannel" + (--declareChannelPos)]){
                //     realChannelPos = 0;
                // }else{
                    
                // }             
                console.log(node._nodeName + ' texture change ' + realChannelPos);
                var iChannelTex = new TextureData(gl);
                iChannelTex.rawchannel(p.source,Number(realChannelPos));
                iChannelTex.bind(Number(realChannelPos));
                node.previewactions[p.name] = iChannelTex;
            }
         
            if(node.previewactions[p]){
                console.log(uniformMap + p.name + ' '+ p.type + ' texture change ' + realChannelPos);
                node.previewactions.uniformMap(p.name,p.type,Number(realChannelPos));
            }             
        })
      };

      gnode.dom.style.position = 'absolute';
      gnode.dom.appendChild(node);
      gnode.position = new Vec2((evt.clientX +  10),evt.clientY);
      gnode.previewactions = previewactions;
      
      this.nodemoveHandler(gnode);
      this.connectStart(gnode);
      this.connectEnd(gnode);

      var _node = this;
      setTimeout(() => {
          _node._updateShader();
      }, 0);

      return this;
}


SampleTexture2D.prototype = Object.create(ShaderNode.prototype);
SampleTexture2D.prototype.buildShader = function(){

    var inputShaderNode = this;
    var inputnode = inputShaderNode._gnode;
    var outputnode =  (inputShaderNode.indots[1] && inputShaderNode.indots[1].data.dotConnect && inputShaderNode.indots[1].data.dotConnect.getLeftNode()); //uvnode
    if(outputnode && outputnode.outcode.outtype ==="uv2"){
        var _outcode = wcUtils.utils.supplant(inputnode.outcode.code,{uvholder:outputnode.outcode.outparams[0]});  
    }else{
        _outcode = wcUtils.utils.supplant(inputnode.outcode.code,{uvholder:"outuv"});
    }
    
    return {    
        def:  inputnode.outcode.def,
        commonfunc:inputnode.outcode.commonfunc,
        code:`${_outcode}`
    }
}


SampleTexture2D.prototype._beforeConnectSetting = function(connectDom,connectNode){
    
    //tump [connectNode,number(connectDom.datain)]

    var _influNodes = this.influNodes = this.influNodes || [];
    _influNodes.push([connectNode,Number(connectDom.datain)]);

    
}


