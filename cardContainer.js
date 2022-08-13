export const name = "cardContainer";
import { hookupImageLoadFromFile, hookupLoadFromFile, throttle, parseColor } from "./utils.js";
import { ColorManager } from "./colorManager.js";
import { drawAsync, draw, artCropRatio } from "./cardDrawer.js";
import { setPresetOptions } from "./presetDropdown.js";

export class CardContainer {
    cardId = "";
    constructor(cardId, cardObj, images, globalContext) {
        this.cardId = cardId;
        let cardlist = document.getElementById("cardlist");
        let createChild = (parent, elementType, id, className, appendnewline, labelText, forceDiv) => {
            let useDiv = forceDiv != null && forceDiv == true;
            let useLabel = labelText != null && labelText != "";
            if (useLabel)
                useDiv = true;  

            if (useDiv) {
                let fulldiv = document.createElement("div");
                fulldiv.className = `${id}div`
                parent.appendChild(fulldiv);
                parent = fulldiv;
            }
            if (useLabel) {
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
        let createAccordion = (title, parent, populateFunction) => {
            let acc = createChild(parent, "button", "accButton", "accordion");
            acc.value = acc.textContent = title;
            let section = createChild(parent, "div", "", "cardsection");
            acc.addEventListener("click", function() {
                this.classList.toggle("active");
                if (section.style.display === "block") {
                    section.style.display = "none";
                } else {
                    section.style.display = "block";
                }
            }); 
            populateFunction(section);
        }
        let getDescriptionForMenu = () => {
            return `${ctitle.value} (${typeSelector.value}), ${quantitySelector.value} cop${(parseInt(quantitySelector.value) ?? 0) > 1 ? "ies" : "y"}`
        };
        let menu = document.getElementById("menu");
        let acc = createChild(menu, "li", "", "cardSelector");
        let sublink = createChild(acc, "a", "", "");
        sublink.href = `#${cardId}`;

        let toplevel = createChild(cardlist, "div", cardId, "cardcontainer");
        toplevel.style.display = "none";
        let cc = createChild(toplevel, "div", "", "wrapper");

        let typeSelector = {};
        let quantitySelector = {};
        let ctitle = {};
        let ctext = {};
        let ctraits = {};
        let cpower = {};
        let carmor = {};
        let aemberSelector = {};
        let flavorText = {};

        let customCheck = {};
        let customPreset = {};
        let iconPreset = {};
        let customIconFilePicker = {};
        let customIconImg = {};
        let customCardBackFilePicker = {};
        let customCardBackImg = {};
        let artFilePicker = {};
        let artcan = {};
        let artSourceImg = {};
        let artImg = {};
        let customDiv = {};
        let colorDiv = {};
        let customIconDiv = {};
        let customTypeName = {};
        let sideBar = createChild(cc, "div", "sidebar", "sidebar");

        createAccordion("Card Details", sideBar, (section) => {
            typeSelector = createChild(section, "select", `cardType`, "", false, "Card Type: ");
            globalContext.cardTypes.forEach(type => {
                let t = createChild(typeSelector, "option", `${type.typeName}`, "", false); t.value = type.typeName; t.textContent = type.typeName;
            });
            typeSelector.value= cardObj.cardType ?? "Action";
            ctitle = createChild(section, "input", "cardTitle", "", false, "Title: ");
            ctitle.value = cardObj.title;
            quantitySelector = createChild(section, "select", `quantity`, "", false, "Quantity: ");
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
            ctraits = createChild(section, "input", "cardTraits", "", false, "Traits: ");
            ctraits.value = cardObj.traits ?? "";
            cpower = createChild(section, "input", "cardPower", "", false, "Power: ");
            cpower.value = cardObj.power ?? "";
            carmor = createChild(section, "input", "cardArmor", "", true, "Armor: ");
            carmor.value = cardObj.armor ?? "";

            ctext = createChild(section, "textarea", "cardText", "", true, "Card Text: ");
            ctext.value = cardObj.text;

        });

        createAccordion("Extras", sideBar, (section) => {
            aemberSelector = createChild(section, "select", `aemberCount`, "", false, "Bonus Aember: ");
            {
                let zer = createChild(aemberSelector, "option", "0", "", false); zer.value = 0; zer.textContent = "0";
                let one = createChild(aemberSelector, "option", "1", "", false); one.value = 1; one.textContent = "1";
                let two = createChild(aemberSelector, "option", "2", "", false); two.value = 2; two.textContent = "2";
                let thr = createChild(aemberSelector, "option", "3", "", false); thr.value = 3; thr.textContent = "3";
            }
            aemberSelector.value = cardObj.aemberCount;
            

            flavorText = createChild(section, "textarea", "flavorText", "", false, "Flavor Text: ");
            flavorText.value = cardObj.flavorText ?? "";
        });
        createAccordion("Customize Look", sideBar, (section) => {
            let customizationDiv = createChild(section, "div", "customizationdiv", "customizationdiv", false);
            customCheck = createChild(customizationDiv, "input", "customCheckbox", "", false);
            customCheck.type="checkbox";
            let customLabel = createChild(customizationDiv, "label", "", "", true);
            customLabel.setAttribute("for", "customCheckbox");
            customLabel.textContent = "Custom Look";

            customDiv = createChild(customizationDiv, "div", "customDiv", "", true);
                customTypeName = createChild(customDiv, "input", "customTypeName", "", true, "Custom Type Name: ");
                customCardBackFilePicker = createChild(customDiv, "input", "customCardBackFilePicker", "", false);
                customCardBackFilePicker.type="file";
                customCardBackImg = createChild(customDiv, "img", "customCardBackImg", "", true);
                customCardBackImg.height = 100;

                customPreset = createChild(customDiv, "select", `${cardId}cardPreset`, "presetSelector", false, "House: ");
                    colorDiv = createChild(customDiv, "div", "colorDiv", "", false);

                    iconPreset = createChild(colorDiv, "select", `${cardId}iconPreset`, "presetSelector", false, "Custom Icon: ");
                    customIconDiv = createChild(colorDiv, "div", "customIconDiv", "", false);
                        
                        customIconFilePicker = createChild(customIconDiv, "input", "customIconFilePicker", "presetSelector", false);
                        customIconFilePicker.type="file";
                        customIconImg = createChild(customIconDiv, "img", "customIconImg", "", false);
                        customIconImg.width = 50;
                    createChild(colorDiv, "span", "primarycolor", "", true);
                    createChild(colorDiv, "span", "secondarycolor", "", true);
                    createChild(colorDiv, "span", "textbgcolor", "", true);
        });
        createAccordion("Art", sideBar, (section) => {
            let cardArtDiv = createChild(section, "div", "cardArtDiv", "cardArtDiv", false,);

            artFilePicker = createChild(cardArtDiv, "input", "artFilePicker", "", false, "Choose Card Art");
            artFilePicker.type="file";
            artcan = createChild(cardArtDiv, "canvas", "artcanvas", "", true);
            artcan.width=357; artcan.height=500;  artcan.style.display="none"; 
            artcan.style.width="357px"; artcan.style.height="500px";
            artSourceImg = createChild(cardArtDiv, "img", "artSourceImg", "", false);
            artSourceImg.style.display="none";
            artImg = createChild(cardArtDiv, "img", "artImg", "", true);
            artImg.style.display="none";
        });

        createAccordion("Notes", sideBar, (section) => {
            createChild(section, "textarea", "cardNotes", "", true, "Notes: ").value = cardObj.notes ?? "";
        });   

        let deleteButton = createChild(cc, "input", "deleteCard", "", true, "", true);
        deleteButton.type = "button";
        deleteButton.value = "Delete Card";
        deleteButton.onclick = () => {
            if (confirm(`Are you sure you want to delete "${ctitle.value}"?`)) {
                toplevel.remove();
                acc.remove();
            }
        };

        let bigcan = createChild(cc, "canvas", "bigcanvas", "", false, "", true);
        bigcan.width=715; bigcan.height=1000; //bigcan.style.display="none";

        let displayHeight = 700;
        bigcan.style.width=`${bigcan.width * (displayHeight / 1000)}px`; bigcan.style.height=`${displayHeight}px`;
           
        ctitle.oninput = quantity.oninput = throttle(function (e) {
            sublink.textContent = getDescriptionForMenu();
            drawAsync(cardId);
        }, 1000);
        let showTraits = (typeName) => {
            let cardType = globalContext.cardTypes.filter((t) => t.typeName == typeName)[0];
            if (cardType.hasTraits == false)
                ctraits.previousElementSibling.style.display = ctraits.style.display = "none";
            else {
                ctraits.previousElementSibling.style.display = "inline-block";
                ctraits.style.display = "inline";
            }
        }
        let showPower = (typeName) => {
            let cardType = globalContext.cardTypes.filter((t) => t.typeName == typeName)[0];
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
            sublink.textContent = getDescriptionForMenu();
            drawAsync(cardId);
        };
        customTypeName.oninput = cardPower.oninput = cardArmor.oninput = flavorText.oninput = ctraits.oninput = ctext.oninput = throttle(() => {
            drawAsync(cardId);
        }, 1000);
        customCheck.onchange = (e) => {
            if (customCheck.checked == true)
                customDiv.style.display = "inline";
            else
                customDiv.style.display = "none";
            drawAsync(cardId);
        };
   
        artImg.onload = () => {
            if (toplevel.style.display != "none")
                drawAsync(cardId);
        };

        hookupImageLoadFromFile(`#${cardId} #customIconFilePicker`, customIconImg, (iconname) => {
            toplevel.setAttribute("customIcon", iconname);
        });
        
        hookupImageLoadFromFile(`#${cardId} #customCardBackFilePicker`, customCardBackImg, () => {
        });

        hookupImageLoadFromFile(`#${cardId} #artFilePicker`, artSourceImg, () => {}, () => {
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
            primcolor = globalContext.primaryColor;
            seccolor = globalContext.secondaryColor;
            textbgcolor = globalContext.textBackgroundColor;
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
                toplevel.setAttribute("customIcon", customIconImg.src.substring(customIconImg.src.length - 15));
            }
        }
        else if (overrides.preset != null && overrides.preset != "") {
            customCheck.checked = true;
            customDiv.style.display = "inline";
            colorDiv.style.display = "none";
            let selectedPreset = globalContext.findPreset(overrides.preset);
            primcolor = parseColor(selectedPreset.primaryColor);
            seccolor = parseColor(selectedPreset.secondaryColor);
            textbgcolor = parseColor(selectedPreset.textBackgroundColor);
            toplevel.setAttribute("customIcon", selectedPreset.iconname);
        }
        if (overrides != null && overrides.customCardBack != null && overrides.customCardBack != "")
            customCardBackImg.src = images[overrides.customCardBack];

        let cardSecColorMan = new ColorManager(`#${cardId} #secondarycolor`, "Secondary Color", seccolor);
        let cardTextBgColorMan = new ColorManager(`#${cardId} #textbgcolor`, "Text Background Color", textbgcolor);
        let cardPrimColorMan = new ColorManager(`#${cardId} #primarycolor`, "Primary Color", primcolor);

        setPresetOptions(customPreset, `#${cardId} #colorDiv`, (presetObj) => {
            if (presetObj.primaryColor != null) {
                cardPrimColorMan.setColor(parseColor(presetObj.primaryColor));
                cardSecColorMan.setColor(parseColor(presetObj.secondaryColor));
                cardTextBgColorMan.setColor(parseColor(presetObj.textBackgroundColor));
            }
            toplevel.setAttribute("customIcon", presetObj.iconname);
        });
        setPresetOptions(iconPreset, `#${cardId} #customIconDiv`, (presetObj) => {
            if (iconPreset.value != "Custom")
                toplevel.setAttribute("customIcon", presetObj.iconname);
            else
                toplevel.setAttribute("customIcon", customIconImg.src.substring(customIconImg.src.length - 15));
            drawAsync(cardId);
        });
        if (overrides != null)
            customTypeName.value = overrides.customTypeName ?? "";

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
        sublink.textContent = getDescriptionForMenu(); 
    }
    newline(cc) {
        cc.appendChild(document.createElement("br"));
    }
}