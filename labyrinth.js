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

//Cube color
var purple = [0.6,0.5,0.9];
//Sphere color
var green = [0,0.8,0.3];

//Labyrinth Data
var cubesMatrix = [];

var startx = -3.5;
var starty = 3.5;
var spacingx = 0.5;
var spacingy = 0.5;

var labScaling = [0.25, 0.25, 0.25];

var foodScaling = [0.01,0.01,0.01];

function createLabyrinth(gl,program,text, translation, scaling) {

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
    getUniformsLoc(gl,localProgram);

    //Matrices from viewing initialization
    mMatrix = mat4.create();
    pmatrix = mat4.create();
    viewMatrix = mat4.create();
    normalMatrix = mat3.create();
    viewmodel = mat4.create();
    projviewmodel = mat4.create();


    gl.useProgram(localProgram);


    this.renderShape = function () {

        //Projection on plane
        perspective(pmatrix);

        //Initial transformations
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, mMatrix, translation);
        mat4.scale(mMatrix, mMatrix, scaling);

        //Looking from positive z-axis at center
        lookingAt(viewMatrix);

        //combined matrix of model view and projection matrices to set the coordinates
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

        //Color
        gl.uniform3fv(fColor, purple);

        //bind buffers for drawing with current program
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);


        //draw shape
        gl.drawArrays(gl.TRIANGLES, 0, faces.length / 2);

    };

    //Labyrinth lighting
    this.setLighting = function (){

        ambientLightColor = [0.2, 0.5, 0.8, 1];
        ambientMaterialColor = [0.3, 0.3, 0.15, 1];
        diffuseLightColor = [1, 0.5, 1, 1];
        diffuseMaterialColor = [0.54, 0.1, 0.63, 1];

        setLightElements(ambientLightColor, diffuseLightColor, ambientMaterialColor, diffuseMaterialColor);
    }


}
function createFood(gl,program,text, translation, scaling) {

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
    getUniformsLoc(gl,localProgram);

    //Matrices from viewing initialization
    mMatrix = mat4.create();
    pmatrix = mat4.create();
    viewMatrix = mat4.create();
    normalMatrix = mat3.create();
    viewmodel = mat4.create();
    projviewmodel = mat4.create();


    gl.useProgram(localProgram);


    this.renderShape = function () {

        //Projection on plane
        perspective(pmatrix);

        //Initial transformations
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, mMatrix, translation);
        mat4.scale(mMatrix, mMatrix, scaling);

        //Looking from positive z-axis at center
        lookingAt(viewMatrix);

        //combined matrix of model view and projection matrices to set the coordinates
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

        //Color
        gl.uniform3fv(fColor, green);

        //bind buffers for drawing with current program
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);


        //draw shape
        gl.drawArrays(gl.TRIANGLES, 0, faces.length / 2);

    };

    //Labyrinth lighting
    this.setLighting = function (){

        ambientLightColor = [0.5, 0.5, 0.5, 1];
        ambientMaterialColor = [0.3, 0.3, 0.15, 1];
        diffuseLightColor = [1, 0.5, 1, 1];
        diffuseMaterialColor = [0.54, 0.4, 0.63, 1];

        setLightElements(ambientLightColor, diffuseLightColor, ambientMaterialColor, diffuseMaterialColor);
    }


}

function generateLabyrinth(){

    let labyrinth = [
        [1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1, 1, 1, 1],
        [1 , 0 , 0 , 0 , 0 , 0 , 1 , 0 , 0 , 0 , 0 , 0, 0, 0, 1],
        [1 , 0 , 1 , 1 , 1 , 0 , 1 , 1 , 1 , 1 , 1 , 0, 1, 0, 1],
        [1 , 0 , 0 , 0 , 0 , 0 , 1 , 0 , 0 , 0 , 0 , 0, 1, 0, 1],
        [1 , 0 , 1 , 1 , 1 , 0 , 1 , 0 , 1 , 1 , 1 , 1, 1, 1, 1],
        [1 , 0 , 0 , 0 , 1 , 0 , 1 , 0 , 0 , 0 , 0 , 1, 0, 0, 1],
        [1 , 0 , 1 , 0 , 0 , 0 , 1 , 0 , 1 , 1 , 0 , 1, 1, 0, 1],
        [1 , 0 , 1 , 0 , 1 , 0 , 0 , 0 , 0 , 0 , 0 , 0, 1, 0, 1],
        [1 , 0 , 1 , 0 , 1 , 0 , 1 , 0 , 1 , 0 , 1 , 0, 0, 0, 1],
        [1 , 0 , 1 , 1 , 1 , 0 , 1 , 0 , 1 , 0 , 1 , 0, 1, 1, 1],
        [1 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0, 0, 0, 1],
        [1 , 1 , 1 , 1 , 1 , 0 , 1 , 1 , 0 , 1 , 1 , 0, 1, 1, 1],
        [1 , 1 , 0 , 1 , 0 , 0 , 1 , 1 , 0 , 1 , 1 , 0, 1 ,1, 1],
        [1 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0, 0, 0, 1],
        [1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1, 1, 1, 1],
    ];



    for(let i = 0; i<labyrinth.length;i++){
        cubesMatrix[i] = [];
        for(let j = 0; j<labyrinth.length;j++){
            if(labyrinth[i][j] === 1) {
                cubesMatrix[i][j] = new createLabyrinth(gl, program, labtext, [startx, starty, 0], labScaling);
            }
            else{
                cubesMatrix[i][j] = new createFood(gl,program, foodtext,[startx,starty,0],foodScaling); //no cube created => way with food
            }
            startx += spacingx;
        }
        startx = -3.5;
        starty-=spacingy;
    }


}
