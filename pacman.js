//Pacman rotations
var pacmanX = degToRad(90);
var pacmanY = degToRad(-120);
var pacmanZ = 0;
//Pacman initial position/translation
var init_pacmantrans = [0,0,0];
//Pacman scaling
var pacmanSize = [0.15,0.15,0.15];


//copy of translation of pacman
var pacmanmove;

//Matrices for viewing
var mMatrix;
var pmatrix;
var viewMatrix;
var normalMatrix;
var viewmodel;
var projviewmodel;

//Uniform Locations, matrices locations
var viewmodelLoc, projviewmodelLoc, normalMLoc;
//Light uniforms locations
var ambientLoc, diffuseLoc, lightPositionLoc;

//Color of pacman
var yellow = [0.5, 0.5, 0.1];

//Movement semaphores
var pleft = true;
var pright = false;
var pdown = true;
var pup = false;

//Shadow
var light;
var shadowmatrix;
var black = [0,0,0];
var circleVertices;
var nr;
var vertCount;


//Pacman from obj file
function createPacman(gl,program,text, translation, scaling, rotatex, rotatey, rotatez) {

    var localProgram = program;

    //Model data from obj file
    parseOBJFile(text);

    var vertices = ObjData.objVertices;

    var normals = ObjData.objNormals;

    var faces = ObjData.objFaces;


    //Buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);


    //Attributes
    var vPosition = gl.getAttribLocation(localProgram, "vPosition");
    var vNormal = gl.getAttribLocation(localProgram,"vNormal");

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vNormal);


    //Uniform Locations
    getUniformsLoc(gl,localProgram)

    //Matrices from viewing initialization
    mMatrix = mat4.create();
    pmatrix = mat4.create();
    viewMatrix = mat4.create();
    normalMatrix = mat3.create();
    viewmodel = mat4.create();
    projviewmodel = mat4.create();

    //Use shader program
    gl.useProgram(localProgram);

    //actual drawing of object
    this.renderShape = function () {

        //Projection on plane
        perspective(pmatrix);

        //Local transformations of object
        localTransform(mMatrix,translation,scaling,rotatex,rotatey,rotatez)

        //Looking from positive z-axis at center
        lookingAt(viewMatrix);

        //combined matrix of model, view and projection matrices to set the coordinates
        mat4.multiply(viewmodel, viewMatrix, mMatrix);
        mat4.multiply(projviewmodel, pmatrix, viewmodel);

        //Light translation according to global coordinates
        //Light doesn't move when the object is being transformed
        mat3.normalFromMat4(normalMatrix, viewmodel);

        //send to GPU
        //Matrices for viewing
        gl.uniformMatrix3fv(normalMLoc, false, normalMatrix);
        gl.uniformMatrix4fv(viewmodelLoc, false, viewmodel);
        gl.uniformMatrix4fv(projviewmodelLoc, false, projviewmodel);

        //Light
        gl.uniform4fv(ambientLoc, Iambient);
        gl.uniform4fv(diffuseLoc, Idiffuse);
        gl.uniform4fv(lightPositionLoc, lightPosition);

        //Color of object
        gl.uniform3fv(fColor, yellow);

        //Bind buffers for drawing with current program
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

        //draw shape
        gl.drawArrays(gl.TRIANGLES, 0, faces.length / 2);

    };


    this.continuous = function (){
        //down movement
        if (translation[1] >= -1.5 && pdown) {
            pacmanX = degToRad(90);
            pacmanY = degToRad(-120);
            translation[1] -= 0.01;
        }
        //right movement
        else if(translation[0]<=1 && !pright){
            pacmanY = degToRad(-45);
            pacmanX = degToRad(45);
            pleft = false;
            translation[0] += 0.01;
        }
        //up movement
        else if(translation[1]<=0 && !pup)
        {
            pleft = true;
            pacmanX = degToRad(90);
            pacmanY = degToRad(60);
            pdown = false;
            translation[1] += 0.01;
        }
        //left movement
        else if(translation[0]>=-1 && pleft){
            pright = true;
            pacmanY = degToRad(150);
            pacmanX = degToRad(45)
            translation[0] -= 0.01;
        }
        //back to right movement
        else{
            pacmanY = degToRad(150);
            pacmanX = degToRad(45)
            pright = false;
            pleft = true;
            pdown = true;
        }
    };
    this.keyboardmove = function (){
        move(translation);
    }
    this.getTranslation = function (){
        return translation;
    }

    this.setLighting = function (){
        ambientLightColor = [0.2, 0.2, 0, 1];
        ambientMaterialColor = [ 0.5,  0.5, 0, 1.0];
        diffuseLightColor = [0.4, 0.4, 0, 1];
        diffuseMaterialColor = [1,  1, 0, 1.0];
        setLightElements(ambientLightColor, diffuseLightColor, ambientMaterialColor, diffuseMaterialColor);
    }

}
//Pacman with closed mouth obj model
function pacmanClosed(){
    pacman = new createPacman(gl,program, pacmanclosedtext, pacmanmove , pacmanSize, pacmanX, pacmanY, pacmanZ)
}
//Pacman with open mouth obj model
function pacmanOpen(){
    pacman = new createPacman(gl,program,pacmanopentext, pacmanmove, pacmanSize,pacmanX, pacmanY, pacmanZ);
}

//Shadow creation
function createShadow(gl,program, translation, scaling, rotatex, rotatey, rotatez) {

    var localProgram = program;

    circleGeometry();

    //Buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

    //Attributes
    var vPosition = gl.getAttribLocation(localProgram, "vPosition");
    var vNormal = gl.getAttribLocation(localProgram, "vNormal");

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vNormal);

    //Uniform Locations
    getUniformsLoc(gl,localProgram);

    //Matrices from viewing initialization
    mMatrix = mat4.create();
    pmatrix = mat4.create();
    viewMatrix = mat4.create();
    normalMatrix = mat3.create();
    viewmodel = mat4.create();
    projviewmodel = mat4.create();

    //Light initialization from illumination
    light = lightPosition;
    //Projection matrix for the projected shadow
    shadowmatrix = mat4.create();
    shadowmatrix[3][3] = 0;
    shadowmatrix[3][1] = -1 / light[1];

    //use Shader program
    gl.useProgram(localProgram);

    this.renderShadow = function () {

        //Projection on plane
        perspective(pmatrix);

        //Local transformations
        localTransform(mMatrix,translation,scaling,rotatex, rotatey, rotatez);

        //Looking from positive z-axis at center
        lookingAt(viewMatrix);

        mat4.multiply(viewmodel, viewMatrix, mMatrix);

        //Place shadow relative to pacman
        mat4.translate(viewmodel, viewmodel, [-0.5,-1.5,0])
        mat4.rotateX(viewmodel,viewmodel,degToRad(90));

        mat4.multiply(viewmodel, viewmodel, shadowmatrix);
        mat4.multiply(projviewmodel, pmatrix, viewmodel);
        mat3.normalFromMat4(normalMatrix, viewmodel);

        //send to GPU
        //Matrices for viewing
        gl.uniformMatrix3fv(normalMLoc, false, normalMatrix);
        gl.uniformMatrix4fv(viewmodelLoc, false, viewmodel);
        gl.uniformMatrix4fv(projviewmodelLoc, false, projviewmodel);

        //Color
        gl.uniform3fv(fColor, black);

        //bind buffers for drawing with current program
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(vPosition, vertCount, gl.FLOAT, false, 0, 0);

        //draw shape
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, nr);

    };

}
//Draw a circle for shadow projection of the sphere(=pacman)
function circleGeometry(){
    circleVertices = [];
    vertCount = 2;
    for(let i=0.0;i<=360;i++){
        var j = i*Math.PI/180;
        var vert1 = [Math.sin(j),Math.cos(j)];
        var vert2 = [0,0];
        circleVertices = circleVertices.concat(vert1);
        circleVertices = circleVertices.concat(vert2);
    }
    nr = circleVertices.length/vertCount;
}
