
function parseOBJFile(text) {

    //temporary model vertices
    let verticesTemp = [0];
    //temporary model normals
    let normalsTemp = [0];

    //faces indices from the obj file
    var faces = [];

    //final vertices and normals for a model
    var vertices = [];
    var normals = [];

    //take each line
    var lines = text.trim().split("\n");

    for (let l= 0; l < lines.length; l++) {
        var line = lines[l];

        //ignore blank lines
        if (line.startsWith(' ') || line.startsWith('#') || line.startsWith('o')) {
            continue;
        }

        //line split into an array
        var elements = line.split(" ");
        //first element is the letter which indicates what data type is there
        switch (elements[0]) {
            //vertices
            case 'v': {
                for (let i = 1; i < elements.length; i++) {
                    verticesTemp.push(parseFloat(elements[i]));
                }

                break;
            }
            //normals
            case 'vn': {
                for (var i = 1; i < elements.length; i++) {
                    normalsTemp.push(parseFloat(elements[i]));
                }
                break;
            }
            //faces ex.1//1 33//2 2//3 (w normals)
            case 'f': {
                //add vertices and normals to faces
                // v//vn v//vn v//vn
                for (let i = 1; i < elements.length; i++) { //goes on the line
                    let ind = elements[i].split("/");
                    //ind[0] is v ; ind[2] is vn
                    faces.push(parseFloat(ind[0]), parseFloat(ind[2]));
                }
                break;
            }
        }

    }

    //create the model geometry to be passed to the buffers
    //first element of faces is the vertex position value
    for(let i = 0; i < faces.length; i+=2){
        vertices.push(verticesTemp[3 * faces[i]-2]);//x
        vertices.push(verticesTemp[3 * faces[i]-1]);//y
        vertices.push(verticesTemp[3 * faces[i]-0]);//z
    }
    //second element of faces is the normal position value
    for (let i = 1; i < faces.length; i+=2){
        normals.push(normalsTemp[3 * faces[i]-2]);//x
        normals.push(normalsTemp[3 * faces[i]-1]);//y
        normals.push(normalsTemp[3 * faces[i]-0]);//z
    }

    return ObjData = {
        objVertices : vertices,
        objNormals : normals,
        objFaces : faces
    };


}