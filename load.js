/** load.js */
var primaryColorManager = {};
var secondaryColorManager = {};
var textBackgroundColorManager = {};
var globalpreset = {};
var globalContext = {};
import { hookupImageLoadFromFile, hookupLoadFromFile, throttle, globalMessage, parseColor, clearChildren, getCrcHashForString } from "./utils.js"
import { CardContainer } from "./cardContainer.js"
import { ColorManager } from "./colorManager.js"
import { draw, warmUpFonts, drawCurrent } from "./cardDrawer.js"
import { GlobalContext } from "./globalContext.js";
import { setPresetOptions, presetChanged } from "./presetDropdown.js";
import { rebuildJSON } from "./jsonOps.js";
import { exportDeckForPrint } from "./exportDeck.js";

function globalPresetChanged(presetObj)  {
    globalContext.globalPreset = presetObj;
    if (presetObj.primaryColor != null) {
        primaryColorManager.setColor(parseColor(presetObj.primaryColor));
        secondaryColorManager.setColor(parseColor(presetObj.secondaryColor));
        textBackgroundColorManager.setColor(parseColor(presetObj.textBackgroundColor));
    }
    if (presetObj.iconhash != null)
        globalContext.globalIconHash = presetObj.iconhash;

}

function globalIconPresetChanged(presetObj)  {
    if (globalpreset.value == "Custom" && presetObj.name == "Custom") {
        let globalCustomIconImg = document.getElementById('globalcustomiconimg');
        globalContext.globalIconHash = getCrcHashForString(globalCustomIconImg.src);
    }
    else if (globalpreset.value == "Custom") {
        globalContext.globalIconHash = presetObj.iconhash;
    }
}

function hideEverything() {
    let children = document.getElementById("maincontent").children;
    for(var index in children) {
        let child = children[index];
        if (child.id != "cardlist" && child.style != null)
            child.style.display = "none";
    }
    children = document.getElementById("cardlist").children;
    for(var index in children) {
        let child = children[index];
        if (child.style != null)
            child.style.display = "none";
    }
}

function navigateTo(newLocation) {
    if(history.pushState) {
        history.pushState(null, null, `#${newLocation}`);
    }
    else {
        location.hash = `#${newLocation}`;
    }
    loadSub(newLocation);
}

function loadSub(newLocation){
    hideEverything();
    let target = document.getElementById(newLocation);
    if (target != null)
        target.style.display = "inline";
    else {
        newLocation = "global";
        target = document.getElementById(newLocation);
        if (target != null)
            target.style.display = "inline";    
    }
    drawCurrent();
}
function loadContent(){
    let loc = location.hash.substring(1);
    let targetLocation = "";
    if (loc.startsWith("card")) {
        targetLocation = loc;
    }
    else {
        if (loc == "globalimportexport")
            targetLocation = "importexport";
        if (loc == "globalwelcome")
            targetLocation = "welcome";
        if (loc == "globalsettings")
            targetLocation = "global";
        if (loc == "globalrules")
            targetLocation = "rules";
    }
    if (targetLocation == "") 
        targetLocation = "welcome";
    loadSub(targetLocation);
  }
  
  
async function setup() {

    globalContext = new GlobalContext();
    await globalContext.setup();
    if(!location.hash) {
        location.hash = "#globalwelcome";
    }
        
    loadContent();
    
    window.addEventListener("hashchange", loadContent)

    secondaryColorManager = new ColorManager("#secondaryparent", "Secondary Color", globalContext.secondaryColor, globalContext.setSecondaryColor);
    textBackgroundColorManager = new ColorManager("#textBackgroundparent", "Text Background Color", globalContext.textBackgroundColor, globalContext.setTextBackgroundColor);
    primaryColorManager = new ColorManager("#parent", "Primary Color", globalContext.primaryColor, globalContext.setPrimaryColor);

    
    globalpreset = document.getElementById('globalpreset');
    setPresetOptions(globalpreset, "#global #colorDiv", globalPresetChanged);
    globalPresetChanged(globalContext.presets[0]);

    let globaliconpreset = document.getElementById('globaliconpreset');
    let globalCustomIconImg = document.getElementById('globalcustomiconimg');
    setPresetOptions(globaliconpreset, "#global #globalcustomicondiv", globalIconPresetChanged);
    hookupImageLoadFromFile("#globalcustomiconpicker", globalCustomIconImg, (iconname, iconhash) => {
        globalContext.globalIconHash = iconhash;
    });
    let globalCardBackImg = document.getElementById('globalCardBackImg');
    hookupImageLoadFromFile("#cardBack", globalCardBackImg, () => {
    });
    let addCard = document.getElementById('addcard');
    addCard.onclick = () => {
        let cardCount = document.querySelectorAll(".cardcontainer").length;
        new CardContainer(`card${cardCount}`, { title: "Card Title", quantity: 1, text: "Card text goes here. You can use **bold** and *italic*, along with {aember} and {damage} symbols.", flavorText: "Flavor text can be added here.", notes: "Notes will be saved in the JSON file."}, [], globalContext);
        navigateTo(`card${cardCount}`);
    }
    hookupLoadFromFile("#importJSON", true, async (result) => {
        //let blob = await fetch(result).then(r => r.blob());
        applyJSON(result);
    });
    let exportJSONButton = document.getElementById('exportJSON');

    exportJSONButton.onclick = () => {
        let jsonString = rebuildJSON();
        var a = document.createElement("a");
        var file = new Blob([jsonString], {type: "text/plain"});
        a.href = URL.createObjectURL(file);
        let deckname = document.getElementById('deckname').value ?? "adventure";
        a.download = `${deckname}.json`;
        a.click();
    };

    
    
    exportZip.onclick = async () => {
       exportDeckForPrint();
    };

    let deckname = document.getElementById('deckname');
    deckname.oninput = throttle(() => {
        drawCurrent();
    }, 1000);

    let textbadgecanvas = document.querySelector(`#textbadgecanvas`);

    warmUpFonts(textbadgecanvas);

    
    for (var img of document.querySelectorAll("img")) {
        let hash = getCrcHashForString(img.src);
        img.setAttribute("imgsrchash", `${hash}`);
    }
    
    drawCurrent();
}
/*
async function drawAll() {
    globalMessage("Started redrawing all cards.");
    await new Promise((resolve, reject) => {
        document.querySelectorAll(".cardcontainer").forEach(element => {
            draw(element.id); 
        });
        resolve();
    });
    globalMessage("Finished redrawing all cards.");
}*/

function applyJSON(j) {
    if (j == null)
        return;
    globalMessage(`Creating cards.`)
    const obj = JSON.parse(j);
    globalpreset.value = obj.global.preset
    let deckname = document.querySelector(`#deckname`);
    deckname.value = obj.global.deckname ?? "";
    let readme = document.querySelector(`#readme`);
    readme.value = obj.global.readme ?? "";
    let globalCardBackImg = document.getElementById('globalCardBackImg');
    let globaliconpreset = document.getElementById('globaliconpreset');
    let globalCustomIconImg = document.getElementById('globalcustomiconimg');
    globalCardBackImg.src = obj.images[obj.global.cardBack];
    globalCardBackImg.setAttribute("imgsrchash", getCrcHashForString(globalCardBackImg.src));
    if (obj.global.preset == "Custom") {
        globaliconpreset.value = obj.global.customIconPreset; 
        if (globaliconpreset.value == "Custom") {
            globalCustomIconImg.src = obj.images[obj.global.customIconData]; 
            globalCustomIconImg.setAttribute("imgsrchash", getCrcHashForString(globalCustomIconImg.src));
        }
        primaryColorManager.setColor(parseColor(obj.global.primaryColor));
        secondaryColorManager.setColor(parseColor(obj.global.secondaryColor));
        textBackgroundColorManager.setColor(parseColor(obj.global.textBackgroundColor));
    }
    else {
        globalpreset.value = obj.global.preset;
    }
    presetChanged(globalpreset, "#global #colorDiv", globalPresetChanged);
    presetChanged(globaliconpreset, "#global #globalcustomicondiv", globalIconPresetChanged);
    let cardlist = document.getElementById("cardlist");
    clearChildren(cardlist);
    document.querySelectorAll("#menu > .cardSelector").forEach(element => {
        element.remove();
    })
    let uniqueCardCount = 0;
    let fullDeckCount = 0;
    obj.cards.forEach((card, index) => {
        uniqueCardCount++;
        if (card.quantity != null)
            fullDeckCount += parseInt(card.quantity);
        new CardContainer(`card${index}`, card, obj.images, globalContext);
    });
    globalMessage(`Imported deck with ${uniqueCardCount} unique cards, with a deck count of ${fullDeckCount}.`)
    drawCurrent();
}


window.onresize = function () {
    document.querySelectorAll("canvas").forEach(canvas => {
        if (canvas.id == "bigcanvas") {
            bigcanvas.width = 715;
            bigcanvas.height = 1000;
        }
    });
    drawCurrent();
}


window.onload = async function () {
    await setup();
}
