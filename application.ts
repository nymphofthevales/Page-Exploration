//The classes and functions forming the core of the application.
import { Story } from "./scripts/story.js"
import { StoryRenderer } from "./scripts/StoryRenderer.js" 
import { readStoryData } from "./scripts/StoryIO.js"

//Helper functions and extra classes.
import { listen } from "./scripts/dom_helpers.js"
import { toMiliseconds } from "./scripts/time_helpers.js"
import { DynamicElement } from "./scripts/dynamicElement.js" 

//The forms which the user will interact with in the application. 
//Each is a Form instance containing references to HTML inputs and methods for handling them.
import { 
    currentEditorForm,
    newChildForm,
    currentSelectForm,
    removeCurrentForm
} from "./scripts/application_forms.js"

//Functions to provide short names for all the actions the application needs to perform.
import {
    addChild,
    useEnterToSubmit,
    shiftCurrent,
    removeCurrent,
    saveState,
    switchTabView
} from "./scripts/application_actions.js"


//Set story to edit.
const storyFileName: string | undefined = "new"
const storyTitle: string | undefined = "new"
const existingRootNode: string | undefined = undefined;

//Prepare story instance.
let currentStory;
if (storyFileName) { 
    currentStory = readStoryData(storyFileName);
} else {
    currentStory = new Story();
}

//Set story root node if not default.
if (existingRootNode != undefined && existingRootNode != "root") { 
    currentStory.current = currentStory.node(existingRootNode) 
}

//Prepare story renderer. All applications now reference the Story instance through this renderer,
//Renderer passes requests to modify story data to its bound Story instance and handles presenting that data it to the user.
//The purpose of the global application state set up below is then to listen for user input and call renderer
//  actions based on that user input.
let renderer = new StoryRenderer(currentStory, storyTitle);

//Dynamic elements for referencing show/hide functionality of popup windows and tabs.
const playerView = new DynamicElement("player-view")
const editorView = new DynamicElement("editor-view")
const savePopup = new DynamicElement("save-popup")
const popupOverlay = new DynamicElement("popup-overlay")
const nodeIndex = new DynamicElement("node-index")

let tabViewIsEditor = true; //Tab view state toggle for editor / player view.

//Set interval for autosaving.
const saveInterval = 10; //Minutes
window.setInterval(()=>{
    saveState(renderer, savePopup)
}, toMiliseconds(0,0,saveInterval))

//Create listener for tab switching.
window.addEventListener('keydown', (e)=>{
    if (e.key == "Tab" && e.getModifierState("Control") == true) {
        tabViewIsEditor = switchTabView(tabViewIsEditor, playerView, editorView)
    }
})

useEnterToSubmit(); //Set window listener causing form elements to submit on "Enter" keydown.
renderer.render(); //Start application.

//Setup form submission actions.
newChildForm.onSubmit        = () => { addChild(renderer, newChildForm) }
currentEditorForm.onSubmit   = () => { renderer.setCurrentData( currentEditorForm.read().content ); renderer.render(); }
currentSelectForm.onSubmit   = () => { shiftCurrent(renderer, currentSelectForm) }
removeCurrentForm.onSubmit = () => { removeCurrent(renderer, removeCurrentForm); popupOverlay.hide();}
removeCurrentForm.onClose   = () => { removeCurrentForm.hide(); popupOverlay.hide(); }

//Setup UI button listeners.
listen("remove-current", "mouseup",      () => { removeCurrentForm.show(); popupOverlay.show(); })
listen("add-child", "mouseup",             () => { newChildForm.show() })
listen("save", "mouseup",                   () => { saveState(renderer, savePopup) })
listen("editor-view-selector", "mouseup", ()=>{ tabViewIsEditor = switchTabView(tabViewIsEditor, playerView, editorView) })
listen("player-view-selector", "mouseup", ()=>{ tabViewIsEditor = switchTabView(tabViewIsEditor, playerView, editorView) })
listen("view-node-index", "mouseup",     ()=>{ nodeIndex.show(); popupOverlay.show() })
listen("node-index-close", "mouseup",     ()=>{ nodeIndex.hide(); popupOverlay.hide() })