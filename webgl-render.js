function previewnode(canvas,vsshader,fsshader){

    var glcanvas = canvas;
    var gl = glcanvas.getContext('webgl',{antialias:true,alpha: true,premultipliedAlpha: false});

    //USE gl.UNSIGNED_INT
    var ext = gl.getExtension('OES_element_index_uint');

    gl.viewport(0, 0, glcanvas.width, glcanvas.height);
    gl.enable(gl.DEPTH_TEST);

    gl.clearStencil(gl.STENCIL_BUFFER_BIT);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);
    var tmplvs = (vsshader) => `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 mView;
uniform mat4 mProject;
attribute vec2 aUV;
varying vec2 vUV;
varying vec3 vNormal;
void main() {
    gl_Position = mProject * mView  * vec4(aPosition, 1.0);
    vUV = aUV;
    vNormal = aNormal;
}
`;

var tmplfs = (fsshader) => `
precision mediump float;
${fsshader.def}
varying vec3 vNormal;
varying vec2 vUV;
${ (fsshader.commonfunc && fsshader.commonfunc.code) || ""}

void main() {

   vec2 outuv = vUV;
   vec4 color;
   ${fsshader.code}
}
`;
    

    var buildShaderCode = (vsshader,fsshader) => ({
        vs:tmplvs(vsshader),
        fs:tmplfs(fsshader)
    });

    var buffers = createQuad({width:canvas.width,height:canvas.height,pivot:new Vec2(0,1)});


    var rawBuffer = gl.createBuffer();
    var buffferTypedata = buffers;
    gl.bindBuffer(gl.ARRAY_BUFFER, rawBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,buffferTypedata , gl.STATIC_DRAW);

  
    var program ;


function updateShader(_vs,_fs){
    var shader = shaderPrograme(gl,_vs,_fs);
    gl.useProgram(shader.program);

    program = shader.program;
    var aPosition = gl.getAttribLocation(program, "aPosition");
    var aTangent = gl.getAttribLocation(program, "aTangent");
    var aNormal = gl.getAttribLocation(program, "aNormal");
    var aUV = gl.getAttribLocation(program, "aUV");
    var uScreenSize = gl.getUniformLocation(program, "uScreenSize");


    var mat4 = new Mat4();


    var _orthoHeight = canvas.height,_aspect = canvas.width/canvas.height,_nearClip = -1,_farClip = 1;

    var y = _orthoHeight;
    var x = y * _aspect;
    var projectmatrix = mat4.setOrtho(0, x, -y, 0, _nearClip, _farClip);


    var mProject = gl.getUniformLocation(program, "mProject");
    gl.uniformMatrix4fv(mProject,false,projectmatrix.data);

    var viewmatrix = new Mat4();
    var mView = gl.getUniformLocation(program, "mView");
    gl.uniformMatrix4fv(mView,false,viewmatrix.data);



    gl.bindBuffer(gl.ARRAY_BUFFER, rawBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 8 * buffferTypedata.BYTES_PER_ELEMENT, 0 * buffferTypedata.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aPosition);

    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 8 * buffferTypedata.BYTES_PER_ELEMENT, 3 * buffferTypedata.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aNormal);

    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false,8 * buffferTypedata.BYTES_PER_ELEMENT, 6 * buffferTypedata.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aUV);

    gl.uniform4fv(uScreenSize,[glcanvas.width,glcanvas.height,1,1]);
}
    


var actions = {
        getContext:function() { return gl },
        getLocation: function(_location) { return gl.getUniformLocation(program, _location); },  
        uniformMap(_location, type, value) {
            var map = {
               int: (loc, val) =>  gl.uniform1i(loc, val),
               float: (loc, val) => gl.uniform1f(loc, val),
               vec2: (loc, val) => gl.uniform2fv(loc, val),
               vec3: (loc, val) => gl.uniform3fv(loc, val),
               vec4: (loc, val) => gl.uniform4fv(loc, val),
               mat2: (loc, val) => gl.uniformMatrix2fv(loc, false, val),
               mat3: (loc, val) => gl.uniformMatrix3fv(loc, false, val),
               mat4: (loc, val) => gl.uniformMatrix4fv(loc,false,  val)
            };
            _location = actions.getLocation(_location);
            map[type](_location, value);
        },
        draw(beforeDraw){
            beforeDraw  && beforeDraw(gl);
            gl.drawArrays(gl.TRIANGLE_FAN, 0,4);
        },
        readPixels(){
            gl.drawArrays(gl.TRIANGLE_FAN, 0,4);
            var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
            gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            
            return {
                        width: gl.drawingBufferWidth,
                        height: gl.drawingBufferHeight,
                        buffer: pixels
                    };      
        },
        update(vs,fs){
            var code = buildShaderCode(vs,fs);
            console.log(code.fs);
            updateShader(code.vs,code.fs);
        }
    }

    actions.update(vsshader,fsshader);
    actions.draw(); 

    return actions;

}

function TextureData(gl,pixels){
    var __pixels = pixels || null;
    var tex = gl.createTexture();
    var __channel = 0;
    return  {
        channel:function(_pixels,_channel,repeat){
            __pixels = _pixels;
            __channel = _channel;
            gl.activeTexture(gl.TEXTURE0 + __channel);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            if(repeat === true || repeat === 'repeat'){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }else{
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _pixels.width, _pixels.height, 0, gl.RGBA,  gl.UNSIGNED_BYTE, _pixels.buffer);
            gl.bindTexture(gl.TEXTURE_2D, null);
        },
        rawchannel:function(_pixels,_channel,repeat){
            __pixels = _pixels;
            __channel = _channel;
            gl.activeTexture(gl.TEXTURE0 + __channel);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            // gl.generateMipmap(gl.TEXTURE_2D);
            if(repeat === true || repeat === 'repeat'){
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }else{
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,_pixels);
            gl.bindTexture(gl.TEXTURE_2D, null);
        },
        bind: function(){
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.activeTexture(gl.TEXTURE0 + __channel);
        },
        unbind: function() {
            __pixels = null;
            __channel = 0;
            gl.deleteTexture(tex);
            //gl.bindTexture(gl.TEXTURE_2D, 0);
        },

        getContext:function(){
            return gl;
        },

        getRaw:function(){
            return __pixels;
        },
        size:function() {
            return [ __pixels.width, __pixels.height];
        }
    }
}

function createQuad(options) {
    var w = options.width || 1;
    var h = options.height || 1;

    var r = {x:0,y:0,z:1,w:1};

    var vertexData = new ArrayBuffer(4 * 8 * 4);
    var vertexDataF32 = new Float32Array(vertexData);

    // POS: 0, 0, 0
    vertexDataF32[5] = 1;          // NZ
    vertexDataF32[6] = r.x;        // U
    vertexDataF32[7] = r.y;        // V

    // POS: w, 0, 0
    vertexDataF32[8] = w;          // PX
    vertexDataF32[13] = 1;         // NZ
    vertexDataF32[14] = r.x + r.z; // U
    vertexDataF32[15] = r.y;       // V

    // POS: w, h, 0
    vertexDataF32[16] = w;         // PX
    vertexDataF32[17] = h;         // PY
    vertexDataF32[21] = 1;         // NZ
    vertexDataF32[22] = r.x + r.z; // U
    vertexDataF32[23] = r.y + r.w; // V

    // POS: 0, h, 0
    vertexDataF32[25] = h;         // PY
    vertexDataF32[29] = 1;         // NZ
    vertexDataF32[30] = r.x;       // U
    vertexDataF32[31] = r.y + r.w; // V




    //

    var pivot = options.pivot || {x:0.5,y:0.5};
    var hp = pivot.x;
    var vp = pivot.y;


    vertexDataF32[0] = 0 - hp * w;
    vertexDataF32[1] = 0 - vp * h;
    vertexDataF32[8] = w - hp * w;
    vertexDataF32[9] = 0 - vp * h;
    vertexDataF32[16] = w - hp * w;
    vertexDataF32[17] = h - vp * h;
    vertexDataF32[24] = 0 - hp * w;
    vertexDataF32[25] = h - vp * h;


    var atlasTextureWidth = 1;
    var atlasTextureHeight = 1;
    var rect = r;

    vertexDataF32[6] = rect.x / atlasTextureWidth;
    vertexDataF32[7] = rect.y / atlasTextureHeight;
    vertexDataF32[14] = (rect.x + rect.z) / atlasTextureWidth;
    vertexDataF32[15] = rect.y / atlasTextureHeight;
    vertexDataF32[22] = (rect.x + rect.z) / atlasTextureWidth;
    vertexDataF32[23] = (rect.y + rect.w) / atlasTextureHeight;
    vertexDataF32[30] = rect.x / atlasTextureWidth;
    vertexDataF32[31] = (rect.y + rect.w) / atlasTextureHeight;

    return vertexDataF32;
}

function compileShader(gl, type, src) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var errLog = gl.getShaderInfoLog(shader)
        console.log(errLog)
        gl.deleteShader(shader);
    }
    return shader;
}


function shaderPrograme(gl, vs, fs) {

        var vertSource = vs;
        var fragSource = fs;

        var vshader = compileShader(gl, gl.VERTEX_SHADER, vertSource);
        var fshader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);


        var program = gl.createProgram();
        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

            var errLog = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(errLog, 'Error linking program: ' + errLog);
        }
        return {
            program: program
        }
}

