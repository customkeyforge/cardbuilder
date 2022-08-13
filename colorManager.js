export const name = "colorManager";
import { drawCurrent } from "./cardDrawer.js";
import { getrgbString } from "./utils.js";
export class ColorManager {
    #parent = {};
    #textPrefix = "";
    #picker = {};
    constructor(queryselector, textPrefix, initialColor, onChange) {
        this.#parent = document.querySelector(queryselector);
        
        

        this.updateColorDiv = (color) => {
            var rgbaString = getrgbString(color);
            this.#parent.style.background = "#" + rgbaString;
            this.#parent.setAttribute("customcolor", rgbaString);
            this.#parent.textContent = `${this.#textPrefix}: ${rgbaString}`;
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
            if (onChange != null)
                onChange(newcolor);
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
            drawCurrent();
        };
        return this;
    }    
}