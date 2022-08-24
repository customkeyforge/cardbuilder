import { rebuildJSON } from "./jsonOps.js";
import { downloadZip } from "https://cdn.jsdelivr.net/npm/client-zip/index.js";
import { cardElement, dataUrlToBlob } from "./utils.js"
import { drawAsync } from "./cardDrawer.js";
const { jsPDF } = window.jspdf;


export const name = "exportDeck";

let exportProgress = (percent, message) => {
    console.log(message);
    requestAnimationFrame(() => {
        let exportMessage = document.getElementById('exportMessage');
        var progBase = document.getElementById("myProgress");
        var progBar = document.getElementById("myBar");
    
        progBase.style.display = "block";
        progBar.style.display = "block";
        exportMessage.textContent = message;
        progBar.style.width = percent + "%";
    });
};

let doAsync = (func) => {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
            func();
            resolve();
        });
    });
}

var TO_RADIANS = Math.PI/180; 
function rotateAndPaintImage ( context, image, angle, positionX, positionY, width, height) {
   // save the current co-ordinate system 
    // before we screw with it
    context.save(); 

    if (width == null)
        width = image.width;
    if (height == null)
        height = image.height;
        
    // move to the middle of where we want to draw our image
    context.translate(positionX + (height/2), positionY + (width/2));

    // rotate around that point, converting our 
    // angle from degrees to radians 
    context.rotate(angle * TO_RADIANS);

    // draw it up and to the left by half the width
    // and height of the image 
    context.drawImage(image, -(width/2), -(height/2), width, height);

    // and restore the co-ords to how they were when we began
    context.restore(); 
  }

export async function exportDeckForPrint() {
    let cardWidth = 715;
    let cardPrintWidth  = cardWidth;
    let cardHeight = 1000;
    let cardPrintHeight  = cardHeight;
    let main = document.getElementById('global');

    let exportStyle = document.getElementById('exportStyle');
    let exportZip = document.getElementById('exportZip');
    let defaultCardBack = document.getElementById('globalCardBackImg');
    let exportCardBacks = document.getElementById('exportCardBacks');
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
    let pdftopdouble = 0;
    let pdfleft = 0;
    let pdfleftdouble = 0;
    let pdfExport = exportStyle.value.endsWith("pdf"); 
    let mmPerPixel = 1;
    if (pdfExport) {
        cardPrintWidth = 63.5;
        cardPrintHeight = 88;
        mmPerPixel = cardPrintWidth / cardWidth;
        //            doc = new jsPDF({unit: "mm", format: `[${colCount * cardPrintWidth},${rowCount * cardPrintHeight}]`});
        doc = new jsPDF({unit: "mm", format: "letter"});
        pdfleft = (doc.internal.pageSize.getWidth() / 2) - ((cardPrintWidth * colCount) / 2);
        pdftop = (doc.internal.pageSize.getHeight() / 2) - ((cardPrintHeight * rowCount) / 2);
        pdfleftdouble = (doc.internal.pageSize.getWidth() / 2) - ((cardPrintHeight) / 2);
        pdftopdouble = (doc.internal.pageSize.getHeight() / 2) - ((cardPrintWidth * 2) / 2);
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
    //let cards = Array.from(document.querySelectorAll(".cardcontainer"));
    let cards = [];
    let doubleCards = [];
    let progPerCard = 10;
    document.querySelectorAll("#cardExportSelector input").forEach((checkbox) => {
        if (checkbox.checked) {
            let cardId = checkbox.getAttribute("cardId");
            let ctitle = cardElement(cardId, 'cardTitle');
            let quantity = cardElement(cardId, 'quantity');
            let doubleSize = cardElement(cardId, 'doubleSizeCheck').checked;
            exportProgress(progPerCard * index, `Redrawing ${ctitle.value}`);
            drawAsync(cardId);
            for (var i = 0; i < quantity.value; i++) {
                if (doubleSize)
                doubleCards.push({cardId: cardId, doubleSize: true });
                else
                cards.push({cardId: cardId, doubleSize: false });
            }
        }
    });
    
    let doubleCount = 0;
    doubleCards.forEach(doub => {
        var target = (doubleCount * colCount) - doubleCount;
        if (cards.length < target)
            cards.push({cardId: null});
        cards.splice(target, 0, doub);
        doubleCount++;
    });

    let fileName = "";
    let backFileName = "";
    let pageNumber = 1;
    let isFirstPage = true;
    let deckname = document.getElementById('deckname').value;

    
    let readme = document.getElementById('readme').value;
    if (readme != null && readme != "") {
        imagePages.push({ name: `${deckname}.txt`, lastModified: new Date(), input: readme})
    }
    exportProgress(10, "Creating Cards");
    let sourceCanvas = {};
    let backSourceCanvas = {};
    for (var index in cards) {
        let cardThing = cards[index];
        let currentPdfLeft = pdfleft;
        let currentPdfTop = pdftop;

        if (currentCol == 0 && currentRow == 0) {
            hugeContext.fillStyle = "white";
            hugeContext.fillRect(0, 0, contextWidth, contextHeight);
            backContext.fillStyle = "white";
            backContext.fillRect(0, 0, contextWidth, contextHeight);
        }
        pageSaved = false;
        fileName = `page${pageNumber}.png`;
        backFileName = `page${pageNumber}(Back).png`;

        let backImg = null;
        sourceCanvas = hugeCanvas;
        backSourceCanvas = backCanvas;
        if (cardThing.cardId != null) {
            let element = document.getElementById(cardThing.cardId)
            let ctitle = cardElement(element.id, 'cardTitle');
            let customCardBack = cardElement(element.id, 'customCardBackImg');
            let bigcan = cardElement(element.id, 'bigcanvas');
            if (exportCardBacks.checked) {
                backImg = defaultCardBack;
                if (customCardBack.src != null && customCardBack.src.startsWith("data:image"))
                    backImg = customCardBack;
            }
            if (rowCount == 1 && colCount == 1) {
                fileName = `${ctitle.value} ${parseInt(index) + 1}.png`
                backFileName = `${ctitle.value} ${parseInt(index) + 1}(Back).png`
            }
            if (cardThing.doubleSize) {
                rotateAndPaintImage(hugeContext, bigcan, 90, cardWidth * currentCol, cardHeight * currentRow);
                if (backImg != null) {
                    rotateAndPaintImage(backContext, backImg, -90,cardWidth * (colCount - currentCol - 2), cardHeight * currentRow, bigcan.width, bigcan.height);
                }
                currentCol++;
                if (colCount == 1 && rowCount == 1) {
                    currentPdfLeft = pdfleftdouble;
                    currentPdfTop = pdftopdouble;
                }
            }
            else {
                hugeContext.drawImage(bigcan, cardWidth * currentCol, cardHeight * currentRow);
                if (backImg != null) {
                    backContext.drawImage(backImg, cardWidth * (colCount - currentCol - 1) , cardHeight * currentRow);
                }
            }
            if (colCount == 1 && rowCount == 1) {
                sourceCanvas = bigcan;
                if (backImg != null) {
                    backSourceCanvas = backImg;
                    backSourceCanvas.width = sourceCanvas.width;
                    backSourceCanvas.height = sourceCanvas.height;
                }
            }
        }
        
        if (currentCol >= (colCount - 1) && currentRow == (rowCount - 1)){
            currentCol = 0; currentRow = 0;
            pageSaved = true;
            
            if (pdfExport) {
                if (isFirstPage == false) 
                    doc.addPage();
                
                await doAsync(() => {
                    doc.addImage(sourceCanvas, currentPdfLeft, currentPdfTop, sourceCanvas.width * mmPerPixel, sourceCanvas.height * mmPerPixel,  null, "slow");
                });

                if (exportCardBacks.checked) {
                    doc.addPage();
                    await doAsync(() => {
                        doc.addImage(backSourceCanvas, currentPdfLeft, currentPdfTop, backSourceCanvas.width * mmPerPixel, backSourceCanvas.height * mmPerPixel,  null, "slow");
                    });
                }
                isFirstPage = false;
            }
            else {
                console.log("saving page to zip");
                let blob = await new Promise(resolve => sourceCanvas.toBlob(resolve));
                imagePages.push({ name: fileName, lastModified: new Date(), input: blob});
                if (exportCardBacks.checked) {
                    let backblob = {};
                    if (backSourceCanvas.src != null) {
                        backblob = dataUrlToBlob(backSourceCanvas.src);
                    }
                    else {
                        backblob = await new Promise(resolve => backSourceCanvas.toBlob(resolve));
                    }
                    imagePages.push({ name: backFileName, lastModified: new Date(), input: backblob});
                }
            }
            pageNumber++;
        }
        else if (currentCol >= (colCount - 1)) {
            currentCol = 0; currentRow++;
        }
        else {
            currentCol++;
        }
    }
    if (pageSaved == false) {
        console.log("saving final not-full page.");
        if (pdfExport) {
            if (isFirstPage == false)
                doc.addPage();
            
            await doAsync(() => {
                doc.addImage(sourceCanvas, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
            });
            if (exportCardBacks.checked) {
                doc.addPage();
                await doAsync(() => {
                    doc.addImage(backSourceCanvas, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
                });
            }
        }
        else {
            let blob = await new Promise(resolve => sourceCanvas.toBlob(resolve));
            imagePages.push({ name: fileName, lastModified: new Date(), input: blob});
            if (exportCardBacks.checked) {
                let backblob = {};
                if (backSourceCanvas.src != null) {
                    backblob = dataUrlToBlob(backSourceCanvas.src);
                }
                else {
                    backblob = await new Promise(resolve => backSourceCanvas.toBlob(resolve));
                }
                imagePages.push({ name: backFileName, lastModified: new Date(), input: backblob});
            }
        }
    }
    exportProgress(70, "Finished Creating card pages.");

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
}