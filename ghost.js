
//ghosts rotations
var ghostX = degToRad(90);
var ghostY = degToRad(-120);
var ghostZ = 0;

//ghosts initial position/translation
var init_ghosttrans1 = [2,-3,0];
var init_ghosttrans2 = [-3,3,0];
//ghost scaling
var ghostSize = [0.15,0.15,0.15];

var color = [0.2,0.2,0];

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

//Movement semaphores
var gleft = true;
var gright = false;
var gdown = true;
var gup = false;

//Ghosts from obj file
function createGhost(gl,program,text, translation, scaling, rotatex, rotatey, rotatez) {

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

    this.renderGhost = function () {

        //Projection on plane
        perspective(pmatrix);

        //Local transformations
        localTransform(mMatrix,translation,scaling,rotatex, rotatey, rotatez);

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
        gl.uniform3fv(fColor, color);

        //bind buffers for drawing with current program
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

        //draw shape
        gl.drawArrays(gl.TRIANGLES, 0, faces.length / 2);


    };
    this.transformations = function (ghost){
        //ghost 1 movement
        if(ghost === ghost1) {
            //left movement
            if(translation[0]>=-3 && gleft) {
                rotatey = degToRad(150);
                rotatex = degToRad(45)
                translation[0] -= 0.01;
            }
            //right movement
            else if(translation[0]<=3 && !gright)
            {
                rotatey = degToRad(-45);
                rotatex = degToRad(45);
                gleft = false;
                translation[0] += 0.01;
            }
            //back to left movement
            else{
                rotatey = degToRad(150);
                rotatex = degToRad(45)
                gleft = true;
            }
        }
        //ghost 2 movement
        if(ghost === ghost2) {
            //down movement
            if(translation[1]>=-1 && gdown) {
                rotatex = degToRad(90);
                rotatey = degToRad(-120);
                translation[1] -= 0.01;
            }
            //up movement
            else if(translation[1]<=2 && !gup)
            {
                rotatex = degToRad(90);
                rotatey =degToRad(60);
                gdown = false;
                translation[1] += 0.01;
            }
            //back to down movement
            else{
                rotatex = degToRad(90);
                rotatey = degToRad(-120);
                gdown = true;
            }
        }
    };

    this.getTranslation = function (){
        return translation;
    }

    this.setLighting1 = function (){

        ambientLightColor = [0.2, 0.2, 0.2, 1];
        ambientMaterialColor = [0.13, 0.22, 0.15, 1];
        diffuseLightColor = [0.5, 0.5, 0.5, 1];
        diffuseMaterialColor = [0.54, 0.89, 0.63, 1];

        setLightElements(ambientLightColor, diffuseLightColor, ambientMaterialColor, diffuseMaterialColor);
    }

    this.setLighting2 = function (){

        ambientLightColor = [0.5, 0, 0.1, 1];
        ambientMaterialColor = [0.5, 0, 0, 1];
        diffuseLightColor = [1, 0, 0, 1];
        diffuseMaterialColor = [0.5, 0, 0, 1];

        setLightElements(ambientLightColor, diffuseLightColor, ambientMaterialColor, diffuseMaterialColor);

    }

}