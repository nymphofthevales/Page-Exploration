import { StoryRenderer } from "./scripts/StoryRenderer.js" 
import {readStoryData } from "./scripts/story.js"
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
    renderPreview
} from "./scripts/application_actions.js"
import { DynamicElement } from "./scripts/dynamicElement.js"

//TODO for changing node titles, use recursive backpropogation 
//algorithm double link list graph aliasing over the ancestral nodes set

/*TEMP eventually add a setup form to initialize a new story, but current purpose is to edit labyrinth.*/
let labyrinth = readStoryData("labyrinth")
labyrinth.current = labyrinth.node("intro")
let renderer = new StoryRenderer(labyrinth, "labyrinth")
let savePopup = new DynamicElement("save-popup")
let popupOverlay = new DynamicElement("popup-overlay")

useEnterToSubmit();
renderPreview(renderer);
window.setInterval(()=>{
    saveState(renderer, savePopup)
}, toMiliseconds(0,0,10))

newChildForm.onSubmit        = () => { addChild(renderer, newChildForm) }
currentEditorForm.onSubmit   = () => { renderer.setCurrentData(currentEditorForm); renderPreview(renderer); }
currentSelectForm.onSubmit   = () => { shiftCurrent(renderer, currentSelectForm) }

removeCurrentForm.onSubmit = () => { removeCurrent(renderer, removeCurrentForm); popupOverlay.hide();}
removeCurrentForm.onClose   = () => { removeCurrentForm.hide(); popupOverlay.hide(); }
listen("remove-current", "mouseup", () => { removeCurrentForm.show(); popupOverlay.show(); })

listen("add-child", "mouseup",        () => { newChildForm.show() })
listen("save", "mouseup",              () => { saveState(renderer, savePopup) })