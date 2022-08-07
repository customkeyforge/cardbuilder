



function rebuildJSON(e) {
    console.log("rebuilding json");
    returnObj = {};
    returnObj.global = {};
    let deckname = document.querySelector(`#deckname`);
    returnObj.global.explanation = "This JSON file represents a custom Keyforge adventure. To get a printable (therefore playable) version, upload it to FILL IN URL HERE."
    returnObj.global.deckname = deckname.value;
    returnObj.global.preset = globalpreset.value;
    returnObj.cards = [];
    returnObj.images = [];
    addImage = (image) => {
        returnObj.images.push(image);
        return returnObj.images.length - 1;
    };
    if (globalpreset.value == "Custom") {
        returnObj.global.customIconPreset = globaliconpreset.value; 
        if (globaliconpreset.value == "Custom") {
            returnObj.global.customIconData = addImage(globalCustomIconImg.src); 
        }
        returnObj.global.primaryColor = primaryColorManager.getrgbString(primaryColorManager.color);
        returnObj.global.secondaryColor = secondaryColorManager.getrgbString(secondaryColorManager.color);
        returnObj.global.textBackgroundColor = textBackgroundColorManager.getrgbString(textBackgroundColorManager.color);
    }
    i = 0;
    document.querySelectorAll(".cardcontainer").forEach(element => {
        //console.log(`rebuilding card ${i}`);
        cardObj = {};
        cardText = document.querySelector(`#${element.id} > #cardText`);
        cardObj.text = cardText.value;
        let cardTraits = document.querySelector(`#${element.id} > #cardTraits`);
        cardObj.traits = cardTraits.value;
        let cardType = document.querySelector(`#${element.id} > #cardType`);
        cardObj.cardType = cardType.value ?? "Action";
        cardTitle = document.querySelector(`#${element.id} >  #cardTitle`);
        cardObj.title = cardTitle.value;
        cardQuantity = document.querySelector(`#${element.id} >  #quantity`);
        cardObj.quantity = cardQuantity.value;
        let cardPower = document.querySelector(`#${element.id} >  #cardPower`);
        cardObj.power = cardPower.value;
        let cardArmor = document.querySelector(`#${element.id} >  #cardArmor`);
        cardObj.armor = cardArmor.value;
        let flavorText = document.querySelector(`#${element.id} >  #flavorText`);
        cardObj.flavorText = flavorText.value;
        
        let aemberCount = document.querySelector(`#${element.id} >  #aemberCount`);
        if (aemberCount.value != null)
            cardObj.aemberCount = aemberCount.value;
        let artImg = document.querySelector(`#${element.id} >  #artImg`);
        if (artImg.src != null && artImg.src.startsWith("data:image"))
            cardObj.artImage = addImage(artImg.src);
        cardObj.notes = document.querySelector(`#${element.id} >  #cardNotes`).value ?? "";
        customDiv = document.querySelector(`#${element.id} >  #customDiv`);
        if (customDiv.style.display != "none") {
            let customPreset = document.querySelector(`#${element.id} >  #customDiv > .presetSelector`);
            cardObj.overrides = {
                preset: customPreset.value
            } 
            if (customPreset.value == "Custom") {
                let customIconDiv = document.querySelector(`#${element.id} >  #customDiv > #colorDiv > #customIconDiv`);
                let customIconPreset = document.querySelector(`#${element.id} >  #customDiv > #colorDiv > .presetSelector`);
                cardObj.overrides.customIconPreset = customIconPreset.value;
                if (customIconDiv.style.display != "none") {
                    let customIconImg = document.querySelector(`#${element.id} >  #customDiv > #colorDiv > #customIconDiv > img`);
                    cardObj.overrides.customIconData = addImage(customIconImg.src);
                }

                let cardPrimary = document.querySelector(`#${element.id} > #customDiv > #colorDiv > #primarycolor`).getAttribute("customcolor")
                let cardSecondary = document.querySelector(`#${element.id} > #customDiv > #colorDiv >#secondarycolor`).getAttribute("customcolor")
                let cardTextBg = document.querySelector(`#${element.id} > #customDiv > #colorDiv >#textbgcolor`).getAttribute("customcolor")
                cardObj.overrides.primaryColor = cardPrimary
                cardObj.overrides.secondaryColor = cardSecondary
                cardObj.overrides.textBackgroundColor = cardTextBg
            }
        }
        returnObj.cards.push(cardObj);
    });
    jsonstring = JSON.stringify(returnObj, null, 2);
    //console.log(`rebuilt JSON as ${jsonstring}`);
    return jsonstring;
}
