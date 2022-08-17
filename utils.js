import { drawCurrent } from "./cardDrawer.js"

export const name = "utils";

export function cardElement(cardId, selector) {
    let res = document.querySelector(`#${cardId} #${selector}`);
    if (res == null)
        res = document.querySelector(`#${cardId} #${selector}`);
    return res;
}


export function hookupLoadFromFile(fileButtonSelector, readAsText, fileLoadedCallback) {
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



export function hookupImageLoadFromFile(filePickerSelector, targetImageElement, iconnameSetCallback, imageLoadCallback) {
    
    targetImageElement.onload = () => {
        drawCurrent();
        if (imageLoadCallback != null)
            imageLoadCallback();
      };
      hookupLoadFromFile(filePickerSelector, false, (result) => {
        targetImageElement.src = event.target.result;
        let srcHash = getCrcHashForString(targetImageElement.src);
        targetImageElement.setAttribute("imgsrchash", srcHash);
        iconnameSetCallback(targetImageElement.src.substring(targetImageElement.src.length - 15),srcHash );
        drawCurrent();
      });
}


export function throttle(func, limit)  {
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

export function parseColor(colorstring) {
    let newColor = [0, 0, 0];
    newColor[0] = parseInt(colorstring.substring(0,2), 16);
    newColor[1] = parseInt(colorstring.substring(2,4), 16);
    newColor[2] = parseInt(colorstring.substring(4,6), 16);
    return newColor;
}

export function isImageData(imgsrc) {
    return imgsrc != null && imgsrc.startsWith("data:image");
}

export function findImageInDomByName(imageName) {
    let allImages = Array.from(document.querySelectorAll("img"));
    return allImages.filter((img) => img.src.endsWith(imageName))[0];
}

export function findImageInDomByHash(imageHash) {
    let allImages = Array.from(document.querySelectorAll("img"));
    return allImages.filter((img) => img.getAttribute("imgsrchash") == `${imageHash}`)[0];
}

export function addImage(imagehash, image) {
    let hash = `${getCrcHashForString(image)}`;
    if (imagehash != null && imagehash[hash] == null)
        imagehash[hash] = image;
    return hash;
};

export function getrgbString(color) {
    return `${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`;
};

export function getCrcHashForString(instr) {
    return CRC32.str(instr);
};
export function getCrcHashForObject(inobj) {
    return CRC32.str(JSON.stringify(inobj));
};

export function globalMessage(newmessage) {
    let mesg = `${new Date(Date.now()).toISOString()}: ${newmessage}`;
    console.log(mesg);
    let globalmsg = document.querySelector(`#globalmessage`);
    globalmsg.appendChild(document.createTextNode(mesg));
    globalmsg.appendChild(document.createElement("br"));
}

export function clearChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
