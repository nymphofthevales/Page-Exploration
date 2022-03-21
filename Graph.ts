


/**
 * A data structure for representing any set of interconnected nodes.
*/
export class Graph {
    nodes: Array<GraphNode> = []
    constructor () {
    }
    add(node: GraphNode) {
        this.nodes.push(node)
    }
    link(a: GraphNode, b: GraphNode) {
        a.link(b)
        b.link(a)
    }
}

/**
 * A node in a graph. Can be connected to other nodes.
*/
export class GraphNode {
    connections: Array<GraphNode> = []
    constructor () {
    }
    link(node: GraphNode) {
        this.connections.push(node)
    }
}

/**
 * A 'directed' graph, with one-way connections by default.
 */
export class DiGraph extends Graph {
    constructor () {
        super()
    }
    link(origin: GraphNode, destination: GraphNode) {
        origin.link(destination)
    }
}