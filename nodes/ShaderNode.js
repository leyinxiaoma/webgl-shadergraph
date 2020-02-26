var globalUVid = (function uid(_uid){
    return function() { return _uid++ };
})(1);


var _globalOutId;
var globalOutId = (function(_chanelId) {
    return function() { 
         _chanelId++;
        _globalOutId = _chanelId;
        return _chanelId;
    };
})(0);


function  GraphNodeSettingFactory(gnode,settingDraw){

    return function(isBatchSetting,_batchSetting){

        function _paramSetting(cnode,_redraw){
            _redraw && _redraw(cnode);
        
            if(cnode.nextConnectNodes && cnode.nextConnectNodes.length){       
                for(var i = 0;i < cnode.nextConnectNodes.length;i++){
                    var _node  = cnode.nextConnectNodes[i];              
                    _paramSetting(_node,_redraw);                 
                }
            }   
        }       
        //batchSetting      
        _paramSetting(gnode,function(node){  
            if(isBatchSetting) {
                _batchSetting.push({
                    node:node,
                    draw:function(gl,_node){
                        gnode.outcode.params && gnode.outcode.params.forEach(p => {  
                             settingDraw && settingDraw(_node,p,gl);
                        });                          
                    }
                })
            } else{
                node.previewactions.draw(function(gl){
                    gnode.outcode.params && gnode.outcode.params.forEach(p => {  
                       settingDraw && settingDraw(node,p,gl);
                    });  
                    
               });
            }           
        
            if(gnode !== node){
                if(isBatchSetting){
                    _batchSetting = _batchSetting.concat(node.outcode.setting(isBatchSetting,[]) || []);
                }else{
                    node.outcode.setting();
                }
                
            }                
        }); 
        
        if(isBatchSetting){
            return _batchSetting
        }
        
    }
   
}


function ShaderNode(){}

ShaderNode.prototype.indots = [];
ShaderNode.prototype.outdots = [];
ShaderNode.prototype.findOutDotDataByDom = function findOutDotDataByDom(dom){
    var outdot = this.outdots.filter(d => d.dom === dom)[0];
    return outdot && outdot.data;
}

ShaderNode.prototype.findInDotDataByDom = function findInDotDataByDom(dom){
    var indot = this.indots.filter(d => d.dom === dom)[0];
    return indot && indot.data;
}

// ShaderNode.prototype.findInPathByDom = function findInPathByDom(dom){
//     var indot = this.indots.filter(d => d.dom === dom)[0];
//     return indot && indot.data;
// }


// ShaderNode.prototype.findOutPathByDom = function findOutPathByDom(dom){
//     var outdot = this.outdots.filter(d => d.dom === dom)[0];
//     return outdot && outdot.data;
// }


ShaderNode.prototype.nodemoveHandler = function nodemoveHandler(gnode){

    var _shadernode = this;
    gnode.on('node_move',function(){
        Array.prototype.forEach.call(gnode.dom.querySelectorAll('.in-dot'),function(indot){
    
           var dotdata = _shadernode.findInDotDataByDom(indot);
           if(dotdata && dotdata.dotConnect){
            var path = dotdata.dotConnect.path
           }
        
           if(path){
              var inputPt = getAttachPoint({node: dotdata.dotConnect.indot.gnode, dot:indot});
              var outputPt = getAttachPoint({node: dotdata.dotConnect.outdot.gnode, dot: dotdata.dotConnect.outdot.dom});
              var val = createPath(inputPt, outputPt);
              path.setAttributeNS(null, 'd', val);
           }
        });

        Array.prototype.forEach.call(gnode.dom.querySelectorAll('.out-dot'),function(outdot){
            var dotdata = _shadernode.findOutDotDataByDom(outdot);
            
            if(dotdata && dotdata.dotConnect){
                for(var i = 0;i <  dotdata.dotConnect.length;i++){
                    var _dotConnect = dotdata.dotConnect[i];
                    var path = _dotConnect.path
                    if(path){          
                     var inputPt = getAttachPoint({node: _dotConnect.indot.gnode, dot: _dotConnect.indot.dom});
                     var outputPt = getAttachPoint({node: _dotConnect.outdot.gnode , dot: outdot});   
              
                     var val = createPath(inputPt, outputPt);
                     path.setAttributeNS(null, 'd', val);
                 }
                }
            }
            
        });
    });
}


ShaderNode.prototype.updateShader = function(){

    var inputnode = this._gnode;
    var xcode = '',xdef = '',xcommonfunc = {
        name:'',
        code:''
    };
    if(inputnode){
        for(var i = 0;i < inputnode.prevConnectNodes.length ;i++){
            if(!inputnode.prevConnectNodes[i]) continue;
            var shadernode = inputnode.prevConnectNodes[i]._shaderNode;
            var _updatedshader = shadernode.updateShader();

            xcode = xcode + _updatedshader.code;
            xdef =  xdef + _updatedshader.def;

            var notMergeCommonFunc = (!_updatedshader.commonfunc || xcommonfunc.name.indexOf(_updatedshader.commonfunc.name) >= 0 );
            xcommonfunc =  {
                name: notMergeCommonFunc ? xcommonfunc.name : xcommonfunc.name + '$' + _updatedshader.commonfunc.name,
                code: notMergeCommonFunc ? xcommonfunc.code : xcommonfunc.code  + `
                ` + _updatedshader.commonfunc.code
            }

            console.log(xcode)

        }
    }

    var _buildshader = this.buildShader();
    var notMergeCommonFunc = (!_buildshader.commonfunc || xcommonfunc.name.indexOf(_buildshader.commonfunc.name) >= 0);

    return {
        def: xdef  + _buildshader.def,
        commonfunc: {
           name: notMergeCommonFunc ? xcommonfunc.name : xcommonfunc.name + '$' + _buildshader.commonfunc.name,
           code: notMergeCommonFunc ? xcommonfunc.code : xcommonfunc.code  + `
           ` + _buildshader.commonfunc.code
        },
        code:xcode + _buildshader.code
    };  
}



ShaderNode.prototype.buildShader = function(outputnode,inputnode){

    return {
        code:`${ wcUtils.utils.supplant(outputnode.outcode.code,{uvholder:outputnode.outcode.outparams[0]}) }
              gl_FragColor = ${outputnode.outcode.outparams[0]};
              `
    }
}

ShaderNode.prototype._updateNextShader = function(){

    var _shadernode = this;
    var inputnode = _shadernode._gnode;
   
    function findNextRoot(node){
        if(!node.nextConnectNodes || !node.nextConnectNodes.length){
            nextrootnodes.push(node);
        }else{
            nextrootnodes.push(node);
            for(var i = 0;i < node.nextConnectNodes.length;i++){
                findNextRoot(node.nextConnectNodes[i]);
            }
        }
    }

    var nextrootnodes = [];
    findNextRoot(inputnode);

    for(var i = 0;i < nextrootnodes.length;i++){
        var _shadernode = nextrootnodes[i]._shaderNode;
        var shaderout = _shadernode.updateShader(_shadernode._gnode);

        _shadernode._gnode.previewactions.update({def:'',code:''},{
            def: shaderout.def,
            commonfunc:shaderout.commonfunc,
            code:shaderout.code +  `
            gl_FragColor = ${_shadernode._gnode.outcode.priviewOutparams};` 
        });

        //_shadernode._gnode.outcode.setting();
    }

}

ShaderNode.prototype._batchSettingShader = function(){

    this._settingShader(true);

}


//向上影响
ShaderNode.prototype._settingNextShader  = function(isBatch){

    var _shadernode = this;
    var inputnode = _shadernode._gnode;
   
    function findNextRoot(node){
        if(!node.nextConnectNodes || !node.nextConnectNodes.length){
            nextrootnodes.push(node);
        }else{
            nextrootnodes.push(node);
            for(var i = 0;i < node.nextConnectNodes.length;i++){
                findNextRoot(node.nextConnectNodes[i]);
            }
        }
    }

    var nextrootnodes = [];
    findNextRoot(inputnode);


 
    for(var i = 0;i < nextrootnodes.length;i++){
        var _shadernode = nextrootnodes[i]._shaderNode;
        if(isBatch){
            var _batchGroup = _shadernode._gnode.outcode.setting(isBatch,[]);
            

            if(_batchGroup && _batchGroup[0]){


                /**TODO  GROUP */
                nextrootnodes[i].previewactions.draw(function(gl){
                    for(var _i = 0;_i < _batchGroup.length;_i++){
                        _batchGroup[_i].draw(gl,nextrootnodes[i]);     
                    }              
                });       
            }
                 
        }else{
            _shadernode._gnode.outcode.setting();
        }     
    }


}

ShaderNode.prototype._settingShader = function(isBatch){
    var _shadernode = this;
    var inputnode = _shadernode._gnode;
    var prevrootnodes = [];
    function findPrevRoot(node){
        if(!node.prevConnectNodes || !node.prevConnectNodes.length){
            prevrootnodes.push(node);
        }else{
            for(var i = 0;i < node.prevConnectNodes.length;i++){
                findPrevRoot(node.prevConnectNodes[i]);
            }
        }
    }
    findPrevRoot(inputnode);

    while(prevrootnodes.length){
        var node = prevrootnodes.shift();
        node._shaderNode._settingNextShader(isBatch);
    } 
}


ShaderNode.prototype._updateShader = function(){
    var _shadernode = this;
    var shaderout = _shadernode.updateShader(_shadernode._gnode);
    _shadernode._gnode.previewactions.update({def:'',code:''},{
        def: shaderout.def,
        commonfunc:shaderout.commonfunc,
        code:shaderout.code +  `
        gl_FragColor = ${_shadernode._gnode.outcode.priviewOutparams};` 
    });

    this._settingShader();
}
ShaderNode.prototype._beforeConnectSetting = function(dom){
}
/**
 * 
 * @param {*} options 
 * indot
 * outdot
 * path
 */
var DotConnect = (options = {}) => ({
    indot: options.indot,
    outdot: options.outdot,
    path: options.path,
    getLeftNode:function(){
        return this.outdot.gnode;
    },
    getRightNode:function(){
        return this.indot.gnode;
    }
});

var Dot = (options = {}) => ({
    path: options.path,
    gnode: options.gnode,
    dom: options.dom,
    type: options.type
});
ShaderNode.prototype.connectEnd =  function  connectEnd(gnode){

    var _shadernode = this;
    Array.prototype.forEach.call(gnode.dom.querySelectorAll('.in-dot'),function(indotdom){

        indotdom.onmouseup = function(){
            
            if(currentInput && (indotdom.inType  === currentInput.dot.outType)){
                  
                var dotdata = _shadernode.findInDotDataByDom(indotdom);
                if(dotdata.dotConnect){
                    //Array splice
                    var leftNode = dotdata.dotConnect.getLeftNode();
                    var rightNode = dotdata.dotConnect.getRightNode();

                    var leftShaderNodes = leftNode._shaderNode;
                    var dotdata2 = leftShaderNodes.findOutDotDataByDom(dotdata.dotConnect.outdot.dom);
                    dotdata2.dotConnect.splice(dotdata2.dotConnect.indexOf(dotdata.dotConnect),1);
                    leftNode.nextConnectNodes.splice(leftNode.nextConnectNodes.indexOf(rightNode),1);
          
                    rightNode.prevConnectNodes.splice(rightNode.prevConnectNodes.indexOf(leftNode),1);

                    dotdata.dotConnect.path.parentNode &&  dotdata.dotConnect.path.parentNode.removeChild( dotdata.dotConnect.path);
                    dotdata.dotConnect = null;                 
                }

                /**
                 *           
                 *  gonde  outdot +----- indot   gonde    // dotconnect
                 *                |_____ indot   gonde    // dotconnect
                 *                |_____ indot   gonde    // dotconnect
                 * */
                var dotConnect = DotConnect({

                    outdot: Dot({
                        id:"dot_" + guid.create(),
                        type: 'out',
                        path: currentInput.path,
                        dom: currentInput.dot ,
                        gnode: currentInput.node
                    }),
                    indot: Dot({
                        id:"dot_" + guid.create(),
                        type: 'in',
                        path: currentInput.path,
                        dom: indotdom,
                        gnode: gnode
                    }),
                    path: currentInput.path
                });
                dotdata.dotConnect = dotConnect;

               // gnode._prevnodes = _shadernode.indots;
                //add
                var pcnodes =   gnode.prevConnectNodes = gnode.prevConnectNodes || [];
                var leftgnode = dotConnect.getLeftNode();
                if(pcnodes.indexOf(leftgnode) >= 0 ){
                    pcnodes.splice(pcnodes.indexOf(leftgnode),1,leftgnode);
                }else{
                    pcnodes.push(leftgnode);
                }

                //prev node
                var _prevgnode = dotConnect.getLeftNode();

                dotdata = _prevgnode._shaderNode.findOutDotDataByDom(dotConnect.outdot.dom);

                dotdata.dotConnect.push(dotConnect);

                var cnodes =  _prevgnode.nextConnectNodes = _prevgnode.nextConnectNodes || [];
                if(cnodes.indexOf(gnode) >= 0 ){
                    cnodes.splice(cnodes.indexOf(gnode),1,gnode);
                }else{
                    cnodes.push(gnode);
                }
             
                currentInput.node._shaderNode._beforeConnectSetting(indotdom,gnode);

                _shadernode._updateNextShader();  
                _shadernode._batchSettingShader();

                currentInput && (currentInput.node.enable_drag = true);
                currentInput = null;      
            }  
        }
    
        indotdom.ontouchend = indotdom.onmouseup;    
    });
}


ShaderNode.prototype.connectStart = function  connectStart(gnode){
    Array.prototype.forEach.call(gnode.dom.querySelectorAll(".out-dot"),function(outdot){
        function tapdown(evt){
            var path = document.createElementNS(svg.ns, 'path');
            path.setAttributeNS(null, 'stroke', '#8e8e8e');
            path.setAttributeNS(null, 'stroke-width', '2');
            path.setAttributeNS(null, 'fill', 'none');
            svg.appendChild(path);
            
            
            currentInput = {
            dot:outdot,
            node:gnode,
            path:path
            };
            gnode.enable_drag = false;
            }
            outdot.onmousedown = tapdown;
            outdot.ontouchstart = tapdown;
    });
}