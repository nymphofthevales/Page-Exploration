
import {Story, StoryNode } from "./story.js"
import { StoryOption } from "./StoryOption.js"
import { readStoryData } from "./StoryIO.js"
import { Form } from "./form.js"; 
import { forEachInClass, listen } from "./dom_helpers.js";

export class StoryRenderer {
    sessionID: string
    story: Story
    constructor (story: Story, title: string) {
        this.story = story
        this.sessionID = title + "-" + Date.now()
    }
    render() {
        this.renderEditorView()
        this.renderStoryView()
    }
    renderEditorView() {
        this.setContentViewer()
        this.setChildViewer()
        this.setAncestorViewer()
        this.updateStoryNodeLists()
        this.renderPreview()
        this.fillConditionalOptionsMenu()
    }
    renderStoryView() {
        this.setStoryText()
        this.setStoryOptions()
        this.handleNodeTraversalEffects()
    }
    clearStoryText() {
        document.getElementById("story-text").innerHTML = ""
    }
    setStoryText() {
        this.clearStoryText()
        let current = this.story.currentNode
        document.getElementById("story-text").innerHTML = current.content
    }
    clearStoryOptions() {
        document.getElementById("story-options").innerHTML = ""
    }
    setStoryOptions() {
        this.clearStoryOptions()
        let current = this.story.currentNode
        let currentOptions = this.story.options(current)
        let storyOptionsFrame = document.getElementById("story-options")
        currentOptions.forEach((option, same, set)=>{
            if (!option.disabled) {
                let title = this.story.title(option.destination)
                let optionText = option.text
                //TODO OPTION IDENTITY
                storyOptionsFrame.appendChild(this.generateStoryOptionDOMNode(title, optionText))
                document.getElementById(`story-option-${title}`).addEventListener('mouseup', ()=>{
                    this.traverseOption(option)
                })
            }
        })
    }
    handleNodeTraversalEffects() {
        if (this.story.currentNode.hasTraversalEffects) {
            //trigger image, music, etc. events
        }
    }
    generateStoryOptionDOMNode(title, optionText): Node {
        let wrapper = document.createElement("div")
        wrapper.innerHTML = this.generateStoryOptionButtonHTML(title, optionText)
        return wrapper.firstChild
    }
    generateStoryOptionButtonHTML(title, optionText): string {
        //TODO OPTION IDENTITY switch to better identifier system. using node titles is dangerous when multiple options point to same node.
        return `<button id="story-option-${title}"> ${optionText} </button>`
    }
    renderPreview() {
        let iframe = <HTMLIFrameElement>document.getElementById("preview-frame")
        iframe.srcdoc = `
        <html>
            <head>
                <link rel="stylesheet" href="./userPreviewStyle.css">
            </head>
            <body>
                <div id="story-content-preview">${this.story.currentNode.content}</div>
            </body>
        </html>`
    }
    setCurrentData(content) {
        this.story.currentNode.content = content
    }
    setContentViewer() {
        let contentViewer = <HTMLTextAreaElement>document.getElementById("current-content-editor")
        let titleViewer = document.getElementById("current-title")
        let current = this.story.currentNode
        contentViewer.value = current.content
        titleViewer.innerText = this.story.title(current)
    }
    setAncestorViewer() {
        forEachInClass("ancestor-node", (element)=>{
            element.remove()
        })
        let currentAncestors = this.story.ancestralAdjacencies(this.story.currentNode)
        currentAncestors.forEach((storyNode)=>{
            this.placeAncestorNode(storyNode)
        })
    }
    setChildViewer() {
        forEachInClass("child-bundle", (element)=>{
            element.remove()
        })
        let currentOptions = this.story.options(this.story.currentNode)
        currentOptions.forEach((option)=>{
            this.placeChildNode(option)
        })
    }
    /**
     * Using the user-provided data in the newChild form, adds an option to the currently selected node. 
     * If the destination node specified does not exist in the current story, makes a new empty node with the provided title.
     */
    linkNewChild(renderer, {optionText, destinationTitle}) {
        let destinationNode;
        if (this.story.has(destinationTitle)) {
            destinationNode = this.story.node(destinationTitle)
            console.log("had node")
        } else {
            destinationNode = this.story.addNode(destinationTitle, new StoryNode())
            console.log("didnt")
        }
        let option = new StoryOption( optionText, destinationNode )
        this.story.addOption(this.story.currentNode, option)
        renderer.placeChildNode(option)
    }
    placeChildNode(option: StoryOption): void {
        let viewer = <HTMLDivElement>document.getElementById("children")
        let title = this.story.title(option.destination)
        let content = option.destination.content
        content = content.slice(0,50) + "..."
        let childNode = this.createChildNodeDOMNode(title, option.text)
        viewer.appendChild(childNode)
        //TODO OPTION IDENTITY
        document.getElementById(`child-${title}-content-preview`).innerText = content
        this.setupChildOptionForm(option, `child-${title}-option-text`)
        listen(`child-${title}-traversal`, `click`, ()=>{ this.traverseOption(option) })
        listen(`remove-child-${title}`, `mouseup`, ()=>{ this.removeChild(title, option) })
    }
    setupChildOptionForm(option, id) {
        let childOptionForm = new Form(id)
        childOptionForm.addInput("text", id)
        childOptionForm.submitInput = id
        childOptionForm.onSubmit = () => { 
            this.changeOptionText(option, childOptionForm) 
            this.render()
        }
    }
    changeOptionText(option, childOptionForm) {
        let { text } = childOptionForm.read()
        option.text = text;
    }
    createChildNodeDOMNode(title, optionText): Node {
        let wrapper = document.createElement("div")
        wrapper.innerHTML = this.generateChildNodeInnerHTML(title, optionText)
        return wrapper.firstChild
    }
    generateChildNodeInnerHTML(title: string, optionText: string): string {
        //TODO OPTION IDENTITY
        return `<div id="child-${title}-bundle" class="child-bundle">
                <form action="javascript:void(0);" id="child-${title}-option-form" class="option-form">
                <label for="child-${title}-option-text">Story option:</label>
                <input type="text" id="child-${title}-option-text" value="${optionText}">
            </form>
            <button id="child-${title}-traversal" class="story-node child-node">
                <h2 id="child-${title}-title">${title}</h2>
                <p id="child-${title}-content-preview"></p>
            </button>
            <button id="remove-child-${title}" class="remove-child">—</button>
        </div>`
    }
    removeChild(title, option) {
        this.story.removeOption(this.story.currentNode, option)
        document.getElementById(`child-${title}-bundle`).remove();
        this.updateStoryNodeLists()
    }

    placeAncestorNode(ancestor: StoryNode) {
        let viewer = <HTMLDivElement>document.getElementById("ancestors")
        let title = this.story.title(ancestor)
        let content = ancestor.content
        content = content.slice(0,50) + "..."
        let ancestorNode = this.createAncestorDOMNode(title)
        viewer.appendChild(ancestorNode)
        document.getElementById(`parent-${title}-content-preview`).innerText = content
        document.getElementById(`parent-${title}`).addEventListener("click",()=>{
            this.traverseTo(ancestor)
        })
    }
    createAncestorDOMNode(title: string): Node {
        let wrapper = document.createElement("div")
        wrapper.innerHTML = this.generateAncestorNodeInnerHTML(title)
        return wrapper.firstElementChild
    }
    generateAncestorNodeInnerHTML(title: string): string {
        return `
        <button id="parent-${title}" class="story-node ancestor-node">
            <h2 id="parent-${title}-title">${title}</h2>
            <p id="parent-${title}-content-preview"></p>
        </button>
        `
    }

    updateStoryNodeLists() {
        //TEMP iterating through all nodes every time may cause performance issues.
        let nodeTitles = this.generateNodeTitlesList()
        let longestSize = getLastElement(nodeTitles)?.length
        nodeTitles.sort()
        forEachInClass("story-node-selector", (element)=>{
            element.innerHTML = ''
            this.appendNodeTitleOptionList(element, nodeTitles, longestSize)
        })
        this.appendNodeTitleLiList(document.getElementById("node-index-ul"), nodeTitles)
    }
    appendNodeTitleOptionList(select, nodeTitles, longestSize) {
        for (let i=0; i < nodeTitles.length; i++) {
            let title = nodeTitles[i]
            let opt = document.createElement("option")
            select.appendChild(opt).id=`story-node-selector-${select.id}-${title}`
            let optionReference = <HTMLOptionElement>document.getElementById(`story-node-selector-${select.id}-${title}`)
            optionReference.value = title;
            let previewText = this.generateNodeSelectPreviewText(title, longestSize)
            optionReference.innerText = `${title}: ${previewText}` 
        }
    }
    appendNodeTitleLiList(list, nodeTitles) {
        list.innerHTML = "";
        for (let i=0; i < nodeTitles.length; i++) {
            let title = nodeTitles[i]
            let li = document.createElement("li")
            list.appendChild(li).id=`story-node-index-${title}`
            let liReference = <HTMLLIElement>document.getElementById(`story-node-index-${title}`)
            liReference.innerHTML = `<a id="story-node-index-${title}-link">${title}</a>`
            document.getElementById(`story-node-index-${title}-link`).addEventListener('click', ()=>{
                this.traverseTo(this.story.node(title))
                document.getElementById("popup-overlay").classList.add("hidden")
                document.getElementById("node-index").classList.add("hidden")
            })
        }
    }
    generateNodeTitlesList() {
        let nodeTitles = []
        this.story.forEachNode((node, title)=>{
            let lastElement = nodeTitles[nodeTitles.length - 1]
            if (lastElement != undefined) {
                if (title.length >= lastElement.length) {
                    nodeTitles.push(title)
                } else {
                    nodeTitles.unshift(title)
                }
            } else {
                nodeTitles.push(title)
            }
        }, nodeTitles)
        return nodeTitles
    }
    generateNodeSelectPreviewText(title, longestTitleLength) {
        let defaultLength = 5
        let previewLength;
        if (longestTitleLength < 30) {
            previewLength = (30 - title.length) + defaultLength
        } else {
            previewLength = (longestTitleLength - title.length) + defaultLength
        }
        let previewText = this.story.node(title).content.slice(0,previewLength)
        return previewText
    }

    fillConditionalOptionsMenu() {
        let current = this.story.currentNode
        let currentOptions = this.story.options(current)
        let optionsMenu = document.getElementById("conditional-options-selection")
        optionsMenu.innerHTML = "";
        currentOptions.forEach((option, same, set)=>{
            let conditionalOption = this.createConditionalOptionDOMNode(option)
            optionsMenu.appendChild(conditionalOption)
        })
    }
    createConditionalOptionDOMNode(option): Node {
        let wrapper = document.createElement("div")
        wrapper.innerHTML = this.generateConditionalOptionHTML(option)
        return wrapper.firstChild
    }
    generateConditionalOptionHTML(option): string {
        //TODO OPTION IDENTITY
        let destinationTitle = this.story.title(option.destination)
        let optionText = option.text.length < 25 ? option.text : option.text.slice(0,25);
        return `<label><input type="checkbox" id="conditional-options-${destinationTitle}"> "${optionText}" => <i>${destinationTitle}</i></label>`
    }
    traverseOption(option) {
        this.story.traverse(option)
        this.render()
    }
    traverseTo(node: StoryNode) {
        this.story.current = node
        this.render()
    }
}

function getLastElement(a: Array<any>): any {
    return a[a.length - 1]
}
