export const name = "cardDrawer";
import { GlobalContext } from "./globalContext.js";
import { cardElement, globalMessage, parseColor } from "./utils.js";
import { fixBannerColor, fixPrimaryColor, drawArtImg, fixSecondary2Color, fixSecondary3Color, fixTextBackgroundColor, fixSecondaryColor, fixTextBackgroundStamp } from "./cardTypes.js";


var aemberImage = null;
var damageImage = null;
var pipSolidImage = null;
var pipAemberImage = null;
var controlSplit = "\u0007";
var controlBold = "\u001E";
var controlItalic = "\u001D";
var controlAember = "\u001F";
var controlDamage = "\u001C";
var globalFontBaseSize = 28;
var cardTitleFont = "";
var cardTitleFontSize = 48;
var cardPowerFont = "";
var cardTypeFont = "";
var cardTraitFont = "";
export const artCropRatio = 1.15;

var bigcanvas, bigcontext;

function ctxOp(callback) 
{
        callback(bigcontext);
}

export function warmUpFonts(canvas) {
    let context = canvas.getContext('2d');
    cardTitleFont = "RopaSansRegular";
    cardTitleFontSize = 48;
    cardTypeFont = "bold 22px RopaSansRegular";
    cardTraitFont = "26px RopaSansRegular";
    cardPowerFont = `bold 78px Bombardier`;
    context.font = `${globalFontBaseSize}px QuicksandMedium`;
    context.fillText('font initializing', 0, 0);
    context.font = `${globalFontBaseSize}px  bold RopaSansRegular`;
    context.fillText('font initializing', 0, 0);
    context.font = `bold ${cardTitleFontSize}px ${cardTitleFont}`;
    context.fillText('font initializing', 0, 0);
    context.font = cardTypeFont;
    context.fillText('font initializing', 0, 0);
    context.font = cardPowerFont;
    context.fillText('font initializing', 0, 0);
    context.clearRect(0,0,5000,5000);
}

export function drawAsync(cardId) {
    return new Promise((resolve, reject) => {
        draw(cardId);
        resolve();
    });
}
/*
function drawParentOf(element) {
    let parentTest = element;
    while (parentTest != null && parentTest.className != "cardcontainer") {
        parentTest = parentTest.parentElement;
    }
    if (parentTest == null)
        drawCurrent();
    else
        draw(parentTest.id);
}*/

export function drawCurrent() {
    let loc = location.hash.substring(1);
    if (loc.startsWith("card")) {
        draw(loc);
    }
}
export function draw(cardId) {
    let canvasWidth = 715;
    let canvasHeight = 1000;
    
    aemberImage = document.getElementById('aember');
    damageImage = document.getElementById('damage');
    pipSolidImage = document.getElementById('1pip_solid');
    pipAemberImage = document.getElementById('1pip_aember');

    let deckname = document.getElementById('deckname');
    
    let cc = document.querySelector(`#${cardId}`);
    bigcanvas = cardElement(cardId, 'bigcanvas');
    if (bigcanvas == null)
    return;
    
    textbadgecanvas = document.querySelector(`#textbadgecanvas`);
    pipcanvas = document.querySelector(`#pipcanvas`);
    let colorswapcanvas = document.querySelector(`#colorswapcanvas`);
    
    bigcanvas.width = 715;
    bigcanvas.height = 1000;
    
    let cardText = cardElement(cardId, 'cardText');
    let cardTraits = cardElement(cardId, 'cardTraits');
    let flavorText = cardElement(cardId, 'flavorText');
    let cardTitle = cardElement(cardId, 'cardTitle');
    let artImg = cardElement(cardId, 'artImg');
    let aemberCount = cardElement(cardId, 'aemberCount');
    let cardTypeSelector = cardElement(cardId, 'cardType');
    let cardPower = cardElement(cardId, 'cardPower');
    let cardArmor = cardElement(cardId, 'cardArmor');
    let customCheck = cardElement(cardId, 'customCheckbox');
    let customTypeName = cardElement(cardId, 'customTypeName');
    
    globalMessage(`Started drawing ${cardTitle.value}`);
    let globalContext = new GlobalContext();
    let primColor = globalContext.primaryColor;
    let secColor = globalContext.secondaryColor;
    let textBgColor = globalContext.textBackgroundColor;

    if (customCheck.checked) {
        primColor = parseColor(cardElement(cardId, 'primarycolor').getAttribute("customcolor"));
        secColor = parseColor(cardElement(cardId, 'secondarycolor').getAttribute("customcolor"));
        textBgColor = parseColor(cardElement(cardId, 'textbgcolor').getAttribute("customcolor"));
    }
    
    bigcontext = bigcanvas.getContext('2d');
    let textbadgecontext = textbadgecanvas.getContext('2d');
    let pipcontext = pipcanvas.getContext('2d');
    let colorswapcontext = colorswapcanvas.getContext('2d');
    
    let cardType = globalContext.cardTypes.filter((t) => t.typeName == cardTypeSelector.value)[0];

    let iconname = globalContext.globalIconName;
    if (customCheck.checked && cc.hasAttribute("customIcon")) {
        iconname = cc.getAttribute("customIcon");
        //console.log(`searching for icon with name ${iconname}`);
    }
    let allImages = Array.from(document.querySelectorAll("img"));
    let iconImage = allImages.filter((img) => img.src.endsWith(iconname))[0];
    textbadgecontext.clearRect(0,0,400,400);
    if (iconImage != null) {
        //console.log(`icon found ${iconImage.src}`);

        textbadgecontext.drawImage(iconImage, 0,0, 400, 400);
        let greybadge = desaturate(textbadgecontext);
        textbadgecontext.clearRect(0,0,400,400);
        textbadgecontext.putImageData(greybadge, 0,0);
    }

    let traitText = cardTraits.value.replaceAll('*', '•').toUpperCase();
    if (cardText == null) return;
    let fulltext = cardText.value;
    ctxOp((ctx) => ctx.clearRect(0, 0, 5000, 5000));



    ctxOp((ctx) => ctx.font = `${globalFontBaseSize}px QuicksandMedium`);

    let fixColorInImage = (img, targetContext, color) => {
        colorswapcontext.clearRect(0,0,5000,5000);
        colorswapcontext.drawImage(img, 0, 0);
        replaceColor(colorswapcontext, color);
        targetContext.drawImage(colorswapcanvas, 0,0);
    };
    cardType.drawSteps.forEach(image => {
//        console.log("drawing image");
        ctxOp((ctx) => {
            if (image == drawArtImg) 
            {
                let startx = cardType.artCoords[0];
                let starty = cardType.artCoords[1];
                let endx = canvasWidth - startx;
                let artWidth = endx - startx;
                let artHeight = artWidth * artCropRatio;
                if (artImg != null && artImg.src != null)
                    ctx.drawImage(artImg, startx,starty,artWidth, artHeight);
            }
            else if (image == fixPrimaryColor) 
            {
                fixColorInImage(cardType.primarySolidImage, ctx, primColor);
            }
            else if (image == fixSecondaryColor) 
            {
                fixColorInImage(cardType.secondarySolidImage, ctx, secColor);
            }
            else if (image == fixSecondary2Color) 
            {
                fixColorInImage(cardType.secondary2SolidImage, ctx, secColor);
            }
            else if (image == fixSecondary3Color) 
            {
                fixColorInImage(cardType.secondary3SolidImage, ctx, secColor);
            }
            else if (image == fixTextBackgroundColor) 
            {
                fixColorInImage(cardType.textBackgroundSolidImage, ctx, textBgColor);
            }
            else if (image == fixBannerColor) 
            {
                fixColorInImage(cardType.bannerSolidImage, ctx, primColor);
            }
            else if (image == fixTextBackgroundStamp) 
            {
                ctx.save();
                if (cardType.textStampShouldClip)
                {
                    let path = cardType.getClippingPath();
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 5;
                    //ctx.stroke(path);   
                    ctx.clip(path);   
                }
                ctx.drawImage(textbadgecanvas, cardType.textBadgeCoords[0],cardType.textBadgeCoords[1]);
                ctx.restore();
            }
            else
                ctx.drawImage(image, 0, 0)
        });
    });

    if (iconImage != null)
        ctxOp((ctx) => {ctx.drawImage(iconImage, 32, 20, 140, 140)});
    
    if (aemberCount.value != undefined && aemberCount.value > 0) {
        pipcontext.clearRect(0,0,1000, 1000);
    
        pipcontext.drawImage(pipSolidImage, 0, 0);
        replaceColor(pipcontext, primColor);
        pipcontext.drawImage(pipAemberImage, 0, 0);
        var pipybaseline = 145;
        var pipHeight = 100;
        for (var j = 0; j< aemberCount.value; j++)
            ctxOp((ctx) => {ctx.drawImage(pipcanvas, 28, pipybaseline + (j * pipHeight), pipHeight, pipHeight  )});
    }

    ctxOp((ctx) => 
    { 
        
        let tc = cardType.titleCurve;
/*        drawCircle(ctx, tc[0][0], tc[0][1]);
        drawCircle(ctx, tc[1][0], tc[1][1]);
        drawCircle(ctx, tc[2][0], tc[2][1]);
        drawCircle(ctx, tc[3][0], tc[3][1]);*/
        textOnCurve(ctx, cardTitle.value, 
            tc[0][0], tc[0][1],
            tc[1][0], tc[1][1],
            tc[2][0], tc[2][1],
            tc[3][0], tc[3][1], cardTitleFontSize, cardTitleFont, cardType.fallbackOffset);

        ctx.save();
        ctx.font = cardTypeFont;
        ctx.fillStyle = "#f3f3f3";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;
        ctx.shadowColor = "#222222";

        ctx.translate(cardType.typeStartCoords[0], cardType.typeStartCoords[1]);
        ctx.rotate(cardType.typeRotation * (Math.PI / 180));
        ctx.textAlign = "center";
        let tn = customTypeName.value;
        if (tn == "")
            tn = cardType.typeName.toUpperCase();
        ctx.fillText(tn, cardType.typeStartCoords[0], 0);
        ctx.restore();
    });

    if (cardType.hasPower) {
        ctxOp((ctx) => {
            ctx.save();
            ctx.font = cardPowerFont;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = "#f3f3f3";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6;
            ctx.shadowColor = "#601416";
            ctx.fillText(cardPower.value, cardType.powerCenterCoords[0], cardType.powerCenterCoords[1]);
            ctx.shadowColor = "#535960";
            let armorVal = cardArmor.value;
            let armory = cardType.armorCenterCoords[1];
            if (armorVal == "~")
                armory += 25;
            ctx.fillText(armorVal, cardType.armorCenterCoords[0], armory);
            ctx.fillStyle = "#000000";
            ctx.shadowOffsetY = 0;
            ctx.strokeText(cardPower.value, cardType.powerCenterCoords[0], cardType.powerCenterCoords[1]);
            ctx.strokeText(cardArmor.value, cardType.armorCenterCoords[0], armory);
            ctx.restore();
        });

    }
    if (cardType.hasTraits) {
        ctxOp((ctx) => {
            ctx.font = cardTraitFont;
            ctx.textAlign = 'center';
        });
        writeText(traitText, cardType.traitsCenterCoords[0], cardType.traitsCenterCoords[1]);
        ctxOp((ctx) => {
            ctx.textAlign = 'left';
        });
    }
    let decknamefontsize = cardTitleFontSize - 20;
    ctxOp((ctx) => {
        ctx.save();
        ctx.fillStyle = "#f3f3f3";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;
        ctx.shadowColor = "#222222";
        ctx.textAlign = 'center';
        let textSize = 1000;
        do {
            decknamefontsize--;
            ctx.font = `bold ${decknamefontsize}px ${cardTitleFont}`;
            textSize = ctx.measureText(deckname.value).width;
        } while (textSize > 375)
    });
    writeText(deckname.value, 490, 945);
    ctxOp((ctx) => {
        ctx.restore();
    });
    let items = parseMarkdown(fulltext).split(`${controlSplit}`).map(txt => {
        let item = parse(txt, false)
        return item;
    });

    
    let flavorTextItems = [parse(`${controlItalic}` + flavorText.value, true)];
    ctxOp((ctx) => ctx.fillStyle = "#000000");
    
    let getDrawables = (inputTextItems, inputFlavorTextItems) => {
        let totalHeight = 0;
        let xoffset = cardType.textStartCoords[0];
        let yoffset = cardType.textStartCoords[1];
        let maxwidth = 570;
        if (yoffset < 500 && aemberCount.value != undefined && aemberCount.value > 0) {
            xoffset += 60;
            maxwidth -= 60;
        }
    
        let xoffsetStart = xoffset;
        let forceCenter = false;
        let drawables = [];
    
        let layoutItems = (inputItems) => {
                inputItems.forEach(item => {
                    //console.log("laying out item: " + item.txt + "");
                    if (xoffset > maxwidth || item.txt == "<br />") {
                        xoffset = xoffsetStart;
                        yoffset = yoffset + item.height;
                        totalHeight += item.height;
                        if (item.txt == "<br />")
                            return;
                    }
                    if (item.isaember || item.isdamage)
                    {
                        drawables.push( {
                            type: "image",
                            image: item.isaember ? aemberImage : damageImage,
                            x: xoffset,
                            y: yoffset - 25,
                            width: 32,
                            height: 32,
                        });
                        xoffset += 30;
                    }
                    else {
                        
                        ctxOp((ctx) => ctx.font = item.font);
                        let startindex = 0;
                        let nextSpace = 0;
                        let textLeftToWrite = item.txt;
                        
                        let wrapPoint = 0;
                        while (textLeftToWrite.length > 0)
                        {
                            //We try to draw the entire string. 
                            //If that is too wide, we test each space starting from the end.
                            //If putting a linebreak there makes our string fit, we write it, and then
                            //continue with the rest of the string. If we fall off the beginning of the string,
                            //we just use the space closest to index 0.
                            
                            textLeftToWrite = textLeftToWrite.substring(wrapPoint > 0 ? wrapPoint + 1 : wrapPoint);
                            if (xoffset == xoffsetStart)
                                textLeftToWrite = textLeftToWrite.trimStart();
                            let width = bigcontext.measureText(textLeftToWrite).width;

                            if ((xoffset - xoffsetStart + width) > maxwidth)
                            {
                                //console.log(`Trying to wrap ${textLeftToWrite} with maxWidth ${maxwidth} and xoffset ${xoffset}`)
                                //This item needs to wrap.
                                let wrapFinished = false;
                                let wrapTestIndex = textLeftToWrite.length;
                                while (wrapFinished == false)
                                {
                                    //console.log(`wrap isn't finished. ${textLeftToWrite} with maxWidth ${maxwidth} and xoffset ${xoffset}`)

                                    let previousWrapTest = wrapTestIndex;
                                    wrapTestIndex = textLeftToWrite.lastIndexOf(' ', wrapTestIndex - 1);
                                    if (wrapTestIndex < 0)
                                    {
                                        //We couldn't find a fully working wrap.
                                        if (xoffset == xoffsetStart)
                                        {
                                            //We are already at the start of a line. Just write it, and let it overflow.
                                            ctxOp((ctx) => ctx.fillStyle = "#FF0000");
                                            let firstspace = textLeftToWrite.indexOf(' ');
                                            if (firstspace > 0)
                                            {
                                                wrapPoint = firstspace;
                                                drawables.push( {
                                                    type: "text",
                                                    text: textLeftToWrite.substring(0, firstspace + 2),
                                                    x: xoffset, 
                                                    y: yoffset,
                                                    center: forceCenter,
                                                    font: item.font,
                                                });
                                            }
                                            else
                                            {
                                                drawables.push( {
                                                    type: "text",
                                                    text: textLeftToWrite,
                                                    x: xoffset, 
                                                    y: yoffset,
                                                    center: forceCenter,
                                                    font: item.font,
                                                });
                                                wrapPoint = textLeftToWrite.length;
                                            }
                                            xoffset = xoffsetStart;
                                            yoffset = yoffset + item.height;
                                        }
                                        else
                                        {
                                            //Retry everything with the new xoffset.
                                            wrapPoint = 0;
                                            xoffset = xoffsetStart;
                                            yoffset = yoffset + item.height;
                                            totalHeight += item.height;
                                        }
                                        wrapFinished = true;
                                    }
                                    else
                                    {
                                        let newwidth = bigcontext.measureText(textLeftToWrite.substring(0, wrapTestIndex)).width;
                                        if ((xoffset - xoffsetStart + newwidth) < maxwidth)
                                        {
                                            //We found a wrap point.
                                            drawables.push( {
                                                type: "text",
                                                text: textLeftToWrite.substring(0, wrapTestIndex),
                                                x: xoffset, 
                                                y: yoffset,
                                                center: forceCenter,
                                                font: item.font,
                                            });
                                            wrapPoint = wrapTestIndex;
                                            xoffset = xoffsetStart;
                                            yoffset = yoffset + item.height;
                                            totalHeight += item.height;
                                            wrapFinished = true;
                                        }
                                    }
                                } 
                            }
                            else
                            {
                                drawables.push( {
                                    type: "text",
                                    text: textLeftToWrite,
                                    x: xoffset, 
                                    y: yoffset,
                                    center: forceCenter,
                                    font: item.font,
                                });
                                xoffset += width;
                                break;
                            }
                        }
                    }
            });
        }
        layoutItems(inputTextItems);
        xoffset = xoffsetStart;
        yoffset += globalFontBaseSize * 2;
        forceCenter = true;
        layoutItems(inputFlavorTextItems);
        return drawables;
    }

    let ds = getDrawables(items, flavorTextItems);
    ds.forEach(d => {
            if (d.type == "image")
                ctxOp((ctx) => ctx.drawImage(d.image, d.x, d.y, d.width, d.height));
            else if (d.type == "text") {
                ctxOp((ctx) => {
                    ctx.font = d.font;
                    ctx.textAlign = d.center ? "center" : "left"
                });
                writeText(d.text, 
                    d.center ? canvasWidth / 2 : d.x, 
                    d.y);
            }

    });
    globalMessage(`Finished drawing ${cardTitle.value}`);
}

function writeText(textToWrite, xoffset, yoffset)
{
    //console.log("writing text " + textToWrite + " to " + xoffset + "," + yoffset);
    ctxOp((ctx) => ctx.fillText(textToWrite, xoffset, yoffset));
}


function parseMarkdown(markdownText) {
	const htmlText = markdownText
        .replace(/  */gim, ' ')
		.replace(/\*\*(.*?)\*\*/gim, `${controlSplit}${controlBold}$1${controlSplit}`)
		.replace(/\*(.*?)\*/gim, `${controlSplit}${controlItalic}$1${controlSplit}`)
        .replace(/^\* /gim, '   • ')
        .replace(/\{aember\}/gim, `${controlSplit}${controlAember}${controlSplit}`)
        .replace(/\{damage\}/gim, `${controlSplit}${controlDamage}${controlSplit}`)
		.replace(/!\[(.*?)\]\((.*?)\)/gim, `${controlSplit}$2${controlSplit}`)
		.replace(/\[(.*?)\]\((.*?)\)/gim, `<a href='$2'>$1</a>${controlSplit}`)
		.replace(/\n/gim, `${controlSplit}<br />${controlSplit}`)

	return htmlText.trim()
}

function parse(txt, smallerSizeFont) {
    let lineHeight = 1.0;
    let headingSize = 32;
    let baseSize = globalFontBaseSize;
    let skipControl = txt.substring(1);
    let start = txt.trim().substring(0,1);
    let modifier = "";
    let isaember = false;
    let isdamage = false;
    if (smallerSizeFont)
        baseSize -= 4;
    if (txt.length > 0) {
        switch (start)
        {
            case(`${controlBold}`):
                modifier = "bold ";
            break;
            case(`${controlItalic}`):
                modifier = "italic ";
            break;
            case(`${controlAember}`):
                isaember = true;
            break;
            case(`${controlDamage}`):
                isdamage = true;
            break;
            default:
                skipControl = txt;
        }
    }

    return {
        isaember: isaember,
        isdamage: isdamage,
        font: `${modifier} ${baseSize}px QuicksandMedium`,
        height: baseSize * lineHeight,
        txt: skipControl
    };
}

function drawCircle(ctx, xCenter, yCenter)
{
    ctx.beginPath();
    ctx.arc(xCenter, yCenter, 5, 0, 2 * Math.PI);
    ctx.stroke(); 
}
