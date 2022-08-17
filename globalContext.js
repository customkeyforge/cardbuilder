export const name = "globalContext";
import { serializeCardFromDom } from "./cardContainer.js";
import { CardType } from "./cardTypes.js"
import { findImageInDomByName, getCrcHashForObject, getCrcHashForString } from "./utils.js";
export class GlobalContext {
    cardTypes = [];
    presets = [];
    setup = () => {};
    primaryColor = [200, 33, 0];
    secondaryColor = [200, 120, 66];
    textBackgroundColor = [20, 33, 44];
    globalIconHash = "";
    globalPreset = {};
    changeTracker = {};
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
            for (var p of this.presets) {
                if (p.iconname != null) {
                    let iconImg = findImageInDomByName(p.iconname);
                    if (iconImg != null)
                        p.iconhash = getCrcHashForString(iconImg.src);
                }
            }
            this.globalPreset = this.presets[0];
            
            this.cardTypes = [new CardType("Action", 715), new CardType("Artifact", 715), new CardType("Creature", 715), new CardType("Upgrade", 715)];
        }

        this.getHashForCard = (cardContainerId) => {
            let cardObj = serializeCardFromDom(cardContainerId);
            let cardHash = getCrcHashForObject(cardObj);
            return cardHash;
        };
        this.getLastChangeTime = (cardContainerElement) => {
            let guid = cardContainerElement.getAttribute("cardId");
            let hash = this.getHashForCard(cardContainerElement.id);
            if (this.changeTracker[guid] == null 
                || (this.changeTracker[guid] != null
                    && hash != this.changeTracker[guid].hash)) {
                //Update the change tracker.
                this.changeTracker[guid] = {
                    changeTime: new Date().toUTCString(),
                    hash: hash
                }
            }
            return this.changeTracker[guid].changeTime;
        }
        
        this.findPreset = (presetString) => {
            //clone the object, since we want to make sure no one else is modifying the presets.
            return JSON.parse(JSON.stringify(this.presets.filter((i) => i.name == presetString)[0]));
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