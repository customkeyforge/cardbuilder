export const name = "jsonOps";
import { GlobalContext } from "./globalContext.js";
import { getrgbString } from "./utils.js";


export function rebuildJSON(e) {
    console.log("rebuilding json");
    let returnObj = {};
    returnObj.global = {};
    let deckname = document.querySelector(`#deckname`);
    returnObj.global.explanation = "This JSON file represents a custom Keyforge adventure. To get a printable (therefore playable) version, upload it to FILL IN URL HERE."
    returnObj.global.deckname = deckname.value;
    returnObj.global.preset = globalpreset.value;
    returnObj.cards = [];
    returnObj.images = [];
    let globalContext = new GlobalContext();
    let addImage = (image) => {
        returnObj.images.push(image);
        return returnObj.images.length - 1;
    };
    let globalCardBackImg = document.getElementById('globalCardBackImg');
    if (isImageData(globalCardBackImg.src))
        returnObj.global.cardBack = addImage(globalCardBackImg.src);
    if (globalpreset.value == "Custom") {
        let globaliconpreset = document.getElementById('globaliconpreset');
        let globalCustomIconImg = document.getElementById('globalcustomiconimg');
        returnObj.global.customIconPreset = globaliconpreset.value; 
        if (globaliconpreset.value == "Custom") {
            returnObj.global.customIconData = addImage(globalCustomIconImg.src); 
        }
        returnObj.global.primaryColor = getrgbString(globalContext.primaryColor);
        returnObj.global.secondaryColor = getrgbString(globalContext.secondaryColor);
        returnObj.global.textBackgroundColor = getrgbString(globalContext.textBackgroundColor);
    }
    let i = 0;
    function isImageData(imgsrc) {
        return imgsrc != null && imgsrc.startsWith("data:image");
    }
    document.querySelectorAll(".cardcontainer").forEach(element => {
        //console.log(`rebuilding card ${i}`);
        let cardObj = {};
        let cardText = document.querySelector(`#${element.id} #cardText`);
        cardObj.text = cardText.value;
        let cardTraits = document.querySelector(`#${element.id} #cardTraits`);
        cardObj.traits = cardTraits.value;
        let cardType = document.querySelector(`#${element.id} #cardType`);
        cardObj.cardType = cardType.value ?? "Action";
        let cardTitle = document.querySelector(`#${element.id}  #cardTitle`);
        cardObj.title = cardTitle.value;
        let cardQuantity = document.querySelector(`#${element.id}  #quantity`);
        cardObj.quantity = cardQuantity.value;
        let cardPower = document.querySelector(`#${element.id}  #cardPower`);
        cardObj.power = cardPower.value;
        let cardArmor = document.querySelector(`#${element.id}  #cardArmor`);
        cardObj.armor = cardArmor.value;
        let flavorText = document.querySelector(`#${element.id}  #flavorText`);
        cardObj.flavorText = flavorText.value;
        
        let aemberCount = document.querySelector(`#${element.id}  #aemberCount`);
        if (aemberCount.value != null)
            cardObj.aemberCount = aemberCount.value;
        let artImg = document.querySelector(`#${element.id}  #artImg`);
        if (isImageData(artImg.src))
            cardObj.artImage = addImage(artImg.src);
        cardObj.notes = document.querySelector(`#${element.id}  #cardNotes`).value ?? "";
        let customDiv = document.querySelector(`#${element.id}  #customDiv`);
        if (customDiv.style.display != "none") {
            let customPreset = document.querySelector(`#${element.id}  #customDiv .presetSelector`);
            cardObj.overrides = {
                preset: customPreset.value
            } 
            let customTypeName = document.querySelector(`#${element.id}  #customDiv #customTypeName`);
            cardObj.overrides.customTypeName = customTypeName.value ?? "";
            let customCardBackImg = document.querySelector(`#${element.id}  #customDiv #customCardBackImg`);
            if (isImageData(customCardBackImg.src))
                cardObj.overrides.customCardBack = addImage(customCardBackImg.src);;

            if (customPreset.value == "Custom") {
                let customIconDiv = document.querySelector(`#${element.id}  #customDiv #colorDiv #customIconDiv`);
                let customIconPreset = document.querySelector(`#${element.id}  #customDiv #colorDiv .presetSelector`);
                cardObj.overrides.customIconPreset = customIconPreset.value;
                if (customIconDiv.style.display != "none") {
                    let customIconImg = document.querySelector(`#${element.id}  #customDiv #colorDiv #customIconDiv img`);
                    cardObj.overrides.customIconData = addImage(customIconImg.src);
                }

                let cardPrimary = document.querySelector(`#${element.id} #customDiv #colorDiv #primarycolor`).getAttribute("customcolor")
                let cardSecondary = document.querySelector(`#${element.id} #customDiv #colorDiv #secondarycolor`).getAttribute("customcolor")
                let cardTextBg = document.querySelector(`#${element.id} #customDiv #colorDiv #textbgcolor`).getAttribute("customcolor")
                cardObj.overrides.primaryColor = cardPrimary
                cardObj.overrides.secondaryColor = cardSecondary
                cardObj.overrides.textBackgroundColor = cardTextBg
            }
        }
        returnObj.cards.push(cardObj);
    });
    let jsonstring = JSON.stringify(returnObj, null, 2);
    //console.log(`rebuilt JSON as ${jsonstring}`);
    return jsonstring;
}
