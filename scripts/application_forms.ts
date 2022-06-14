
import { Form } from "./form.js"; 

export const currentEditorForm = new Form("current-editor-form")
currentEditorForm.addInput('content','current-content-editor')
currentEditorForm.submitInput = "current-content-editor"

export const newChildForm = new Form("add-child-menu")
newChildForm.addInput('optionText','add-child-option-text')
newChildForm.addInput('destinationTitle','add-child-node-select')
newChildForm.submitInput = "add-child-node-select"