# Page-Exploration
<p>A library for building and managing progress through a branching or nonlinear story. Made as a rebuilt game logic for my game Keeper of the Labyrinth.</p>

<p>Based on a graph of interconnected nodes. Defines classes for a <i>Graph</i>, <i>Directed Graph</i>, and <i>Graph Node</i>, 
with properties and methods to define and destroy connections between them, easily index the graph for a given node, insert new nodes, etc.</p>
<p>Defines a generalized <i>Story Manager</i> which contains the scenes in a story as nodes in the graph, of two types:
Sequences, and StoryNodes.</p>
<p align="center"><i>Sequences</i> allow an easy implementation of one-after-another pages of text, 
each connected to the next (a linear part, normally linked to a Story Node at its terminus).</p>
<p align="center"><i>StoryNodes</i> hold a single page of text with multiple connections (a nonlinear point, leading to multiple other Sequences or StoryNodes).</p>

<p>In future, will read in a .JSON file containing all story data and inject story text and option selections for connected pages into given HTML elements, 
as <strong>a robust back end for any nonlinear text-based game</strong>.</p>
