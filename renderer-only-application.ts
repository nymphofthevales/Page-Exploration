

//The classes and functions forming the core of the application.
import { StoryRenderer } from "./scripts/StoryRenderer.js" 
import { prepareStoryInstance } from "./scripts/application_actions.js"

//The story file to read.
const storyFileName: string | undefined = "new"
const storyTitle: string | undefined = "new"
const existingRootNode: string | undefined = undefined; //The title of the first node in the story.

//Read the story from file, setup the renderer, and render the root node for the reader.
let currentStory = prepareStoryInstance(storyFileName, existingRootNode);
let renderer = new StoryRenderer(currentStory, storyTitle);
renderer.render(); 

