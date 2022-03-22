type NodeIndex = string
type AdjacencyList = { [key: NodeIndex]: Array<NodeIndex> }

/**
 * A data structure for representing any set of interconnected nodes.
*/
class Graph {
    nodes: Map<any,GraphNode> = new Map()
    constructor () {
    }
    /**
     * Returns the node at the specified index if it exists, undefined if it doesn't.
    */
    get(index: NodeIndex): GraphNode {
        let node = this.nodes.get(index)
        if (!node) {
            throw new Error("Graph node not defined at index.");
        }
        return node
    }
    /**
     * Returns the node at the specified index, or initializes and returns a new node with that index if it doesn't.
    */
    safeGet(index: NodeIndex): GraphNode {
        let node = this.nodes.get(index)
        if (!node) {
            node = this.newNode(index)
        }
        return node
    }
    /**
     * Insert an already initialized node.
    */
    add(node: GraphNode): GraphNode {
        let index = node.index
        this.nodes.set( index, node )
        return this.get(index)
    }
    remove(index: string) {
        this.nodes.delete(index)
    }
    /**
     * Initialize a new node in the graph.
    */
    newNode(index: string): GraphNode {
        index = this.checkFalsyIndex(index)
        this.nodes.set( index, new GraphNode(index) )
        return this.get(index)
    }
    /**
     * Initialize multiple nodes at once by providing a list of names.
     * @example ['a','b','c','d','e','f']
    */
    newNodes(indices:Array<NodeIndex> = []) {
        for (let i=0; i < indices.length; i++) {
            this.newNode(indices[i])
        }
    }
    checkFalsyIndex(index: string | undefined): string {
        if (!index) {
            index = (this.nodes.size + 1).toString()
        }
        return index
    }
    link(a: string, b: string) {
        let node1 = this.get(a)
        let node2 = this.get(b)
        node1.link(node2)
        node2.link(node1)
    }
    /**
     * Takes an object mapping out the neighbours of nodes in the graph, and sets up those connections. 
     * @example {
            'a': ['b','c','d','e'],
            'b': ['c','d'],
            'c': ['e'],
            'd': ['a','b','e'],
            'e': []
        }
    */
    loadConnections(adjacencyList: AdjacencyList) {
        for (let nodeIndex in adjacencyList) {
            let connections = adjacencyList[nodeIndex]
            let node = this.get(nodeIndex)
            for (let i=0; i<connections.length; i++) {
                if (!node.connections.hasOwnProperty(connections[i])) {
                    let connectedNode = this.get(connections[i])
                    node.link(connectedNode)
                }
            }
        }
        return this.nodes
    }
}

/**
 * A node in a graph. Can be connected to other nodes.
*/
class GraphNode {
    index: string
    connections: { [key: string]: GraphNode}  = {}
    constructor (index: string) {
        this.index = index
    }
    link(node: GraphNode) {
        this.connections[node.index] = node
    }
    unlink(node: GraphNode) {
        delete this.connections[node.index]
    }
}


/**
 * A 'directed' graph, with one-way connections by default.
 */
class DiGraph extends Graph {
    constructor () {
        super()
    }
    link(origin: string, destination: string) {
        let o = this.get(origin)
        let d = this.get(destination)
        o.link(d)
    }
}