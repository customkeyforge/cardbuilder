export const name = "presetDropDown";
import { drawCurrent } from "./cardDrawer.js";
import { GlobalContext } from "./globalContext.js";
import { clearChildren } from "./utils.js";

export function setPresetOptions(presetObj, hideSelector, setNewPresetFunc) {
    clearChildren(presetObj);
    let globalContext = new GlobalContext();
    globalContext.presets.forEach(p => {
        let opt = document.createElement("option");
        opt.value = p.name;
        opt.textContent= p.name;
        presetObj.appendChild(opt);
    });
    presetObj.onchange = function() {
        presetChanged(presetObj, hideSelector, setNewPresetFunc);
        drawCurrent();
    }
}


export function presetChanged(presetDropdown, hideSelector, setNewPresetFunc) {
    let colordiv = document.querySelector(`${hideSelector}`);
    let presetObj = {
        name: presetDropdown.value 
    };
    if (presetDropdown.value == "Custom") {
        colordiv.style.display = "inline";
    } else {
        colordiv.style.display = "none";
        let globalContext = new GlobalContext();
        presetObj = globalContext.findPreset(presetDropdown.value);
    }
    setNewPresetFunc(presetObj);
}