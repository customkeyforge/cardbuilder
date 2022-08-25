export const name = "jsonOps";
import { serializeCardFromDom } from "./cardContainer.js";
import { GlobalContext } from "./globalContext.js";
import { addImage, getrgbString, isImageData } from "./utils.js";


export function rebuildJSON(e) {
    console.log("rebuilding json");
    let returnObj = {};
    returnObj.global = {};
    let deckname = document.querySelector(`#deckname`);
    let readme = document.querySelector(`#readme`);
    returnObj.global.explanation = "This JSON file represents a custom Keyforge adventure. To get a printable (therefore playable) version, upload it to https://customkeyforge.github.io/cardbuilder/#globalimportexport"
    returnObj.global.deckname = deckname.value;
    returnObj.global.readme = readme.value;
    returnObj.global.preset = globalpreset.value;
    returnObj.cards = [];
    returnObj.images = {};
    let globalContext = new GlobalContext();
    returnObj.changeTracker = globalContext.changeTracker;
    let globalCardBackImg = document.getElementById('globalCardBackImg');
    if (isImageData(globalCardBackImg.src))
        returnObj.global.cardBack = addImage(returnObj.images, globalCardBackImg.src);
    if (globalpreset.value == "Custom") {
        let globaliconpreset = document.getElementById('globaliconpreset');
        let globalCustomIconImg = document.getElementById('globalcustomiconimg');
        returnObj.global.customIconPreset = globaliconpreset.value; 
        if (globaliconpreset.value == "Custom") {
            returnObj.global.customIconData = addImage(returnObj.images, globalCustomIconImg.src); 
        }
        returnObj.global.primaryColor = getrgbString(globalContext.primaryColor);
        returnObj.global.secondaryColor = getrgbString(globalContext.secondaryColor);
        returnObj.global.textBackgroundColor = getrgbString(globalContext.textBackgroundColor);
    }
    let i = 0;
    document.querySelectorAll(".cardcontainer").forEach(element => {
        //console.log(`rebuilding card ${i}`);
        let cardObj = serializeCardFromDom(element.id, returnObj.images);
        returnObj.cards.push(cardObj);
    });
    let jsonstring = JSON.stringify(returnObj, null, 2);
    //console.log(`rebuilt JSON as ${jsonstring}`);
    return jsonstring;
}
