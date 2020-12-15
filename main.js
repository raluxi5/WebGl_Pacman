const { mat3, mat4, vec4} = glMatrix;

var canvas;
var gl;

var program;
var labtext; //cubes for the labyrinth
var pacmanclosedtext; //pacman mouth closed
var pacmanopentext;
var ghosttext;
var foodtext;


//Shapes seen from the positive z-axis
var eye = [0,0,1];
//Where the eye will look at
var target = [0,0,0];

//first render
var first = false;

//pacman instance
var pacman;
var shadow;
//Ghost instances
var ghost1;
var ghost2;


//Async function for loading the .obj file
window.onload = async function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //Load the .obj files
    const response1 = await fetch('models/cube.obj');
    labtext = await response1.text();
    const response2 = await fetch('models/pacmanclosed.obj');
    pacmanclosedtext = await response2.text();
    const response3 = await fetch('models/sphere.obj');
    foodtext = await response3.text();
    const response4 = await fetch('models/pacmanopen.obj');
    pacmanopentext = await response4.text();
    const response5 = await fetch('models/ghost.obj');
    ghosttext = await response5.text();

    //Shader program
    program = shaders(gl, "Pvertex-shader", "Pfragment-shader");

    createModels();

    function renderLoop() {
        requestAnimationFrame(renderLoop);

        gl.clearColor(0, 0.1, 0,1);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);

        gl.viewport(0, 0, canvas.width, canvas.height);

        drawScene();

    }

    //Drawing starts here
    requestAnimationFrame(renderLoop);

}

function drawScene(){
    //Labyrinth drawing
    for(let i = 0 ; i < cubesMatrix.length; i++) {
        for (let j = 0; j < cubesMatrix.length; j++){
            if(cubesMatrix[i][j] !== 0) {
                cubesMatrix[i][j].setLighting();
                cubesMatrix[i][j].renderShape();
            }
        }
    }
    //Ghosts drawing
    ghost1.setLighting1();
    ghost1.renderGhost();
    ghost1.transformations(ghost1);
    ghost2.setLighting2();
    ghost2.renderGhost();
    ghost2.transformations(ghost2);


    if(!first){
        pacman.setLighting();
        pacman.renderShape();
        shadow.renderShadow();
        first = true;
    }
    else {
        pacmanmove = pacman.getTranslation();
        // open close mouth movements
        for (let i = 1; i <= 30; i++) {
            setTimeout("pacmanOpen()", 1)
            pacman.setLighting();
            pacman.renderShape();
            shadow.renderShadow();

        }
        for (let i = 1; i <= 30; i++) {
            setTimeout("pacmanClosed()", 1)
            pacman.setLighting();
            pacman.renderShape();
            shadow.renderShadow();
        }

    }

    //keyboard controlling
    if(right || left || up || down){
        pacman.keyboardmove();
    }else{
        //default continous movement
        pacman.continuous();
    }

}

function createModels(){
    //generate the labyrinth
    generateLabyrinth();

    //Pacman creation
    pacman = new createPacman(gl, program, pacmanclosedtext, init_pacmantrans,pacmanSize,pacmanX, pacmanY,pacmanZ);
    shadow = new createShadow(gl,program,init_pacmantrans,pacmanSize,pacmanX, pacmanY, pacmanZ);

    //ghost creation
    ghost1 = new createGhost(gl, program, ghosttext, init_ghosttrans1,ghostSize, ghostX, ghostY, ghostZ);
    ghost2 = new createGhost(gl, program, ghosttext, init_ghosttrans2,ghostSize, ghostX, ghostY, ghostZ);
}

function lookingAt(viewMatrix){
    //Looking from positive z-axis at center
    mat4.lookAt(viewMatrix, eye, target, [0, 1, 0]);

    //Modify view->shear view
    mat4.rotateX(viewMatrix,viewMatrix,degToRad(-45 ))
    mat4.translate(viewMatrix,viewMatrix,[0,5,-3.5]);
}

//Perspective projection function
function perspective(pmatrix){

    const fieldOfView = 50 * Math.PI / 180;
    //width/height ratio that matches the display size of the canvas
    const aspect = gl.canvas.width / gl.canvas.height;
    //objects between 0.1 units
    const zNear = 0.1;
    //and 100 units away from the camera
    const zFar = 100;

    //Perspective projection view
    mat4.perspective(pmatrix, fieldOfView, aspect, zNear, zFar);

}

function localTransform(mMatrix, translation,scaling, rotatex, rotatey, rotatez){

    mat4.identity(mMatrix);
    mat4.translate(mMatrix, mMatrix, translation);
    mat4.scale(mMatrix, mMatrix, scaling);
    mat4.rotateX(mMatrix, mMatrix, rotatex);
    mat4.rotateY(mMatrix, mMatrix, rotatey);
    mat4.rotateZ(mMatrix, mMatrix, rotatez);
}

//Function for transforming degrees in radians
function degToRad(d) {
    return d * Math.PI / 180;
}

function getUniformsLoc(gl,program){

    //Uniforms location from shaders, matrices for viewing and vectors for light and color
    normalMLoc = gl.getUniformLocation(program, "normalMatrix");
    viewmodelLoc = gl.getUniformLocation(program,"modelViewMatrix");
    projviewmodelLoc = gl.getUniformLocation(program,"modelviewprojMatrix");
    ambientLoc = gl.getUniformLocation(program, "Iambient");
    diffuseLoc = gl.getUniformLocation(program,"Idiffuse");
    lightPositionLoc = gl.getUniformLocation(program,"lightPosition");
    fColor = gl.getUniformLocation(program, "fColor");

}


//Translation
//Keyboard keys for moving pacman
var left = false;
var right = false;
var up = false;
var down = false;


function move(translation){
    //translation
    if (right) {
        //rotate
        pacmanY = degToRad(-45);
        pacmanX = degToRad(45);
        //translate
        translation[0] += 0.01;
    }
    if (left) {
        //rotate
        pacmanY = degToRad(150);
        pacmanX = degToRad(45)
        //translate
        translation[0] -= 0.01;

    }
    if (up) {
        //rotate
        pacmanX = degToRad(90);
        pacmanY = degToRad(60);
        //translate
        translation[1] += 0.01;
    }
    if (down) {
        //rotate
        pacmanX = degToRad(90);
        pacmanY = degToRad(-120);
        //translate
        translation[1] -= 0.01;
    }
}
document.addEventListener("keydown", function (event) {

    //Translation
    if (event.keyCode == 37)
        left = true;
    if (event.keyCode == 39)
        right = true;
    if (event.keyCode == 38)
        up = true;
    if (event.keyCode == 40)
        down = true;


});

document.addEventListener("keyup", function (event) {

    //Translation
    if (event.keyCode == 37)
        left = false;
    if (event.keyCode == 39)
        right = false;
    if (event.keyCode == 38)
        up = false;
    if (event.keyCode == 40)
        down = false;


});


