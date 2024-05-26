/*

parameters and definitions for the view elements

To customize the project, change:
- topic names
- topic colors
- node sizes
- link colors

*/


// View Parameters
// Specify the chart’s dimensions.
const chartWidth = 1800;
const chartHeight = 900;
let nextId = 0;

// Set the description window dimensions and offsets
const descripWidth = 600;
const descripHeight = 600;
const descripOffsetX = 10; // Offset the description window horizontally
const descripOffsetY = -100; // Offset the description window vertically

// Set the topic names
const topic1Name = "Technical"; // main topic
const topic2Name = "Research"; // main topic
const topic3Name = "Business"; // main topic
const topic4Name = "Authors"; // supporting topic
const topic5Name = "Locations"; // supporting topic
const topic6Name = "Flairs"; // supporting topic

// Set the colors for different node types
const topic1Color = "#1F456E"; // topic1 = technical
const topic2Color = "#1034A6"; // topic2 = research
const topic3Color = "#63C5DA"; // topic3 = business
const topic4Color = "#ff924c";
const topic5Color = "#ffca3a";
const topic6Color = "#ff595e";
const otherColor = "#a3a3a3";

// Set the node sizes
const topicNodeSize = 13; // topics
const hoveredTopicNodeSize = 16;
const backgroundNodeSize = 10; // locations and Makers
const hoveredBackgroundNodeSize = 13;
const flairNodeSize = 6; // flairs
const hoveredFlairNodeSize = 8;

// Set the colors for different link groups
const topic4LinkColor = topic4Color;
const topic5LinkColor = topic5Color;
const topic6LinkColor = topic6Color;
const otherLinkColor = otherColor;

// Set node and link flair styles
const nodeNormalOpacity = 1;
const nodeDisconnectedOpacity = 0.1;
const linkNormalOpacity = 0.4;
const linkNormalWidth = 2;
const linkDisconnectedOpacity = 0.1;
const linkConnectedOpacity = 0.7;
const linkConnectedWidth = 3;

// Set node label display extent
const nodeLabelDisplayExtent = 1.8;

// Set toggles
let descripToggle = false;
let lastClickedButton = null;

// SVG container, including svg, rect, nodeGraph, linkGraph
const svg = d3.create("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("viewBox", [-chartWidth / 2, -chartHeight / 2, chartWidth, chartHeight])
    .attr("style", "max-width: 100%; height: auto; position: absolute; top: 40; left: 60;")


svg.append("rect")
    .attr("x", -chartWidth / 2)
    .attr("y", -chartHeight / 2)
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("fill", "#fff"); // Change background color to black

let linkGraph = svg.append("g")
    .attr("stroke-width", linkNormalWidth)
    .attr("stroke-opacity", linkNormalOpacity)
    .selectAll("line")
    .data([{}])

let nodeGraph = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.6)
    .selectAll("circle")
    .data([{}])
    .join("circle")
    .attr("stroke-width", 0.6)
    .attr("r", 5)
    .attr("fill", "#000");

let nodeLabels = svg.append("g")
    .selectAll("text")

const descripWindow = d3.select("body")
    .append("div")
    .attr("window-name", null)
    .attr("window-url", null)
    .attr("window-type", null)
    .attr("window-description", null)
    .attr("window-author", null)
    .attr("window-location", null)
    .attr("window-flair", null)
    .style("position", "absolute")
    .style("display", "none")
    .style("width", `${descripWidth}px`)
    .style("height", `${descripHeight}px`)
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("background-color", "#fff")
    .style("z-index", "100")

const descripContent = descripWindow.append("div")
    .style("padding", "10px")
    .style("word-wrap", "break-word")
    .style("max-width", "100%") // Set the maximum width to 100%
    .style("max-height", `${descripHeight - 60}px`) // Subtract the height of the buttons from descripHeight
    .style("overflow", "auto") // Enable scrolling if content overflows
    .style("z-index", "100");

const editButton = descripWindow.append("button")
    .text("Edit")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .style("margin-top", "10px")
    .on("click", () => {
        saveButton.style("display", "inline-block")
        backButton.style("display", "inline-block")
        updateWindowDisplay("edit");
    });

const deleteButton = descripWindow.append("button")
    .text("Delete")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        if (window.confirm("Are you sure you want to delete the node?")) {
            const targetNodeName = descripWindow.attr('window-name');
            // Delete the node and its links
            data.links = data.links.filter(link => link.source.name !== targetNodeName && link.target.name !== targetNodeName);
            data.nodes = data.nodes.filter(node => node.name !== targetNodeName);
            // Update the graph
            updateLinkGraph(data.links);
            updateNodeGraph(data.nodes);
            updateNodeLabels(data.nodes);
            updateSimulation(data.nodes, data.links);
            simulation.restart();
            descripWindow.style("display", "none");
            // Update the local storage with updated data
            updateLocalStorage();

        }
    })

const closeButton = descripWindow.append("button")
    .text("Close")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        descripWindow.style("display", "none");
    });

const saveButton = descripWindow.append("button")
    .text("Save")
    .style("display", "none")
    .style("margin-left", "30px")
    .on("click", () => {
        const targetNode = data.nodes.find(node => node.name == descripWindow.attr('window-name'));
        if (targetNode) {
            // Update nodes and links
            updateNodeData(targetNode);
            updateLinkData(targetNode);

            // Update the graph
            updateLinkGraph(data.links);
            updateNodeGraph(data.nodes);
            updateNodeLabels(data.nodes);
            updateFlairButtons(data.nodes.filter(d => d.type === "Flairs"));
            updateSimulation(data.nodes, data.links);
            simulation.restart();

            // Update the window attributes
            updateWindowAttr(targetNode);
            updateWindowDisplay("edit");

            // Update the local storage with updated data
            updateLocalStorage();
        }
    });

const backButton = descripWindow.append("button")
    .text("Back")
    .style("display", "none")
    .style("margin-left", "10px")
    .on("click", () => {
        updateWindowDisplay("preview");
        saveButton.style("display", "none")
        backButton.style("display", "none")
    });

// Flair button container, including flair buttons, clear button, and create button
const flairButtonsContainer = d3.select("body")
    .insert("block", "svg")
    .style("position", "fixed") // Set the position to fixed
    .style("pointer-events", "none")
    .style("top", "0")
    .style("left", "0")
    .style("width", `${chartWidth * 0.5}px`) // Set the width to 60% of chartWidth
    .style("height", `${chartHeight}px`)
    .style("z-index", "999");

let flairButtons = flairButtonsContainer.selectAll("button")

const miscButtonsContainer = d3.select("body")
    .insert("block", "svg")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("top", "0")
    .style("left", `${chartWidth * 0.6}px`) // Set the left position to 60% of chartWidth
    .style("width", `${chartWidth * 0.4}px`) // Set the width to 40% of chartWidth
    .style("height", `${chartHeight}px`)
    .style("z-index", "999");

const downloadButton = miscButtonsContainer.append("button")
    .text("Download Data")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => { downloadJSON() });

const createButton = miscButtonsContainer.append("button")
    .text("Create New Node")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => {
        addNodeWindow.style("display", "block");
        addNodeContent();
    });

const addNodeWindow = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("width", "800px")
    .style("height", "800px")
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("background-color", "#fff")
    .style("z-index", "100")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background-color", "#fff")
    .style("z-index", "200");

const newNodeContent = addNodeWindow.append("div")
    .style("padding", "10px")
    .style("word-wrap", "break-word")
    .style("max-width", "100%") // Set the maximum width to 100%
    .style("max-height", "740px")
    .style("z-index", "200")
    .style("overflow", "auto");

const addNodeButton = addNodeWindow.append("button")
    .text("Add Node")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .style("margin-top", "10px")
    .on("click", () => {
        updateNodeData(null);
        updateLinkData(null);
        updateLinkGraph(data.links);
        updateNodeGraph(data.nodes);
        updateNodeLabels(data.nodes);
        updateFlairButtons(data.nodes.filter(d => d.type === "Flairs"));
        updateSimulation(data.nodes, data.links);
        simulation.restart();
        addNodeWindow.style("display", "none");
        updateLocalStorage();
    });

const addNodeCancelButton = addNodeWindow.append("button")
    .text("Cancel")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        addNodeWindow.style("display", "none");
    });

const clearButton = miscButtonsContainer.append("button")
    .text("Clear Filter")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => {
        clearFlairFilter();
    });

const changeFlairButton = miscButtonsContainer.append("button")
    .text("Change Flair")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => {

        if (lastClickedButton !== null) {
            const newFlairName = window.prompt("Enter the new flair name for the node '" + lastClickedButton + "':");
            if (newFlairName && newFlairName.length > 0) {
                // Update the node and its links
                data.nodes.find(node => node.name === lastClickedButton).name = newFlairName;
                data.links.forEach(link => {
                    if (link.source.name === lastClickedButton) {
                        link.source.name = newFlairName;
                    }
                    if (link.target.name === lastClickedButton) {
                        link.target.name = newFlairName;
                    }
                });
                // Update the graph
                updateLinkGraph(data.links);
                updateNodeGraph(data.nodes);
                updateNodeLabels(data.nodes);
                updateFlairButtons(data.nodes.filter(d => d.type === "Flairs"));
                updateSimulation(data.nodes, data.links);
                simulation.restart();
                // Clear highlighting of the flair button
                clearFlairFilter();
                // Update the local storage with updated data
                updateLocalStorage();
            }
        }
    });

const deleteFlairButton = miscButtonsContainer.append("button")
    .text("Delete Flair")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => {
        if (lastClickedButton && window.confirm("Are you sure you want to delete the node '" + lastClickedButton + "'?")) {
            // Delete the node and its links
            data.links = data.links.filter(link => link.source.name !== lastClickedButton && link.target.name !== lastClickedButton);
            data.nodes = data.nodes.filter(node => node.name !== lastClickedButton);
            // Update the graph
            updateLinkGraph(data.links);
            updateNodeGraph(data.nodes);
            updateNodeLabels(data.nodes);
            updateFlairButtons(data.nodes.filter(d => d.type === "Flairs"));
            updateSimulation(data.nodes, data.links);
            simulation.restart();
            // Clear highlighting of the flair button
            clearFlairFilter();
            // Update the local storage with updated data
            updateLocalStorage();
        }
    });

const searchBox = miscButtonsContainer.append("input")
    .attr("type", "text")
    .attr("placeholder", "Search for Node")
    .attr("id", "searchInput") // Set the element ID to "searchInput"
    .style("display", "block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto");

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.toLowerCase();
    const filteredNodes = nodeGraph.filter(nodeData => nodeData.name.toLowerCase().includes(searchText));
    const unfilteredNodes = nodeGraph.filter(nodeData => !nodeData.name.toLowerCase().includes(searchText));
    filteredNodes.attr("opacity", nodeNormalOpacity);
    unfilteredNodes.attr("opacity", nodeDisconnectedOpacity);
});