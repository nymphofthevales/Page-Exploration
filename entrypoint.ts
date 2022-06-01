
const fs = require("fs")

class StoryNode {
    content: string
    constructor(content?: string) {
        this.content = content? content : ''
    }
}

class StoryOption {
    disabled: boolean = false
    text: string = ''
    destination: StoryNode
    constructor(text: string, destination: StoryNode) {
        this.text = text
        this.destination = destination
    }
}

class Story {
    nodes: Map<string, StoryNode>
    adjacencyMap: Map<StoryNode, Set<StoryNode>>
    edgeMap: Map<StoryNode, Set<StoryOption>>
    currentNode: StoryNode
    constructor () {
        this.nodes = new Map()
        this.adjacencyMap = new Map()
        this.edgeMap = new Map()
        this.addNode('root', new StoryNode())
        this.currentNode = this.nodes.get('root') as StoryNode
    }
    getOptions(node: StoryNode): Set<StoryOption> {
        return this.edgeMap.get(node) as Set<StoryOption>
    }
    node(nodeTitle: string): StoryNode | undefined {
        return this.nodes.get(nodeTitle)
    }
    adjacencies(node: StoryNode): Set<StoryNode> | undefined {
        return this.adjacencyMap.get(node) 
    }
    options(node: StoryNode): Set<StoryOption> | undefined {
        return this.edgeMap.get(node) 
    }
    addNode(title: string, node: StoryNode, options?: Set<StoryOption>) {
        this.nodes.set(title, node)
        this.adjacencyMap.set(node, new Set())
        if (options) {
            this.edgeMap.set(node, options)
            options.forEach((option)=>{ 
                this.adjacencies(node)?.add(option.destination) 
            })
        } else {
            this.edgeMap.set(node, new Set())
        }
    }
    link(origin: StoryNode, destination: StoryNode): void {
        this.adjacencies(origin)?.add(destination)
        this.options(origin)?.add(new StoryOption('',destination))
    }
    linkByOption(node: StoryNode, option: StoryOption) {
        this.adjacencies(node)?.add(option.destination)
        this.options(node)?.add(option)
    }
    traverse(option: StoryOption): StoryNode {
        if (!option.disabled) {
            let optionMap = this.getOptions(this.currentNode)
            if (optionMap.has(option)) {
                this.currentNode = option.destination
            }
        }
        return this.currentNode
    }
    set current (node: StoryNode) {
        if (this.adjacencyMap.has(node)) {
            this.currentNode = node
        }
    }
}


function readStoryFromJSON(path: string): Story {
    let story = new Story()
    let data = JSON.parse(fs.readFileSync(path))
    let nodes = Object.keys(data)
    for (let i=0; i < nodes.length; i++) {
        let title = nodes[i]
        let currentNodeData = data[title]
        let {content, options}  = currentNodeData
        let currentNode = new StoryNode(content)
        story.addNode(title, currentNode)
        for (let j = 0; j < options.length; j++) {
            let { text, destination } = options[j]
            let destinationNode = story.node(destination)
            if (destinationNode == undefined) {
                destinationNode = new StoryNode()
                story.addNode(destination, destinationNode)
            }
            let option = new StoryOption(text, destinationNode)
            story.linkByOption(currentNode, option)
        }
    }
    return story
}

let labyrinth = readStoryFromJSON("./keeper-of-the-labyrinth.json")
labyrinth.current = labyrinth.node("intro0") as StoryNode


//document to make it clearer on what happens when a node doesn't exist in the story, but is referenced anyway. desired behaviour is that that node should be created empty with the given title under the assumption that is should exist if it's being called, and since it's at that title, it will be given content later. since Maps and Sets can only store unique entries, adding a node with the same name later will overwrite the empty one.