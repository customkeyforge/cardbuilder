function closeEnough(num1, num2) {
    return (num1 * .95) < num2 && (num1 * 1.05) > num2;
}
function replaceColor(context, newColor)
{
    var oldRed = 62;
    var oldGreen = 141;
    var oldBlue = 62;

    //console.log(`replacing color ${oldRed}${oldGreen}${oldBlue} with ${newRed}${newGreen}${newBlue}`);

    // pull the entire image into an array of pixel data
    var imageData = context.getImageData(0, 0, 715, 1000);
    const newimageData = context.createImageData(715, 1000);
    //console.log("got image color ");
    var j = 0;
    // examine every pixel, 
    // change any old rgb to the new-rgb
    for (var i=0;i<newimageData.data.length;i+=4)
    {
        //console.log("Checking " + "R" + imageData.data[i] + "G" + imageData.data[i+1] + "B" + imageData.data[i+2]);

        // is this pixel the old rgb?
        if(imageData.data[i+3] > 100) //If the pixel is anything more than fully transparent, apply the new color 
        {
            //console.log("found target color");
j++;
            // change to your new rgb
            newimageData.data[i]=newColor[0];
            newimageData.data[i+1]=newColor[1];
            newimageData.data[i+2]=newColor[2];
            newimageData.data[i+3]=255;
        }
        else {
            newimageData.data[i]=0;
            newimageData.data[i+1]=0;
            newimageData.data[i+2]=0;
            newimageData.data[i+3]=0;
        }
    }
    //console.log("replaced " + j + " pixels");
    //context.clearRect(0, 0, 5000, 5000)
    // put the altered data back on the canvas  
    context.putImageData(newimageData,0,0);
}


var desaturate = function (ctx) {
    let dimension = 400;
	var imgData = ctx.getImageData(0, 0, dimension, dimension);
	for (y = 0; y < dimension; y++) {
		for (x = 0; x < dimension; x++) {
			i = (y * dimension + x) * 4;
            // Apply Monochrome level across all channels:
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = RGBtoGRAYSCALE(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]);
            imgData.data[i + 3] *= .10;
		}
	}
	
	return imgData;
};

var RGBtoGRAYSCALE = function (r, g, b) {
	// Returns single monochrome figure:
    return 0.2125 * r + 0.7154 * g + 0.0721 * b;
};