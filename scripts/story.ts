
const fs = require("fs")

export interface MusicEffectsObject {
    fadeIn: boolean,
    fadeInTime: number,
    fadeOut: boolean,
    fadeOutTime: number
    //etc etc tbd
}

export interface StoryNodeTraversalEffectsObject {
    image: boolean,
    imageURL: string,
    persistentImage: boolean,
    music: boolean,
    musicURL: string,
    musicEffects: MusicEffectsObject,
    scoreChanges: Array<[string, number]>
}

function unsetTraversalEffects() {
    return {
        image: false,
        imageURL: "",
        persistentImage: false,
        music: false,
        musicURL: "",
        musicEffects: { fadeIn: false, fadeInTime: 0, fadeOut: false, fadeOutTime: 0 },
        scoreChanges: []
    }
}

export class StoryNode {
    content: string
    hasTraversalEffects: boolean
    traversalEffects: StoryNodeTraversalEffectsObject
    constructor(content?: string, traversalEffects?: StoryNodeTraversalEffectsObject) {
        this.content = content ? content : ''
        traversalEffects = traversalEffects ?  traversalEffects : unsetTraversalEffects()
    }
}

export class StoryOption {
    disabled: boolean = false
    text: string = ''
    destination: StoryNode
    optionID: string
    constructor(text: string, destination: StoryNode) {
        this.text = text
        this.destination = destination
        this.optionID = "OPT-" + (Math.floor(Math.random() * 10) + Date.now())
    }
}

export class Story {
    nodes: Map<string, StoryNode> = new Map();
    titles: Map<StoryNode, string> = new Map();

    ancestralEdgeMap: Map<StoryNode, Set<StoryNode>> = new Map();
    ancestralAdjacencyMap: Map<StoryNode, Set<StoryNode>> = new Map();

    adjacencyMap: Map<StoryNode, Set<StoryNode>> = new Map();
    edgeMap: Map<StoryNode, Set<StoryOption>> = new Map();

    currentNode: StoryNode
    constructor () {
        this.addNode('root', new StoryNode())
        this.currentNode = this.nodes.get('root') as StoryNode
    }
    /**
     * Checks whether the specified node or node title exists in the story.
    */
    has(node: StoryNode | string): boolean {
        if (node instanceof StoryNode) {
            return this.adjacencyMap.get(node) != undefined
        } else {
            return this.nodes.get(node) != undefined
        }
        
    }
    node(nodeTitle: string): StoryNode {
        return this.nodes.get(nodeTitle);
    }
    title(node: StoryNode): string {
        return this.titles.get(node);
    }
    adjacencies(node: StoryNode): Set<StoryNode> {
        return this.adjacencyMap.get(node);
    }
    ancestralAdjacencies(node: StoryNode): Set<StoryNode> {
        return this.ancestralAdjacencyMap.get(node);
    }
    options(node: StoryNode): Set<StoryOption> {
        return this.edgeMap.get(node);
    }
    addNode(title: string, node: StoryNode, options?: Set<StoryOption>): StoryNode {
        if (!this.has(title)) {
            this.nodes.set(title, node)
            this.titles.set(node, title)
            this.adjacencyMap.set(node, new Set())
            this.ancestralAdjacencyMap.set(node, new Set())
        } else if (this.has(title)) {
            this.node(title).content = node.content
        }
        if (options) {
            this.setupOptions(node, options)
        } else {
            this.edgeMap.set(node, new Set())
        }
        return this.node(title)
    }
    removeNode(node: StoryNode) {
        if (this.has(node)) {
            let title = this.title(node)
            this.adjacencies(node).forEach((childNode)=>{
                this.ancestralAdjacencies(childNode).delete(node)
            })
            this.ancestralAdjacencies(node).forEach((parentNode)=>{
                this.adjacencies(parentNode).delete(node)
                this.options(parentNode).forEach((option: StoryOption, same, set)=>{
                    if (option.destination == node) {
                        set.delete(option)
                    }
                })
            })
        }
    }
    setupOptions(node: StoryNode, options: Set<StoryOption>) {
        this.edgeMap.set(node, options)
        options.forEach((option)=>{ 
            this.adjacencies(node).add(option.destination)
            this.ancestralAdjacencies(option.destination).add(node)
        })
    }
    link(origin: StoryNode, destination: StoryNode): void {
        this.adjacencies(origin).add(destination)
        this.options(origin).add(new StoryOption('',destination))
    }
    addOption(node: StoryNode, option: StoryOption) {
        this.adjacencies(node).add(option.destination)
        this.ancestralAdjacencies(option.destination).add(node)
        this.options(node).add(option)
    }
    removeOption(node: StoryNode, option: StoryOption) {
        console.log(`removed ${this.title(option.destination)} from ${this.title(node)}`)
        this.adjacencies(node).delete(option.destination)
        this.ancestralAdjacencies(option.destination).delete(node)
        this.options(node).delete(option)
    }
    traverse(option: StoryOption): StoryNode {
        let optionMap = this.options(this.currentNode)
        if (optionMap.has(option)) {
            this.currentNode = option.destination
        }
        return this.currentNode
    }
    set current (node: StoryNode) {
        if (this.has(node)) {
            this.currentNode = node
        }
    }
    /**
     * Callback recieves (node, title, nodeMap)
    */
    forEachNode(callback, returnVariable?): any {
        return this.nodes.forEach(callback, returnVariable)
    }
    get emptyNodes() {
        let emptyNodes = []
        this.forEachNode((node: StoryNode)=>{
            if (node.content == '') {
                emptyNodes.push(this.title(node))
            }
        }, emptyNodes)
        return emptyNodes 
    }
    get disconnectedNodes() {
        let disconnectedNodes = []
        this.forEachNode((node: StoryNode)=>{
            if (this.adjacencies(node).size == 0) {
                if (this.ancestralAdjacencies(node).size == 0) {
                    disconnectedNodes.push(this.title(node))
                }
            }
        }, disconnectedNodes)
        return disconnectedNodes
    }
}

interface NodeData {
    "content": string,
    "options": StoryNodeOption[]
}
interface StoryNodeOption {
    "text": string,
    "destination": string
}

export function readStoryData(filename: string): Story {
    let story = new Story()
    let data = JSON.parse(fs.readFileSync("./data/" + filename + ".json"))
    let nodes = Object.keys(data)
    for (let i=0; i < nodes.length; i++) {
        let title = nodes[i]
        let currentNodeData = data[title]
        let { content, options }  = <NodeData>currentNodeData
        let currentNode = new StoryNode(content)
        currentNode = story.addNode(title, currentNode)
        for (let j = 0; j < options.length; j++) {
            let { text, destination } = options[j]
            let destinationNode = story.node(destination)
            if (destination == undefined) {
                console.log(text)
            }
            if (destinationNode == undefined) {
                destinationNode = new StoryNode()
                story.addNode(destination, destinationNode)
            }
            let option = new StoryOption(text, destinationNode)
            story.addOption(currentNode, option)
        }
    }
    return story
}

export function writeStoryData(story: Story, sessionID: string) {
    let save = {}
    let backup = "./data/" + sessionID + ".json"
    let filename = "./data/" + sessionID.split('-')[0] + ".json"
    story.forEachNode((node: StoryNode, title: string)=>{
        save[title] = {
            "content": node.content,
            "options": []
        }
        story.options(node).forEach((option: StoryOption)=>{
            save[title].options.push({
                "text": option.text,
                "destination": story.title(option.destination)
            })
        })
    })
    fs.writeFileSync(backup, fs.readFileSync(filename))
    fs.writeFileSync(filename, JSON.stringify(save))
}

//document to make it clearer on what happens when a node doesn't exist in the story, but is referenced anyway. desired behaviour is that that node should be created empty with the given title under the assumption that is should exist if it's being called, and since it's at that title, it will be given content later. since Maps and Sets can only store unique entries, adding a node with the same name later will overwrite the empty one.