
//import { DiGraph, GraphNode } from "./Graph"

/**
 * A collection of all the pages in a story.
*/
class StoryManager extends DiGraph {
    nodes: Map<string, Sequence | StoryNode> = new Map()
    currentPage: Leaf
    constructor (rootNode: NodeTitle) {
        super()
        this.newSequence( {title: rootNode} )
        this.currentPage = this.get(rootNode).page(0)
    }
    get(index: NodeTitle): Sequence | StoryNode {
        let node = this.nodes.get(index)
        if (!node || node.constructor != Sequence || node.constructor != StoryNode) {
            throw new Error('No Sequence or StoryNode at index.')
        }
        return node
    }
    newSequence(opts: SequenceOptions) {
        this.add(new Sequence(opts, this))
    }
    newStoryNode(opts: StoryNodeOptions) {
        this.add(new StoryNode(opts, this))
    }
    populateSequences(titles: Array<string>) {
        for (let i=0; i< titles.length; i++) {
            this.newSequence( {title: titles[i]} )
        }
    }
    populateStoryNodes(titles: Array<string>) {
        for (let i=0; i< titles.length; i++) {
            this.newStoryNode( {title: titles[i]} )
        }
    }
}

/**
 * A single text-option set.
*/
class Leaf {
    passage: string
    choices: Array<string>
    constructor(passage: string, choices: Array<string>) {
        this.passage = passage
        this.choices = choices
    }
}

interface SequenceOptions {
    title: string,
    passages?: Array<string>,
    defaultChoice?: string
}
/**
 * A series of ordered passages of text, each only being connected to the next without branching.
*/
class Sequence extends GraphNode {
    leaves: Array<Leaf> = []
    story: StoryManager
    constructor (opts: SequenceOptions, story: StoryManager) {
        super(opts.title)
        let passages = opts.passages ? opts.passages : []
        let defaultChoice = opts.defaultChoice ? opts.defaultChoice : ''
        this.story = story
        this.addBatchPage(passages, defaultChoice)
    }
    get length() {
        return this.leaves.length
    }
    addPage(passage: string, choice: string) {
        this.leaves.push(new Leaf(passage, [choice]))
    }
    addBatchPage(passages: Array<string>, defaultChoice: string) {
        for (let i=0; i < passages.length; i++) {
            this.leaves.push(new Leaf(passages[i], [defaultChoice]))
        }
    }
    link(node: GraphNode) {
        this.connections = {[node.index]: node}
    }
    page(number: number): Leaf {
        return this.leaves[number]
    }
}

type NodeTitle = string

interface StoryNodeOptions {
    title: NodeTitle,
    passage?: string,
    choices?: Array<[string, NodeTitle]>
}

/**
 * A single page with multiple options; which connects to multiple branches.
*/
class StoryNode extends GraphNode {
    leaf: Leaf
    story: StoryManager
    constructor (opts: StoryNodeOptions, story: StoryManager) {
        super(opts.title)
        let passage = opts.passage ? opts.passage : ''
        let choices= opts.choices ? opts.choices : []
        this.story = story
        this.leaf = new Leaf(passage,[])
        for (let i=0; i < choices.length; i++) {
            let [choice, destination] = choices[i]
            this.addOption(choice, destination)
        }
        
    }
    addOption(choice: string, destination: string) {
        let dest = this.story.get(destination)
        this.leaf.choices.push(choice)
        this.link(dest)
    }
    set text(passage: string) {
        this.leaf.passage = passage
    }
    get options() {
        let opts: Array<[string, GraphNode]> = []
        for (let i=0; i < this.leaf.choices.length; i++) {
            let optionText = this.leaf.choices[i]
            let optionDestination = this.connections[i]
            opts.push( [optionText, optionDestination] )
        }
        return opts
    }
    page(number: number): Leaf {
        return this.leaf
    }
}

let labyrinth = new StoryManager('intro')
labyrinth.populateSequences( ['intro','REntry','LEntry','candleAnte','castRunes','LeaveAnte','moveOnAnte','enterProper','checkFleeing','investigateFleeing','carryOnFleeing','LProper','BridgeWall','MossyCorner','Watching','WatchingBlink','WatchingReturn','ApproachWall','Lines','LinesTakeCandle','LinesLeaveCandle','LeaveLines','LeaveWall','CarryOnWall','Pressing'] )
labyrinth.populateStoryNodes( ['enter','ante','finishCandleAnte','readRunes','inventory','obelisk','LabyrinthProper','Fleeing','turnFleeing','runFleeing','chamberFleeing','NobodyWall','WatchingNode','Wall','SqueezeWall','LinesCandleNode'] )
labyrinth.loadConnections( {
    'intro': ['enter'],
    'enter': ['LEntry','REntry'],
    'REntry': ['ante'],
    'LEntry': ['ante'],
    'ante': ['obelisk','inventory','moveOnAnte'],
    'obelisk': ['inventory','moveOnAnte'],
    'inventory': ['castRunes','candleAnte','obelisk','moveOnAnte'],
    'candleAnte': ['finishCandleAnte'],
    'finishCandleAnte': ['moveOnAnte'],
} )
/*
labyrinth.loadText( {
    'intro': ['The ice',
        'rises above',
        'stone',
        'boundaries',
        'wait at the gate']
    'enter': ['']
} )

helpers.generateOptionList( {'1-4': 'next', '5': 'enter'} )
    => returns ['next','next','next','next','enter']
helpers.capitalize( ['next','next','next','next','enter'] )

labyrinth.loadOptionText( {
    'intro': ['Next','Next','Next','Next','Enter'],
    'enter': ['Left','Right']
} )
Same input, different response: for sequence, 
list of options becomes one per page, 
for storynode,
list of options becomes linked to each connection.
In general, loading in option text overwrites previous entry,
doesn't add onto it.

at runtime:
initialize
describe connections
set text
set options

in game loop:
modify connections
modify options

request next page
*/
