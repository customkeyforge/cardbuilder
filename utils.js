export const name = "utils";

export function cardElement(cardId, selector) {
    let res = document.querySelector(`#${cardId} #${selector}`);
    if (res == null)
        res = document.querySelector(`#${cardId} #${selector}`);
    return res;
}