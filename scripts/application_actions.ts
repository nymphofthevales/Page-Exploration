
/**
 * Makes the enter key blur the focused element. 
 * Causes inputs and textareas to fire "change" events when entered on.
 * Shift + Enter bypasses the blur in order to allow the entry of newlines.
*/
export function useEnterToSubmit() {
    window.addEventListener('keydown', (e) => {
        if (e.key == "Enter" && e.getModifierState("Shift") == false) {
            if ( !(document.activeElement.tagName == "BODY" || document.activeElement.tagName == null) ) {
                let activeElement = <HTMLElement>document.activeElement
                activeElement.blur()
                console.log('blurred')
            }
        }
    })
}

export function addChild(renderer, newChildForm) {
    newChildForm.hide(); 
    renderer.linkNewChild(renderer, newChildForm); 
    newChildForm.clearInputs();
}
