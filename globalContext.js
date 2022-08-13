export const name = "globalContext";
import { CardType } from "./cardTypes.js"
export class GlobalContext {
    cardTypes = [];
    presets = [];
    setup = () => {};
    primaryColor = [200, 33, 0];
    secondaryColor = [200, 120, 66];
    textBackgroundColor = [20, 33, 44];
    globalIconName = "";
    globalPreset = {};
    static instance;
    constructor() {
        if (GlobalContext.instance) {
        return GlobalContext.instance;
        }
        GlobalContext.instance = this;
           
        this.setup = async () => {
            var myHeaders = new Headers();
            myHeaders.append('pragma', 'no-cache');
            myHeaders.append('cache-control', 'no-cache');
            var myInit = {
                method: 'GET',
                headers: myHeaders,
            };
            
            var myRequest = new Request('presets.json');
            
            const res = await fetch(myRequest, myInit);
            this.presets = await res.json();
            this.globalPreset = this.presets[0];
            
            this.cardTypes = [new CardType("Action", 715), new CardType("Artifact", 715), new CardType("Creature", 715), new CardType("Upgrade", 715)];
        }
        
        this.findPreset = (presetString) => {
            return this.presets.filter((i) => i.name == presetString)[0];
        }
        this.setPrimaryColor = (newColor) => {
            this.primaryColor = newColor;
        }
        this.setSecondaryColor = (newColor) => {
            this.secondaryColor = newColor;
        }
        this.setTextBackgroundColor = (newColor) => {
            this.textBackgroundColor = newColor;
        }
        this.setCurrentPreset = (newPreset) => {
            this.globalPreset = newPreset;
        }
    }
}