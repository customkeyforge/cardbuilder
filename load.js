/** load.js */
var primaryColorManager = {};
var secondaryColorManager = {};
var textBackgroundColorManager = {};
var globalpreset = {};
var globalContext = {};
import { downloadZip } from "https://cdn.jsdelivr.net/npm/client-zip/index.js";
import { cardElement, hookupImageLoadFromFile, hookupLoadFromFile, throttle, globalMessage, parseColor, clearChildren, getCrcHashForString } from "./utils.js"
import { CardContainer } from "./cardContainer.js"
import { ColorManager } from "./colorManager.js"
import { draw, warmUpFonts, drawCurrent } from "./cardDrawer.js"
import { GlobalContext } from "./globalContext.js";
import { setPresetOptions, presetChanged } from "./presetDropdown.js";
import { rebuildJSON } from "./jsonOps.js";
const { jsPDF } = window.jspdf;

function globalPresetChanged(presetObj)  {
    globalContext.globalPreset = presetObj;
    if (presetObj.primaryColor != null) {
        primaryColorManager.setColor(parseColor(presetObj.primaryColor));
        secondaryColorManager.setColor(parseColor(presetObj.secondaryColor));
        textBackgroundColorManager.setColor(parseColor(presetObj.textBackgroundColor));
    }
    if (presetObj.iconname != null) 
        globalContext.globalIconName = presetObj.iconname;
    if (presetObj.iconhash != null)
        globalContext.globalIconHash = presetObj.iconhash;

}

function globalIconPresetChanged(presetObj)  {
    if (globalpreset.value == "Custom" && presetObj.name == "Custom") {
        let globalCustomIconImg = document.getElementById('globalcustomiconimg');
        globalContext.globalIconHash = getCrcHashForString(globalCustomIconImg.src);
    }
    else if (globalpreset.value == "Custom") {
        globalContext.globalIconName = presetObj.iconname;
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
        if (loc == "globalsettings")
            targetLocation = "global";
    }
    if (targetLocation == "") 
        targetLocation = "global";
    loadSub(targetLocation);
  }
  
  
async function setup() {

    globalContext = new GlobalContext();
    await globalContext.setup();
    if(!location.hash) {
        location.hash = "#globalsettings";
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
        globalContext.globalIconName = iconname;
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

    let cardWidth = 715;
    let cardPrintWidth  = cardWidth;
    let cardHeight = 1000;
    let cardPrintHeight  = cardHeight;
    let main = document.getElementById('global');

    let exportStyle = document.getElementById('exportStyle');
    let exportZip = document.getElementById('exportZip');
    let defaultCardBack = document.getElementById('globalCardBackImg');
    let exportCardBacks = document.getElementById('exportCardBacks');
    let exportMessage = document.getElementById('exportMessage');
    var progBase = document.getElementById("myProgress");
    var progBar = document.getElementById("myBar");
    let exportProgress = (percent, message) => {
        console.log(message);
        exportMessage.textContent = message;
        progBar.style.width = percent + "%";
    };
    exportZip.onclick = async () => {
        progBase.style.display = "block";
        progBar.style.display = "block";
        exportProgress(0, "Rebuilding JSON.");
        let jsonString = rebuildJSON();
        let rowCount = 3;
        let colCount = 3;
        if (exportStyle.value == "2x2png" || exportStyle.value == "2x2pdf") {
            rowCount = 2;
            colCount = 2;
        } else if (exportStyle.value == "1x1png" || exportStyle.value == "1x1pdf") {
            rowCount = 1;
            colCount = 1;
        }
        let contextWidth = colCount * cardWidth;
        let contextHeight = rowCount * cardHeight;
        let doc = {};
        let pdftop = 0;
        let pdfleft = 0;
        let pdfExport = exportStyle.value.endsWith("pdf"); 
        if (pdfExport) {
            cardPrintWidth = 63.5;
            cardPrintHeight = 88;
            //            doc = new jsPDF({unit: "mm", format: `[${colCount * cardPrintWidth},${rowCount * cardPrintHeight}]`});
            doc = new jsPDF({unit: "mm", format: "letter"});
            pdfleft = (doc.internal.pageSize.getWidth() / 2) - ((cardPrintWidth * colCount) / 2);
            pdftop = (doc.internal.pageSize.getHeight() / 2) - ((cardPrintHeight * rowCount) / 2);
        }
        let hugeCanvas = document.createElement("canvas");
        hugeCanvas.width = contextWidth;
        hugeCanvas.height = contextHeight;
        let hugeContext = hugeCanvas.getContext('2d');
        let backCanvas = document.createElement("canvas");
        backCanvas.width = contextWidth;
        backCanvas.height = contextHeight;
        let backContext = backCanvas.getContext('2d');
        let currentRow = 0;
        let currentCol = 0;
        let imagePages = [];
        let pageSaved = false;
        let cards = Array.from(document.querySelectorAll(".cardcontainer"));
        let fileName = "";
        let backFileName = "";
        let pageNumber = 1;
        let isFirstPage = true;
        function cacheCanvas(canvas) {
            let pageCanvas = document.createElement("canvas");
            pageCanvas.width = contextWidth;
            pageCanvas.height = contextHeight;
            pageCanvas.className = "canvascache";
            let pageContext = pageCanvas.getContext('2d');
            pageContext.drawImage(canvas, 0,0, contextWidth, contextHeight);
            return pageCanvas;
        }
        let progPerCard = 60 / cards.length;
        exportProgress(10, "Creating Cards");
        for (var index in cards) {
            let element = cards[index];
            let ctitle = cardElement(element.id, 'cardTitle');
            exportProgress(progPerCard * index, `Redrawing ${ctitle.value}`);
            draw(element.id);
            let quantity = cardElement(element.id, 'quantity');
            let customCardBack = cardElement(element.id, 'customCardBackImg');
            let bigcan = cardElement(element.id, 'bigcanvas');
            for (var i = 0; i < quantity.value; i++) {
                console.log(`Redrawing ${ctitle.value}`);

                if (currentCol == 0 && currentRow == 0) {
                    hugeContext.fillStyle = "white";
                    hugeContext.fillRect(0, 0, contextWidth, contextHeight);
                    backContext.fillStyle = "white";
                    backContext.fillRect(0, 0, contextWidth, contextHeight);
                }
                pageSaved = false;
                fileName = `page${pageNumber}.png`;
                backFileName = `page${pageNumber}(Back).png`;
                if (rowCount == 1 && colCount == 1) {
                    fileName = `${ctitle.value} Copy ${i + 1}.png`
                    backFileName = `${ctitle.value} Copy ${i + 1}(Back).png`
                }
                hugeContext.drawImage(bigcan, cardWidth * currentCol, cardHeight * currentRow);
                if (exportCardBacks.checked) {
                    let backImg = defaultCardBack;
                    if (customCardBack.src != null && customCardBack.src.startsWith("data:image"))
                        backImg = customCardBack;
                    backContext.drawImage(backImg, cardWidth * (colCount - currentCol - 1) , cardHeight * currentRow);
               }
                if (currentCol == (colCount - 1) && currentRow == (rowCount - 1)){
                    currentCol = 0; currentRow = 0;
                    pageSaved = true;
                    if (pdfExport) {
                        let cache = cacheCanvas(hugeCanvas);
                        if (isFirstPage == false) 
                            doc.addPage();
                        doc.addImage(cache, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");

                        if (exportCardBacks.checked) {
                            doc.addPage();
                            let cache = cacheCanvas(backCanvas);
                            doc.addImage(cache, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
                        }
                        isFirstPage = false;
                    }
                    else {
                        console.log("saving page to zip");
                        let blob = await new Promise(resolve => hugeCanvas.toBlob(resolve));
                        imagePages.push({ name: fileName, lastModified: new Date(), input: blob});
                        if (exportCardBacks.checked) {
                            let backblob = await new Promise(resolve => backCanvas.toBlob(resolve));
                            imagePages.push({ name: backFileName, lastModified: new Date(), input: backblob});
                        }
                    }
                    pageNumber++;
                }
                else if (currentCol == (colCount - 1)) {
                    currentCol = 0; currentRow++;
                }
                else {
                    currentCol++;
                }
            }
        }
        if (pageSaved == false) {
            console.log("saving final not-full page.");
            if (pdfExport) {
                if (isFirstPage == false)
                    doc.addPage();
                let cache = cacheCanvas(hugeCanvas);
                doc.addImage(cache, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
                if (exportCardBacks.checked) {
                    doc.addPage(); 
                    let cache = cacheCanvas(backCanvas);
                    doc.addImage(cache, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
                }
                doc.addPage();
            }
            else {
                let blob = await new Promise(resolve => hugeCanvas.toBlob(resolve));
                imagePages.push({ name: fileName, lastModified: new Date(), input: blob});
                if (exportCardBacks.checked) {
                    let backblob = await new Promise(resolve => backCanvas.toBlob(resolve));
                    imagePages.push({ name: backFileName, lastModified: new Date(), input: backblob});
                }
            }
        }
        exportProgress(70, "Finished Creating card pages.");

        let deckname = document.getElementById('deckname').value;
        if (deckname == null || deckname == "")
            deckname = "adventure";
        if (pdfExport) {
            exportProgress(70, "Generating PDF.");
            imagePages.push({ name: `${deckname}.pdf`, lastModified: new Date(), input: doc.output('blob')});
        }

        imagePages.push({ name: `${deckname}.json`, lastModified: new Date(), input: jsonString})
        exportProgress(80, "Building zip archive.");
        let zipblob = await downloadZip(imagePages).blob();
        //main.appendChild(hugeCanvas);
        var a = document.createElement("a");
        a.href = URL.createObjectURL(zipblob);
        a.download = `${deckname}.zip`;
        exportProgress(95, "Initiating zip download.");
        a.click();
        a.remove();
        document.querySelectorAll(".cachecanvas").forEach(cc => {
            cc.remove();
        });
        hugeCanvas.remove();
        backCanvas.remove();
        exportProgress(100, "Export complete");

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
    cardlist = document.getElementById("cardlist");
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
