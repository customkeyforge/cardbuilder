import { rebuildJSON } from "./jsonOps.js";
import { downloadZip } from "https://cdn.jsdelivr.net/npm/client-zip/index.js";
import { cardElement } from "./utils.js"
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
    let progPerCard = 60 / cards.length;
    let deckname = document.getElementById('deckname').value;
    let readme = document.getElementById('readme').value;
    if (readme != null && readme != "") {
        imagePages.push({ name: `${deckname}.txt`, lastModified: new Date(), input: readme})
    }
    exportProgress(10, "Creating Cards");
    for (var index in cards) {
        let element = cards[index];
        let ctitle = cardElement(element.id, 'cardTitle');
        exportProgress(progPerCard * index, `Redrawing ${ctitle.value}`);
        drawAsync(element.id);
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
                    if (isFirstPage == false) 
                        doc.addPage();
                    
                    await doAsync(() => {
                        doc.addImage(hugeCanvas, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
                    });

                    if (exportCardBacks.checked) {
                        doc.addPage();
                        await doAsync(() => {
                            doc.addImage(backCanvas, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
                        });
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
            
            await doAsync(() => {
                doc.addImage(hugeCanvas, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
            });
            if (exportCardBacks.checked) {
                doc.addPage();
                await doAsync(() => {
                    doc.addImage(backCanvas, pdfleft, pdftop, cardPrintWidth * colCount, cardPrintHeight * rowCount,  null, "slow");
                });
            }
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