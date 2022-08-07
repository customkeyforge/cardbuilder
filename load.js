/** load.js */
var bigcanvas, smallcanvas, bigcontext, smallcontext;
var aemberImage = null;
var damageImage = null;
var pipSolidImage = null;
var pipAemberImage = null;
var globaliconname = null;
var primaryColorManager = {};
var secondaryColorManager = {};
var textBackgroundColorManager = {};
var presets = {};
var cardTypes = {};
var globalpreset = {};
var globalCustomIconImg = {};
var globalIconPreset = {};
var globalFontBaseSize = 28;
var prepareForPrint = false;
var cardTitleFont = "";
var cardTitleFontSize = 48;
var cardPowerFont = "";
var cardTypeFont = "";
var cardTraitFont = "";
var artCropRatio = 1.15;
var controlSplit = "\u0007";
var controlBold = "\u001E";
var controlItalic = "\u001D";
var controlAember = "\u001F";
var controlDamage = "\u001C";
import { downloadZip } from "https://cdn.jsdelivr.net/npm/client-zip/index.js"

class ColorManager {
    #parent = {};
    #textPrefix = "";
    #picker = {};
    constructor(queryselector, textPrefix, initialColor) {
        this.#parent = document.querySelector(queryselector);
        
        this.getrgbString = (color) => {
            return `${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`;
        };

        this.updateColorDiv = (color) => {
            var rgbaString =this.getrgbString(color);
            this.#parent.style.background = "#" + rgbaString;
            this.#parent.setAttribute("customcolor", rgbaString);
            this.#parent.textContent = `${this.#textPrefix}: ${color[0].toString(16)}${color[1].toString(16)}${color[2].toString(16)}`;
        };

        this.updatePickerSetting = (newcolor) => {
            var defaultColorString = `rgb(${newcolor[0]},${newcolor[1]},${newcolor[2]})`
            this.#picker.setOptions({alpha: false,
                cancelButton: true,
                color: defaultColorString
            })
        };

        this.setColor = (newcolor) => {
            this.updateColorDiv(newcolor);
            this.color = newcolor;
            this.updatePickerSetting(newcolor);
        }
    

        this.#textPrefix = textPrefix;
        this.#picker = new Picker(this.#parent);
        this.#picker.colorman = this;
        this.setColor(initialColor);
        /*
            You can do what you want with the chosen color using two callbacks: onChange and onDone.
        */
        this.#picker.onDone = (color) => {
            this.setColor(color.rgba);
            this.updateColorDiv(color.rgba);
            drawParentOf(this.#parent);
            //rebuildJSON();
            //applyJSON();
        };
        return this;
    }    
}
function parseColor(colorstring) {
    let newColor = [0, 0, 0];
    newColor[0] = parseInt(colorstring.substring(0,2), 16);
    newColor[1] = parseInt(colorstring.substring(2,4), 16);
    newColor[2] = parseInt(colorstring.substring(4,6), 16);
    return newColor;
}

function hookupLoadFromFile(fileButtonSelector, readAsText, fileLoadedCallback) {
    let filePicker = document.querySelector(fileButtonSelector);
    
    if (window.FileList && window.File && window.FileReader) {
        filePicker.addEventListener('change', event => {
          //status.textContent = '';
          const file = event.target.files[0];
          globalMessage(`Started reading file.`)
          
          const reader = new FileReader();
          reader.addEventListener('load', event => {
              globalMessage(`Finished reading file.`)

              fileLoadedCallback(event.target.result);
          });
          if (readAsText)
            reader.readAsText(file);
          else
            reader.readAsDataURL(file);
        }); 
      }
}


function hookupImageLoadFromFile(filePickerSelector, targetImageElement, iconnameSetCallback, imageLoadCallback) {
    
    targetImageElement.onload = () => {
        drawParentOf(targetImageElement);
        if (imageLoadCallback != null)
            imageLoadCallback();
      };
      hookupLoadFromFile(filePickerSelector, false, (result) => {
        targetImageElement.src = event.target.result;
        iconnameSetCallback(targetImageElement.src.substring(targetImageElement.src.length - 15));
        //rebuildJSON();
        drawParentOf(targetImageElement);
      });
}
class CardContainer {
    cardId = "";
    constructor(cardId, cardObj, images) {
        this.cardId = cardId;
        let cardlist = document.getElementById("cardlist");
        let createChild = (parent, elementType, id, className, appendnewline, labelText) => {
            if (labelText != null && labelText != "") {
                let labelspan = document.createElement("span");
                labelspan.textContent = labelText;
                labelspan.className = `label`;
                parent.appendChild(labelspan);
            }
            let newkid = document.createElement(elementType); 
            newkid.name = newkid.id = id; 
            newkid.className = className;
            parent.appendChild(newkid);
            if (appendnewline != null && appendnewline == true)
                this.newline(parent);
            return newkid;
        };
        let getDescriptionForAccordion = () => {
            return `${ctitle.value} (${typeSelector.value}), ${quantitySelector.value} copies`
        };
        let acc = createChild(cardlist, "button", "accButton", "accordion");
        acc.addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
                artcan.style.display="none";
            } else {
                panel.style.display = "block";
            }
        }); 
        cardlist.appendChild(acc);
        let cc = createChild(cardlist, "div", cardId, "cardcontainer");
        let typeSelector = createChild(cc, "select", `cardType`, "", false, "Card Type: ");
        cardTypes.forEach(type => {
            let t = createChild(typeSelector, "option", `${type.typeName}`, "", false); t.value = type.typeName; t.textContent = type.typeName;
        });
        typeSelector.value= cardObj.cardType ?? "Action";
        let ctitle = createChild(cc, "input", "cardTitle", "", false, "Title: ");
        ctitle.value = cardObj.title;
        let quantitySelector = createChild(cc, "select", `quantity`, "", true, "Quantity: ");
        {
            let zer = createChild(quantitySelector, "option", "0", "", false); zer.value = 0; zer.textContent = "0";
            let one = createChild(quantitySelector, "option", "1", "", false); one.value = 1; one.textContent = "1";
            let two = createChild(quantitySelector, "option", "2", "", false); two.value = 2; two.textContent = "2";
            let thr = createChild(quantitySelector, "option", "3", "", false); thr.value = 3; thr.textContent = "3";
            let fou = createChild(quantitySelector, "option", "4", "", false); fou.value = 4; fou.textContent = "4";
            let fiv = createChild(quantitySelector, "option", "5", "", false); fiv.value = 5; fiv.textContent = "5";
            let six = createChild(quantitySelector, "option", "6", "", false); six.value = 6; six.textContent = "6";
            let sev = createChild(quantitySelector, "option", "7", "", false); sev.value = 7; sev.textContent = "7";
            let eig = createChild(quantitySelector, "option", "8", "", false); eig.value = 8; eig.textContent = "8";
            let nin = createChild(quantitySelector, "option", "9", "", false); nin.value = 9; nin.textContent = "9";
        }
        quantitySelector.value = cardObj.quantity;
        let ctraits = createChild(cc, "input", "cardTraits", "", true, "Traits: ");
        ctraits.value = cardObj.traits ?? "";
        let cpower = createChild(cc, "input", "cardPower", "", true, "Power: ");
        cpower.value = cardObj.power ?? "";
        let carmor = createChild(cc, "input", "cardArmor", "", true, "Armor: ");
        carmor.value = cardObj.armor ?? "";
        let ctext = createChild(cc, "textarea", "cardText", "", true, "Card Text: ");
        ctext.value = cardObj.text;

        let aemberSelector = createChild(cc, "select", `aemberCount`, "", true, "Bonus Aember: ");
        {
            let zer = createChild(aemberSelector, "option", "0", "", false); zer.value = 0; zer.textContent = "0";
            let one = createChild(aemberSelector, "option", "1", "", false); one.value = 1; one.textContent = "1";
            let two = createChild(aemberSelector, "option", "2", "", false); two.value = 2; two.textContent = "2";
            let thr = createChild(aemberSelector, "option", "3", "", false); thr.value = 3; thr.textContent = "3";
        }
        aemberSelector.value = cardObj.aemberCount;
        let flavorText = createChild(cc, "textarea", "flavorText", "", true, "Flavor Text");
        flavorText.value = cardObj.flavorText ?? "";

        createChild(cc, "textarea", "cardNotes", "", true, "Notes: ").value = cardObj.notes ?? "";
        let customCheck = createChild(cc, "input", "customCheckbox", "", false);
        customCheck.type="checkbox";
        let customLabel = createChild(cc, "label", "", "", true);
        customLabel.setAttribute("for", "customCheckbox");
        customLabel.textContent = "Custom Look";

        let customDiv = createChild(cc, "div", "customDiv", "", false);
            
            let customPreset = createChild(customDiv, "select", `${cardId}cardPreset`, "presetSelector", false);
                let colorDiv = createChild(customDiv, "div", "colorDiv", "", false);

                let iconPreset = createChild(colorDiv, "select", `${cardId}iconPreset`, "presetSelector", false);
                let customIconDiv = createChild(colorDiv, "div", "customIconDiv", "", false);
                    
                    let customIconFilePicker = createChild(customIconDiv, "input", "customIconFilePicker", "presetSelector", false);
                    customIconFilePicker.type="file";
                    let customIconImg = createChild(customIconDiv, "img", "customIconImg", "", false);
                    customIconImg.width = 50;
                let prim = createChild(colorDiv, "span", "primarycolor", "", true);
                let sec = createChild(colorDiv, "span", "secondarycolor", "", true);
                let textbg = createChild(colorDiv, "span", "textbgcolor", "", true);
        let bigcan = createChild(cc, "canvas", "bigcanvas", "", false);
        bigcan.width=715; bigcan.height=1000; //bigcan.style.display="none";

        let smallcan = createChild(cc, "canvas", "smallcanvas", "", false);
        smallcan.width=357; smallcan.height=500; smallcan.style.display="none";//this.newline(cc);
        
        let artFilePicker = createChild(cc, "input", "artFilePicker", "", false);
        artFilePicker.type="file";
        let artcan = createChild(cc, "canvas", "artcanvas", "", true);
        artcan.width=357; artcan.height=500;  artcan.style.display="none"; 
        let artSourceImg = createChild(cc, "img", "artSourceImg", "", false);
        artSourceImg.style.display="none";
        let artImg = createChild(cc, "img", "artImg", "", false);
        artImg.style.display="none";
        
        ctitle.oninput = quantity.oninput = throttle(function (e) {
            acc.textContent = getDescriptionForAccordion();
            drawParentOf(ctitle);
        }, 1000);
        let showTraits = (typeName) => {
            let cardType = cardTypes.filter((t) => t.typeName == typeName)[0];
            if (cardType.hasTraits == false)
                ctraits.previousElementSibling.style.display = ctraits.style.display = "none";
            else {
                ctraits.previousElementSibling.style.display = "inline-block";
                ctraits.style.display = "inline";
            }
        }
        let showPower = (typeName) => {
            let cardType = cardTypes.filter((t) => t.typeName == typeName)[0];
            if (cardType.hasPower == false)
                cpower.previousElementSibling.style.display = carmor.previousElementSibling.style.display = cpower.style.display = carmor.style.display ="none";
            else {
                cpower.previousElementSibling.style.display = carmor.previousElementSibling.style.display = "inline-block"; 
                cpower.style.display = carmor.style.display = "inline";
            }
        }
        aemberSelector.onchange = typeSelector.onchange = () => {
            showTraits(typeSelector.value);
            showPower(typeSelector.value);
            acc.textContent = getDescriptionForAccordion();
            drawParentOf(ctext);
        };
        cardPower.oninput = cardArmor.oninput = flavorText.oninput = ctraits.oninput = ctext.oninput = throttle(() => {
            drawParentOf(ctext);
        }, 1000);
        customCheck.onchange = (e) => {
            if (customCheck.checked == true)
                customDiv.style.display = "inline";
            else
                customDiv.style.display = "none";
            draw(cardId);
        };
   
        artImg.onload = () => {
            draw(cardId);
        };
        cardlist.appendChild(cc);

        hookupImageLoadFromFile(`#${cardId} > #customDiv > #colorDiv > #customIconDiv > #customIconFilePicker`, customIconImg, (iconname) => {
            cc.setAttribute("customIcon", iconname);
        });

        hookupImageLoadFromFile(`#${cardId} > #artFilePicker`, artSourceImg, () => {}, () => {
            artcan.width = artSourceImg.naturalWidth;
            artcan.height = artSourceImg.naturalHeight;
            artcan.style.display="inline";
            cropper.start(artcan, artCropRatio); 
            cropper.registerCallback(throttle(() => {
                artImg.src = cropper.getCroppedImageSrc();
            }, 200));
            cropper.showImage(artSourceImg.src);
            cropper.startCropping();

        });
        let overrides = cardObj.overrides;
        //There are three possibilities for choosing the color scheme.
        //1. Override == null ? use global color settings
        //2. Override with preset ? use settings from preset.
        //3. Override with Custom ? use override colors from JSON.
        let primcolor = [130, 130, 130];
        let seccolor = [150, 150, 150];
        let textbgcolor = [200, 200, 200];

        if (overrides == null) {
            customCheck.checked = false;
            customDiv.style.display = "none";
            colorDiv.style.display = "none";
            primcolor = primaryColorManager.color;
            seccolor = secondaryColorManager.color;
            textbgcolor = textBackgroundColorManager.color;
        }
        else if (overrides.preset != null && overrides.preset == "Custom") {
            customCheck.checked = true;
            customDiv.style.display = "inline";
            colorDiv.style.display = "inline";
            primcolor = parseColor(overrides.primaryColor);
            seccolor = parseColor(overrides.secondaryColor);
            textbgcolor = parseColor(overrides.textBackgroundColor);
            if (overrides.customIconData != null)
            {
                customIconImg.src = images[overrides.customIconData];
                cc.setAttribute("customIcon", customIconImg.src.substring(customIconImg.src.length - 15));
            }
        }
        else if (overrides.preset != null && overrides.preset != "") {
            customCheck.checked = true;
            customDiv.style.display = "inline";
            colorDiv.style.display = "none";
            let selectedPreset = findPreset(overrides.preset);
            primcolor = parseColor(selectedPreset.primaryColor);
            seccolor = parseColor(selectedPreset.secondaryColor);
            textbgcolor = parseColor(selectedPreset.textBackgroundColor);
            cc.setAttribute("customIcon", selectedPreset.iconname);
        }

        let cardSecColorMan = new ColorManager(`#${cardId} > #customDiv > #colorDiv > #secondarycolor`, "Secondary Color", seccolor);
        let cardTextBgColorMan = new ColorManager(`#${cardId} > #customDiv > #colorDiv > #textbgcolor`, "Text Background Color", textbgcolor);
        let cardPrimColorMan = new ColorManager(`#${cardId} > #customDiv > #colorDiv > #primarycolor`, "Primary Color", primcolor);

        setPresetOptions(customPreset, "colorDiv", (presetObj) => {
            if (presetObj.primaryColor != null) {
                cardPrimColorMan.setColor(parseColor(presetObj.primaryColor));
                cardSecColorMan.setColor(parseColor(presetObj.secondaryColor));
                cardTextBgColorMan.setColor(parseColor(presetObj.textBackgroundColor));
            }
            cc.setAttribute("customIcon", presetObj.iconname);
        });
        setPresetOptions(iconPreset, "customIconDiv", (presetObj) => {
            if (iconPreset.value != "Custom")
                cc.setAttribute("customIcon", presetObj.iconname);
            else
                cc.setAttribute("customIcon", customIconImg.src.substring(customIconImg.src.length - 15));
            draw(cardId);
        });
        if (overrides != null && overrides.preset != null)
            customPreset.value = overrides.preset;
        customIconDiv.style.display = "none";
        if (overrides != null && overrides.preset == "Custom" && overrides.customIconPreset != null) {
            iconPreset.value = overrides.customIconPreset;
            if (overrides.customIconPreset == "Custom")
                customIconDiv.style.display = "inline";
        }
        if (cardObj.artImage != null)
            artImg.src = images[cardObj.artImage];
        showTraits(typeSelector.value);
        showPower(typeSelector.value);
        acc.textContent = getDescriptionForAccordion(); 
    }
    newline(cc) {
        cc.appendChild(document.createElement("br"));
    }
}

const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function() {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args)
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
            if ((Date.now() - lastRan) >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
         }, limit - (Date.now() - lastRan));
      }
    }
  }

function clearChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function findPreset(presetString) {
    return presets.filter((i) => i.name == presetString)[0];
}

function presetChanged(presetDropdown, hideId, setNewPresetFunc) {
        let colordiv = document.querySelector(`#${presetDropdown.id} + #${hideId}`);
        let presetObj = {
            name: presetDropdown.value 
        };
        if (presetDropdown.value == "Custom") {
            colordiv.style.display = "inline";
        } else {
            colordiv.style.display = "none";
            presetObj = findPreset(presetDropdown.value);
        }
        setNewPresetFunc(presetObj);
}
function setPresetOptions(preset, hideId, setNewPresetFunc) {
    clearChildren(preset);
    presets.forEach(p => {
        let opt = document.createElement("option");
        opt.value = p.name;
        opt.textContent= p.name;
        preset.appendChild(opt);
    });
    preset.onchange = function() {
        presetChanged(preset, hideId, setNewPresetFunc);
        drawParentOf(preset);
    }
}
function drawParentOf(element) {
    let parentTest = element;
    while (parentTest != null && parentTest.className != "cardcontainer") {
        parentTest = parentTest.parentElement;
    }
    if (parentTest == null)
        drawAll();
    else
        draw(parentTest.id);
}
function globalPresetChanged(presetObj)  {
    if (presetObj.primaryColor != null) {
        primaryColorManager.setColor(parseColor(presetObj.primaryColor));
        secondaryColorManager.setColor(parseColor(presetObj.secondaryColor));
        textBackgroundColorManager.setColor(parseColor(presetObj.textBackgroundColor));
    }
    if (presetObj.iconname != null) 
        globaliconname = presetObj.iconname;
}

function globalIconPresetChanged(presetObj)  {
    if (globalpreset.value == "Custom" && presetObj.name == "Custom") 
        globaliconname = globalCustomIconImg.src.substring(globalCustomIconImg.src.length - 15);
    else if (globalpreset.value == "Custom")
        globaliconname = presetObj.iconname;
}

async function setup() {
    secondaryColorManager = new ColorManager("#secondaryparent", "Secondary Color", [200, 120, 66]);
    textBackgroundColorManager = new ColorManager("#textBackgroundparent", "Text Background Color", [20, 33, 44]);
    primaryColorManager = new ColorManager("#parent", "Primary Color", [200, 33, 0]);

    var myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    var myInit = {
        method: 'GET',
        headers: myHeaders,
      };
      
    var myRequest = new Request('presets.json');
      
    const res = await fetch(myRequest, myInit);
    presets = await res.json();
    
    globalpreset = document.getElementById('globalpreset');
    setPresetOptions(globalpreset, "colorDiv", globalPresetChanged);
    globalPresetChanged(presets[0]);

    globaliconpreset = document.getElementById('globaliconpreset');
    globalCustomIconImg = document.getElementById('globalcustomiconimg');
    setPresetOptions(globaliconpreset, "globalcustomicondiv", globalIconPresetChanged);
    hookupImageLoadFromFile("#globalcustomiconpicker", globalCustomIconImg, (iconname) => {
        globaliconname = iconname;
    });
    
    let addCard = document.getElementById('addcard');
    addCard.onclick = () => {
        let cardCount = document.querySelectorAll(".cardcontainer").length;
        new CardContainer(`card${cardCount}`, { title: "Card Title", quantity: 1, text: "Card text goes here. You can use **bold** and *italic*, along with {aember} and {damage} symbols.", flavorText: "Flavor text can be added here.", notes: "Notes will be saved in the JSON file."}, []);
        draw(`card${cardCount}`);
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
    let cardHeight = 1000;
    let main = document.getElementById('global');

    let exportZip = document.getElementById('exportZip');
    exportZip.onclick = async () => {
        globalMessage("Exporting zip file for printing.");
        let jsonString = rebuildJSON();
        let hugeCanvas = document.createElement("canvas");
        hugeCanvas.width = cardWidth * 3;
        hugeCanvas.height = cardHeight * 3;
        let hugeContext = hugeCanvas.getContext('2d');
        let currentRow = 0;
        let currentCol = 0;
        let imagePages = [];
        let pageSaved = false;
        let cards = Array.from(document.querySelectorAll(".cardcontainer"));
        globalMessage("Started Creating card pages.");
        for (var index in cards) {
            let element = cards[index];
            let quantity = document.querySelector(`#${element.id} > #quantity`);
            let bigcan = document.querySelector(`#${element.id} > #bigcanvas`);
            for (var i = 0; i < quantity.value; i++) {
                if (currentCol == 0 && currentRow == 0) {
                    console.log("clearing canvas");
                    hugeContext.clearRect(0,0,cardWidth * 3, cardHeight * 3);
                }
                console.log(`drawing ${element.id} in position ${currentCol}, ${currentRow}`)
                pageSaved = false;
                hugeContext.drawImage(bigcan, cardWidth * currentCol, cardHeight * currentRow);
                if (currentCol == 2 && currentRow == 2){
                    currentCol = 0; currentRow = 0;
                    pageSaved = true;
                    console.log("saving page to zip");
                    let blob = await new Promise(resolve => hugeCanvas.toBlob(resolve));
                    imagePages.push({ name: `page${imagePages.length + 1}.png`, lastModified: new Date(), input: blob});
                }
                else if (currentCol == 2) {
                    currentCol = 0; currentRow++;
                }
                else {
                    currentCol++;
                }
            }
        }
        if (pageSaved == false) {
            console.log("saving final not-full page.");
            let blob = await new Promise(resolve => hugeCanvas.toBlob(resolve));
            imagePages.push({ name: `page${imagePages.length + 1}.png`, lastModified: new Date(), input: blob})
        }
        let deckname = document.getElementById('deckname').value ?? "adventure";
        imagePages.push({ name: `${deckname}.json`, lastModified: new Date(), input: jsonString})
        globalMessage("Finished Creating card pages.");
        let zipblob = await downloadZip(imagePages).blob();
        //main.appendChild(hugeCanvas);
        var a = document.createElement("a");
        a.href = URL.createObjectURL(zipblob);
        a.download = `${deckname}.zip`;
        globalMessage("Initiating zip download.");
        a.click();
        a.remove();
        hugeCanvas.remove();
    };

    aemberImage = document.getElementById('aember');
    damageImage = document.getElementById('damage');
    pipSolidImage = document.getElementById('1pip_solid');
    pipAemberImage = document.getElementById('1pip_aember');
    let deckname = document.getElementById('deckname');
    deckname.oninput = throttle(() => {
        drawAll();
    }, 1000);

    let textbadgecanvas = document.querySelector(`#textbadgecanvas`);
    let textbadgecontext = textbadgecanvas.getContext('2d');

    cardTitleFont = "RopaSansRegular";
    cardTitleFontSize = 48;
    cardTypeFont = "bold 22px RopaSansRegular";
    cardTraitFont = "26px RopaSansRegular";
    cardPowerFont = `bold 78px Bombardier`;
    textbadgecontext.font = `${globalFontBaseSize}px QuicksandMedium`;
    textbadgecontext.fillText('font initializing', 0, 0);
    textbadgecontext.font = `${globalFontBaseSize}px  bold RopaSansRegular`;
    textbadgecontext.fillText('font initializing', 0, 0);
    textbadgecontext.font = `bold ${cardTitleFontSize}px ${cardTitleFont}`;
    textbadgecontext.fillText('font initializing', 0, 0);
    textbadgecontext.font = cardTypeFont;
    textbadgecontext.fillText('font initializing', 0, 0);
    textbadgecontext.font = cardPowerFont;
    textbadgecontext.fillText('font initializing', 0, 0);


    textbadgecontext.clearRect(0,0,5000,5000);
    
    cardTypes = [new CardType("Action", 715), new CardType("Artifact", 715), new CardType("Creature", 715), new CardType("Upgrade", 715)];

    drawAll();

}
function ctxOp(callback) 
{
//    callback(smallcontext);
    //if (prepareForPrint)
        callback(bigcontext);
}
async function drawAll() {
    globalMessage("Started redrawing all cards.");
    await new Promise((resolve, reject) => {
        document.querySelectorAll(".cardcontainer").forEach(element => {
            draw(element.id); 
        });
        resolve();
    });
    globalMessage("Finished redrawing all cards.");
}
function globalMessage(newmessage) {
    let globalmsg = document.querySelector(`#globalmessage`);
    globalmsg.appendChild(document.createTextNode(`${new Date(Date.now()).toLocaleString()}: ${newmessage}`));
    globalmsg.appendChild(document.createElement("br"));
}

function applyJSON(j) {
    if (j == null)
        return;
    globalMessage(`Creating cards.`)
    const obj = JSON.parse(j);
    globalpreset.value = obj.global.preset
    let deckname = document.querySelector(`#deckname`);
    deckname.value = obj.global.deckname ?? "";
    if (obj.global.preset == "Custom") {
        globaliconpreset.value = obj.global.customIconPreset; 
        if (globaliconpreset.value == "Custom") {
            globalCustomIconImg.src = obj.images[obj.global.customIconData]; 
        }
        primaryColorManager.setColor(parseColor(obj.global.primaryColor));
        secondaryColorManager.setColor(parseColor(obj.global.secondaryColor));
        textBackgroundColorManager.setColor(parseColor(obj.global.textBackgroundColor));
    }
    else {
        globalpreset.value = obj.global.preset;
    }
    presetChanged(globalpreset, "colorDiv", globalPresetChanged);
    presetChanged(globaliconpreset, "globalcustomicondiv", globalIconPresetChanged);
    cardlist = document.getElementById("cardlist");
    clearChildren(cardlist);
    let uniqueCardCount = 0;
    let fullDeckCount = 0;
    obj.cards.forEach((card, index) => {
        uniqueCardCount++;
        if (card.quantity != null)
            fullDeckCount += parseInt(card.quantity);
        new CardContainer(`card${index}`, card, obj.images);
    });
    globalMessage(`Imported deck with ${uniqueCardCount} unique cards, with a deck count of ${fullDeckCount}.`)
    drawAll();
}

function draw(cardId) {
    let canvasWidth = 715;
    let canvasHeight = 1000;
    
    let deckname = document.getElementById('deckname');
    
    let cc = document.querySelector(`#${cardId}`);
    bigcanvas = document.querySelector(`#${cardId} > #bigcanvas`);
    if (bigcanvas == null)
    return;
    smallcanvas = document.querySelector(`#${cardId} > #smallcanvas`);
    
    textbadgecanvas = document.querySelector(`#textbadgecanvas`);
    pipcanvas = document.querySelector(`#pipcanvas`);
    let colorswapcanvas = document.querySelector(`#colorswapcanvas`);
    
    bigcanvas.width = 715;
    bigcanvas.height = 1000;
    smallcanvas.width =     356;
    smallcanvas.height =    500;
    
    
    let cardText = document.querySelector(`#${cardId} > #cardText`);
    let cardTraits = document.querySelector(`#${cardId} > #cardTraits`);
    let flavorText = document.querySelector(`#${cardId} > #flavorText`);
    let cardTitle = document.querySelector(`#${cardId} > #cardTitle`);
    let artImg = document.querySelector(`#${cardId} > #artImg`);
    let aemberCount = document.querySelector(`#${cardId} > #aemberCount`);
    let cardTypeSelector = document.querySelector(`#${cardId} > #cardType`);
    let cardPower = document.querySelector(`#${cardId} > #cardPower`);
    let cardArmor = document.querySelector(`#${cardId} > #cardArmor`);
    let customCheck = document.querySelector(`#${cardId} > #customCheckbox`);
    
    globalMessage(`Started drawing ${cardTitle.value}`);
    let primColor = primaryColorManager.color;
    let secColor = secondaryColorManager.color;
    let textBgColor = textBackgroundColorManager.color;

    if (customCheck.checked) {
        primColor = parseColor(document.querySelector(`#${cardId} > #customDiv > #colorDiv >#primarycolor`).getAttribute("customcolor"));
        secColor = parseColor(document.querySelector(`#${cardId} > #customDiv > #colorDiv >#secondarycolor`).getAttribute("customcolor"));
        textBgColor = parseColor(document.querySelector(`#${cardId} > #customDiv > #colorDiv >#textbgcolor`).getAttribute("customcolor"));
    }
    
    bigcontext = bigcanvas.getContext('2d');
    smallcontext = smallcanvas.getContext('2d');
    let textbadgecontext = textbadgecanvas.getContext('2d');
    let pipcontext = pipcanvas.getContext('2d');
    let colorswapcontext = colorswapcanvas.getContext('2d');
    
    smallcontext.scale(0.5,0.5);

    let cardType = cardTypes.filter((t) => t.typeName == cardTypeSelector.value)[0];

    let iconname = globaliconname;
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
        if (ctx == smallcanvas)
            ctx.scale(0.5,0.5);
        ctx.font = cardTypeFont;
        ctx.fillStyle = "#f3f3f3";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;
        ctx.shadowColor = "#222222";

        ctx.translate(cardType.typeStartCoords[0], cardType.typeStartCoords[1]);
        ctx.rotate(cardType.typeRotation * (Math.PI / 180));
        ctx.textAlign = "center";
        ctx.fillText(cardType.typeName.toUpperCase(), cardType.typeStartCoords[0], 0);
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

window.onresize = function () {
    document.querySelectorAll("canvas").forEach(canvas => {
        if (canvas.id == "bigcanvas") {
            bigcanvas.width = 715;
            bigcanvas.height = 1000;
        }
        if (canvas.id == "smallcanvas") {
            smallcanvas.width = 356;
            smallcanvas.height = 500;
        }
    });
    drawAll();
}


window.onload = async function () {
    await setup();
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
