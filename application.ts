import { StoryRenderer } from "./scripts/StoryRenderer.js" 
import { readStoryData } from "./scripts/StoryIO.js"
import { listen } from "./scripts/dom_helpers.js"
import { toMiliseconds } from "./scripts/time_helpers.js"
import { 
    currentEditorForm,
    newChildForm,
    currentSelectForm,
    removeCurrentForm
} from "./scripts/application_forms.js"
import {
    addChild,
    useEnterToSubmit,
    shiftCurrent,
    removeCurrent,
    saveState,
    switchTabView
} from "./scripts/application_actions.js"
import { DynamicElement } from "./scripts/dynamicElement.js"
import { Story } from "./scripts/story.js"

//TODO for changing node titles, use recursive backpropogation 
//algorithm double link list graph aliasing over the ancestral nodes set

/*TEMP eventually add a setup form to initialize a new story, but current purpose is to edit labyrinth.*/
//let labyrinth = readStoryData("labyrinth")
//labyrinth.current = labyrinth.node("intro")
//let renderer = new StoryRenderer(labyrinth, "labyrinth")
let renderer = new StoryRenderer(new Story(), "sample_data")

let playerView = new DynamicElement("player-view")
let editorView = new DynamicElement("editor-view")
let savePopup = new DynamicElement("save-popup")
let popupOverlay = new DynamicElement("popup-overlay")
let nodeIndex = new DynamicElement("node-index")

let tabViewIsEditor = true;

useEnterToSubmit();
renderer.render();
renderer.renderPreview();

window.setInterval(()=>{
    saveState(renderer, savePopup)
}, toMiliseconds(0,0,10))

window.addEventListener('keydown', (e)=>{
    if (e.key == "Tab" && e.getModifierState("Control") == true) {
        tabViewIsEditor = switchTabView(tabViewIsEditor, playerView, editorView)
    }
})

newChildForm.onSubmit        = () => { addChild(renderer, newChildForm) }
currentEditorForm.onSubmit   = () => { renderer.setCurrentData(currentEditorForm); renderer.render(); }
currentSelectForm.onSubmit   = () => { shiftCurrent(renderer, currentSelectForm) }

removeCurrentForm.onSubmit = () => { removeCurrent(renderer, removeCurrentForm); popupOverlay.hide();}
removeCurrentForm.onClose   = () => { removeCurrentForm.hide(); popupOverlay.hide(); }
listen("remove-current", "mouseup",      () => { removeCurrentForm.show(); popupOverlay.show(); })

listen("add-child", "mouseup",             () => { newChildForm.show() })
listen("save", "mouseup",                   () => { saveState(renderer, savePopup) })

listen("editor-view-selector", "mouseup", ()=>{ tabViewIsEditor = switchTabView(tabViewIsEditor, playerView, editorView) })
listen("player-view-selector", "mouseup", ()=>{ tabViewIsEditor = switchTabView(tabViewIsEditor, playerView, editorView) })

listen("view-node-index", "mouseup", ()=>{ nodeIndex.show(); popupOverlay.show() })
listen("node-index-close", "mouseup", ()=>{ nodeIndex.hide(); popupOverlay.hide() })