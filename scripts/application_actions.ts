
import { Story } from "./story.js"
import { StoryRenderer } from "./StoryRenderer.js"

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

export function shiftCurrent(renderer: StoryRenderer, currentSelectForm) {
    let { selection } = currentSelectForm.read()
    if (renderer.story.nodes.has(selection)) {
        renderer.traverseTo(renderer.story.node(selection))
    }
    document.getElementById("current-node-select").blur()
    currentSelectForm.clearInputs();
    
}

export function removeCurrent(renderer: StoryRenderer, removeCurrentForm) {
    if (renderer.story.title(renderer.story.currentNode) != "root") {
        renderer.story.removeNode(renderer.story.currentNode)
        renderer.traverseTo(renderer.story.node('root'))
        renderer.render()
    } else {
        throw new Error("Root node cannot be removed.")
    }
    removeCurrentForm.hide()
}

function lastCharIsNum(string): boolean {
    return parseInt(string.charAt(string.length - 1)) != NaN
}