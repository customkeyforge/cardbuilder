export const name = "cardTypes";

export const drawArtImg = {};
export const fixPrimaryColor = {};
export const fixBannerColor = {};
export const fixSecondaryColor = {};
export const fixSecondary2Color = {};
export const fixSecondary3Color = {};
export const fixTextBackgroundColor = {};
export const fixTextBackgroundStamp = {};


function distance(p1, p2) {
   const xDelta = (p2.x - p1.x);
   const yDelta = (p2.y - p1.y);
   const d = Math.sqrt(xDelta * xDelta + yDelta * yDelta);
   return d;
}

function findAngle(A,B,C) {
   var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
   var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
   var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
   return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}
export class CardType {
    typeName = "";
    drawSteps = [];
    titleCurve = [];
    artCoords = [];
    textStartCoords = [];
    textBadgeCoords = [];
    typeStartCoords = [];
    hasTraits = false;
    hasPower = false;
    traitsCenterCoords = [];
    powerCenterCoords = [];
    armorCenterCoords = [];
    typeRotation = 0;
    textStampShouldClip = false;
    getClippingPath = () => {};
    textBackgroundSolidImage = {};
    secondarySolidImage = {};
    secondary2SolidImage = {};
    secondary3SolidImage = {};
    primarySolidImage = {};
    bannerSolidImage = {};
    fallbackOffset = 0;
    constructor(typeName, canvasWidth) {
        this.typeName = typeName;
        let frameImage = document.getElementById('frame');
        if (typeName == "Action") {
            this.primarySolidImage = document.getElementById('action_primary_solid');
            let actionPrimaryAlphaImage = document.getElementById('action_primary_alpha');
        
            this.textBackgroundSolidImage = document.getElementById('action_text_background_solid');
            let actionTextBackgroundAlphaImage = document.getElementById('action_text_background_alpha');
        
            this.secondarySolidImage = document.getElementById('action_secondary_solid');
            let actionSecondaryAlphaImage = document.getElementById('action_secondary_alpha');
            let actionSwoopImage = document.getElementById('action_swoop');
            this.drawSteps = [drawArtImg, fixTextBackgroundColor, fixTextBackgroundStamp, actionTextBackgroundAlphaImage, 
                fixSecondaryColor, actionSecondaryAlphaImage, actionSwoopImage, fixPrimaryColor, actionPrimaryAlphaImage, 
                frameImage];
                
            this.artCoords = [45,40]
            this.textStartCoords = [70,690]
            this.textBadgeCoords = [350,565]
                
            let actionTextTitleXOffset = 130;
            let x2 = (canvasWidth * .18) + actionTextTitleXOffset / 2
            let ybaseline = 592;
            let y2 = ybaseline + 45;
            let y3 = ybaseline - 50;
            let y4 = y3 + 40;

            this.titleCurve[0] = [actionTextTitleXOffset,ybaseline];
            this.titleCurve[1] = [x2,y2];
            this.titleCurve[2] = [canvasWidth - x2,y3];
            this.titleCurve[3] = [canvasWidth - actionTextTitleXOffset,y4];

            this.typeStartCoords = [183,660];
            this.typeRotation = -8;
        }
        else  if (typeName == "Upgrade") {
            this.primarySolidImage = document.getElementById('artifact_upgrade_primary_solid');
            let primaryAlphaImage = document.getElementById('artifact_upgrade_primary_alpha');
            this.bannerSolidImage = document.getElementById('artifact_upgrade_banner_solid');
            let bannerAlphaImage = document.getElementById('artifact_upgrade_banner_alpha');
        
            this.textBackgroundSolidImage = document.getElementById('upgrade_text_background_solid');
            let textBackgroundAlphaImage = document.getElementById('upgrade_text_background_alpha');
        
            this.secondarySolidImage = document.getElementById('upgrade_secondary_solid');
            let secondaryAlphaImage = document.getElementById('upgrade_secondary_alpha');
            
            this.drawSteps = [drawArtImg, fixTextBackgroundColor, fixTextBackgroundStamp, textBackgroundAlphaImage, 
                fixSecondaryColor, secondaryAlphaImage, fixPrimaryColor, primaryAlphaImage, 
                frameImage, fixBannerColor, bannerAlphaImage];
                
            this.artCoords = [45,300]
            this.textStartCoords = [70,200]
            this.textBadgeCoords = [350,100]
            this.fallbackOffset = 55;

            this.textStampShouldClip  = true;
            this.getClippingPath = (ctx) => {

                let pointCorner = {x: 35, y:418};
                let pointA = {x: 98, y:450};
                let pointC = {x: canvasWidth / 2, y:379}; //The upper part of the arc
                let pointB = {x: canvasWidth - 98, y:450};
                //calculate distance between points and find the smallest one
                const dAC = distance(pointA, pointC);
                const dBC = distance(pointB, pointC);
                //calculate angle between ACB (C is vertex)
                const anglePoints = findAngle(pointA, pointC, pointB);
                // calculate radius
                const r = Math.ceil(Math.min(dAC, dBC) * Math.abs(Math.tan(anglePoints / 2)));
                
                let p = new Path2D();
                p.moveTo(0,0);
                p.moveTo(pointCorner.x,pointCorner.y);
                p.lineTo(pointA.x,pointA.y);
                p.arcTo(pointC.x, pointC.y, pointB.x, pointB.y, r);
                p.lineTo(canvasWidth - pointCorner.x,pointCorner.y);
                p.lineTo(canvasWidth - pointCorner.x,0);
                p.lineTo(0,0);
                return p;
            };
            let actionTextTitleXOffset = 110;
            let x2 = (canvasWidth * .3) + actionTextTitleXOffset / 2
            let ybaseline = 110;
            let centerAdjust = 40;
            let y2 = ybaseline - centerAdjust;
            let y3 = ybaseline - centerAdjust;
            let y4 = ybaseline ;

            this.titleCurve[0] = [actionTextTitleXOffset,ybaseline];
            this.titleCurve[1] = [x2,y2];
            this.titleCurve[2] = [canvasWidth - x2,y3];
            this.titleCurve[3] = [canvasWidth - actionTextTitleXOffset,y4];

            this.typeStartCoords = [177,128];
            this.typeRotation = 0;
        }else  if (typeName == "Artifact") {
            this.primarySolidImage = document.getElementById('artifact_upgrade_primary_solid');
            let primaryAlphaImage = document.getElementById('artifact_upgrade_primary_alpha');
            this.bannerSolidImage = document.getElementById('artifact_upgrade_banner_solid');
            let bannerAlphaImage = document.getElementById('artifact_upgrade_banner_alpha');
        
            this.textBackgroundSolidImage = document.getElementById('artifact_text_background_solid');
            let textBackgroundAlphaImage = document.getElementById('artifact_text_background_alpha');

            this.secondary3SolidImage = document.getElementById('artifact_secondary_wide_solid');
            let secondary3AlphaImage = document.getElementById('artifact_secondary_wide_alpha');
            
            this.secondarySolidImage = document.getElementById('artifact_secondary_solid');
            let secondaryAlphaImage = document.getElementById('artifact_secondary_alpha');
            this.secondary2SolidImage = document.getElementById('artifact_secondary2_solid');
            let secondary2AlphaImage = document.getElementById('artifact_secondary2_alpha');
            
            this.drawSteps = [drawArtImg, fixSecondaryColor, secondaryAlphaImage, fixSecondary3Color, secondary3AlphaImage, fixTextBackgroundColor, fixTextBackgroundStamp, textBackgroundAlphaImage, 
                fixSecondary2Color, secondary2AlphaImage, fixPrimaryColor, primaryAlphaImage, 
                frameImage, fixBannerColor, bannerAlphaImage];
                
            this.artCoords = [45,40]
            this.hasTraits = true;
            this.traitsCenterCoords = [canvasWidth / 2,640]
            this.textStartCoords = [70,680]
            this.textBadgeCoords = [350,565]
            this.fallbackOffset = 55;

            this.textStampShouldClip  = true;
            this.getClippingPath = (scalex, scaley) => {
                let one =  {x: 47, y:1000};
                let two =  {x: one.x, y:650};
                let thr =  {x: 148, y:600};
                let fou =  {x: 560, y:thr.y};
                let fiv =  {x: 667, y:two.y};
                let six =  {x: fiv.x, y:one.y};
                let p = new Path2D();
                let sx = (input) => {
                    return input * scalex;
                }
                let sy = (input) => {
                    return input * scaley;
                }

                p.moveTo(sx(one.x), sy(one.y));
                p.lineTo(sx(two.x), sy(two.y));
                p.lineTo(sx(thr.x), sy(thr.y));
                p.lineTo(sx(fou.x), sy(fou.y));
                p.lineTo(sx(fiv.x), sy(fiv.y));
                p.lineTo(sx(six.x), sy(six.y));
                p.lineTo(sx(one.x), sy(one.y));
                return p;
            };
            let actionTextTitleXOffset = 110;
            let x2 = (canvasWidth * .3) + actionTextTitleXOffset / 2
            let ybaseline = 110;
            let centerAdjust = 40;
            let y2 = ybaseline - centerAdjust;
            let y3 = ybaseline - centerAdjust;
            let y4 = ybaseline ;

            this.titleCurve[0] = [actionTextTitleXOffset,ybaseline];
            this.titleCurve[1] = [x2,y2];
            this.titleCurve[2] = [canvasWidth - x2,y3];
            this.titleCurve[3] = [canvasWidth - actionTextTitleXOffset,y4];

            this.typeStartCoords = [177,125];
            this.typeRotation = 0;
        }else  if (typeName == "Creature") {
            this.primarySolidImage = document.getElementById('creature_primary_solid');
            let primaryAlphaImage = document.getElementById('creature_primary_alpha');

            this.secondarySolidImage = document.getElementById('creature_secondary_solid');
            let secondaryAlphaImage = document.getElementById('creature_secondary_alpha');

            this.textBackgroundSolidImage = document.getElementById('artifact_text_background_solid');
            let textBackgroundAlphaImage = document.getElementById('artifact_text_background_alpha');
            
            let powerDefense = document.getElementById('power_defense');
            
            this.drawSteps = [drawArtImg, fixTextBackgroundColor, fixTextBackgroundStamp, textBackgroundAlphaImage,
                fixSecondaryColor, secondaryAlphaImage, 
                fixPrimaryColor, primaryAlphaImage, 
                frameImage, powerDefense];
                
            this.artCoords = [45,40]
            this.hasTraits = true;
            this.hasPower = true;
            this.traitsCenterCoords = [canvasWidth / 2, 675]
            let powerOffset = 97;
            let powerY = 593   ;
            this.powerCenterCoords = [powerOffset, powerY]
            this.armorCenterCoords = [canvasWidth - (powerOffset- 7) , powerY]
            this.textStartCoords = [70,715]
            this.textBadgeCoords = [350,565]
            this.fallbackOffset = 30;

            this.textStampShouldClip  = true;
            this.getClippingPath = (scalex, scaley) => {
                let one =  {x: 47, y:1000};
                let two =  {x: one.x, y:650};
                let thr =  {x: 148, y:600};
                let fou =  {x: 560, y:thr.y};
                let fiv =  {x: 667, y:two.y};
                let six =  {x: fiv.x, y:one.y};
                let p = new Path2D();
                let sx = (input) => {
                    return input * scalex;
                }
                let sy = (input) => {
                    return input * scaley;
                }
                p.moveTo(sx(one.x), sy(one.y));
                p.lineTo(sx(two.x), sy(two.y));
                p.lineTo(sx(thr.x), sy(thr.y));
                p.lineTo(sx(fou.x), sy(fou.y));
                p.lineTo(sx(fiv.x), sy(fiv.y));
                p.lineTo(sx(six.x), sy(six.y));
                p.lineTo(sx(one.x), sy(one.y));
                return p;
            };
            let actionTextTitleXOffset = 130;
            let x2 = (canvasWidth * .3) + actionTextTitleXOffset / 2
            let ybaseline = 615;
            let centerAdjust = 40;
            let y2 = ybaseline - centerAdjust;
            let y3 = ybaseline - centerAdjust;
            let y4 = ybaseline ;

            this.titleCurve[0] = [actionTextTitleXOffset,ybaseline];
            this.titleCurve[1] = [x2,y2];
            this.titleCurve[2] = [canvasWidth - x2,y3];
            this.titleCurve[3] = [canvasWidth - actionTextTitleXOffset,y4];

            this.typeStartCoords = [177,630];
            this.typeRotation = 0;
        }

    }
}