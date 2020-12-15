//Point light-source vector
//w component = 1 for point light-source
//w component = 0 for distant light-source at infinity
const lightPosition = [-10, 2, 5, 0];

//vectors which create the lighting components
//LightColor and MaterialColor for the shapes
var ambientLightColor = [];
var diffuseLightColor = [];

var ambientMaterialColor = [];
var diffuseMaterialColor = [];

//final light that will pe applied
var Iambient, Idiffuse;


//Sets the lighting components
//multiplies the light color with the material coefficient to be sent to the shaders
function setLightElements(lightAmbient, lightDiffuse, materialAmbient, materialDiffuse){

    Iambient = vec4.create();
    Idiffuse = vec4.create();

    vec4.multiply(Iambient,lightAmbient, materialAmbient);
    vec4.multiply(Idiffuse,lightDiffuse, materialDiffuse);
}