
/**
 * A data structure for representing any set of interconnected nodes.
*/
class Graph {
    nodes: Map<any,GraphNode> = new Map()
    constructor () {
    }
    node(index: string): GraphNode {
        let node = this.nodes.get(index)
        if (!node) {
            node = this.newNode(index)
        }
        return node
    }
    add(node: GraphNode): GraphNode {
        let index = node.index
        this.nodes.set( index, node )
        return this.node(index)
    }
    /**
     * Initialize a new node in the graph.
    */
    newNode(index: string): GraphNode {
        index = this.checkFalsyIndex(index)
        this.nodes.set( index, new GraphNode(index) )
        return this.node(index)
    }
    /**
     * Initialize multiple nodes at once by providing a list of names.
    */
    newNodes(indices:Array<any> = []) {
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
        let node1 = this.node(a)
        let node2 = this.node(b)
        node1.link(node2)
        node2.link(node1)
    }
}

/**
 * A node in a graph. Can be connected to other nodes.
*/
class GraphNode {
    index: string
    connections: Array<GraphNode> = []
    constructor (index: string) {
        this.index = index
    }
    link(node: GraphNode) {
        this.connections.push(node)
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
        let o = this.node(origin)
        let d = this.node(destination)
        o.link(d)
    }
}