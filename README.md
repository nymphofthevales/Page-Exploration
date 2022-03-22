# Page-Exploration
<p>A library for building and managing progress through a branching or nonlinear story. Made as a rebuilt game logic for my game Keeper of the Labyrinth.</p>

<p>Based on a Graph of interconnected nodes. Defines classes for a Graph, Directed Graph, and Graph Node, 
with properties and methods to define and destroy connections between them, easily index the graph for a given node, insert new nodes, etc.</p>
<p>Building on top of the Graph structure, defines a generalized Story Manager which contains the scenes in a story as nodes in the graph, of two types:
Sequences, and StoryNodes.</p>
<p>Sequences allow an easy implementation of one-after-another pages of text, 
each connected to the next (a linear part, normally linked to a Story Node at its terminus).</p>
<p>StoryNodes hold a single page of text with multiple connections (a nonlinear point, leading to multiple other Sequences or StoryNodes).</p>
<p>Can intake a human-readable adjacency list to define connections between nodes, as well as for defining text content.
In future, will read in a .JSON file containing all story data, making defining a nonlinear story painless.</p>

<p>Will be capable of injecting story text and option selections for connected pages into given HTML elements, 
as a robust back end for any nonlinear text-based game.</p>
