import { StoryOption } from "./StoryOption.js"

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
        this.traversalEffects = traversalEffects ?  traversalEffects : unsetTraversalEffects()
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
        this.setCurrent( this.nodes.get('root') )
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
    /**
     * Initialize a new StoryNode instance and add it to this Story.
    */
    createNode(title: string, content?: string) {
        return this.addNode(title, new StoryNode(content))
    }
    /**
     * Add the given StoryNode to this story. 
     * @param title a name to be used to reference the node later.
     * @param node the StoryNode to add. 
     * @param options a set of StoryOptions to attach to the Node.
     * @example 
     *  let story = new Story()
     *  story.addNode("node1", new StoryNode())
     * //A new, empty node is placed in the story.
     *  story.addNode("node1", new StoryNode("some content"))
    */
    addNode(title: string, node: StoryNode, options?: Set<StoryOption>): StoryNode {
        if (this.has(title)) {
            this.resetExistingNode(node, title) 
        } else {
            this.setupNewNode(node, title);
        }
        if (options) {
            this.setupGivenOptions(node, options)
        } else {
            this.setupBlankOptions(node)
        }
        return this.node(title)
    }
    setupNewNode(node: StoryNode, title: string) {
        this.nodes.set(title, node)
        this.titles.set(node, title)
        this.adjacencyMap.set(node, new Set())
        this.ancestralAdjacencyMap.set(node, new Set())
    }
    resetExistingNode(node: StoryNode, title: string) {
        this.node(title).content = node.content
    }
    setupGivenOptions(node: StoryNode, options: Set<StoryOption>) {
        this.edgeMap.set(node, options)
        options.forEach((option)=>{ 
            this.adjacencies(node).add(option.destination)
            this.ancestralAdjacencies(option.destination).add(node)
        })
    }
    setupBlankOptions(node: StoryNode) {
        this.edgeMap.set(node, new Set())
    }
    /**
     * Removes a node from the story, clearing it from all adjacency maps and removing options leading to it as well.
    */
    removeNode(node: StoryNode) {
        if (this.has(node)) {
            let title = this.title(node)
            this.detachNodeFromChildren(node)
            this.detachNodeFromAncestors(node)
            this.nodes.delete(title)
            this.titles.delete(node)
        }
    }
    /**
     * Iterates through all ancestors of the given node and removes node from their adjacencies,
     * and removes options leading to node.
    */
    detachNodeFromAncestors(node: StoryNode) {
        this.ancestralAdjacencies(node).forEach((parentNode)=>{
            this.adjacencies(parentNode).delete(node)
            this.clearOptionsLeadingToNode(parentNode, node)
        })
    }
    /**
     * Iterates over children and removes given node from their ancestors map, 
     * then removes all options on node.
    */
    detachNodeFromChildren(node: StoryNode) {
        this.adjacencies(node).forEach((childNode)=>{
            this.ancestralAdjacencies(childNode).delete(node)
        })
        this.options(node).clear();
    }
    /**
     * Removes all options from the origin which point to destination.
    */
    clearOptionsLeadingToNode(origin: StoryNode, destination: StoryNode) {
        this.options(origin).forEach((option: StoryOption, same, set)=>{
            if (option.destination == destination) {
                set.delete(option)
            }
        })
    }
    /**
     * Initialize a new empty StoryOption linking origin to destination.
    */
    link(origin: StoryNode, destination: StoryNode): void {
        this.addOption(origin, new StoryOption('',destination))
    }
    /**
     * Add the given option to the node, and update adjacency maps 
     * to reflect the origin node and destination's adjacency.
    */
    addOption(node: StoryNode, option: StoryOption) {
        this.adjacencies(node).add(option.destination)
        this.ancestralAdjacencies(option.destination).add(node)
        this.options(node).add(option)
    }
    removeOption(node: StoryNode, option: StoryOption) {
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
    setCurrent(node: StoryNode) {
        if (this.has(node)) {
            this.currentNode = node
        }
    }
    /**
     * Callback recieves (node, title, nodeMap).
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