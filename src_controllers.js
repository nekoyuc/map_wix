/*

Functions for the controller

To customize the project, match...
- local storage name
- downloadJSON function file name
...with the names in the load_data.html file

*/



function createLinkGraph() {
    let linkGraph = svg.append("g")
        .selectAll("line")
        .join("line")
    return linkGraph;
}

function updateNodeData(node) {
    if (node !== null) {
        const oldNodeName = node.name;
        node.name = document.getElementById("name-input").value;
        node.type = document.getElementById("type-input").value;
        node.description = document.getElementById("description-input").value;
        node.url = document.getElementById("url-input").value;
        /*
        if (oldNodeName === node.name) return;
        data.links.forEach(link => {
            if (link.source.name === oldNodeName) {
                link.source.name = node.name;
            } else if (link.target.name === oldNodeName) {
                link.target.name = node.name
            }
        });
        */
    }
    else {
        data.nodes.push({
            "name": document.getElementById("new-name-input").value,
            "type": document.getElementById("new-type-input").value,
            "description": document.getElementById("new-description-input").value,
            "url": document.getElementById("new-url-input").value
        });
    }
}

function updateLinkData(node) {
    const newAuthorNames = document.getElementById(node === null ? "new-authors-input" : "authors-input").value.split(", ");
    const newLocationNames = document.getElementById(node === null ? "new-locations-input" : "locations-input").value.split(", ");
    const newFlairNames = document.getElementById(node === null ? "new-flairs-input" : "flairs-input").value.split(", ");

    const nodeType = (node === null ? document.getElementById("new-type-input").value : document.getElementById("type-input").value);

    // If this node already exists and is/becomes an author, remove all the links that are from the wrong group
    if (nodeType === topic4Name && node !== null) {
        data.links = data.links.filter(link => !((link.source.name === node.name && link.group !== "___is the author of___") || (link.target.name === node.name && link.group !== "___is the flair of___")));
    }

    // If this node already exists and is/becomes a location, remove all the links that are from the wrong group
    else if (nodeType === topic5Name && node !== null) {
        data.links = data.links.filter(link => !((link.source.name === node.name && link.group !== "___is the location of___") || (link.target.name === node.name && link.group !== "___is the flair of___")));
    }

    // If this node is a project
    else if (nodeType == topic1Name || nodeType == topic2Name || nodeType == topic3Name) {
        // Remove all existing links
        if (node !== null) { data.links = data.links.filter(link => !(link.source.name === node.name || link.target.name === node.name)) };
        targetNode = (node === null ? data.nodes.find(node => node.name === document.getElementById("new-name-input").value) : node);

        updateProjectLinks(newAuthorNames, topic4Name, targetNode)
        updateProjectLinks(newLocationNames, topic5Name, targetNode)
        updateProjectLinks(newFlairNames, topic6Name, targetNode)
    } else return;
};

function updateProjectLinks(list, type, targetNode) {
    list.forEach(name => {
        if (name.trim() === "") return;
        const newNode = data.nodes.find(node => node.name === name.trim() && node.type === type);

        // If the node already exists, create a new link
        if (newNode) {
            data.links.push({
                "source": newNode,
                "target": targetNode,
                "group": type === topic4Name ? "___is the author of___" : type === topic5Name ? "___is the location of___" : "___is the flair of___"
            })
        }

        // If the node does not exist, create a new node and a new link
        else if (window.confirm(`The ${type === topic4Name ? "author" : type === topic5Name ? "location" : "flair"} "${name.trim()}" does not exist. Do you want to create a new ${type === topic4Name ? "author" : type === topic5Name ? "location" : "flair"}?`)) {
            data.nodes.push({
                "name": name.trim(),
                "type": type,
                "description": "",
                "url": ""
            });
            data.links.push({
                "source": data.nodes.find(node => node.name === name.trim() && node.type === type),
                "target": targetNode,
                "group": type === topic4Name ? "___is the author of___" : type === topic5Name ? "___is the location of___" : "___is the flair of___"
            });
        }
    })
}

function updateLocalStorage() {
    const newData = {
        nodes: data.nodes.map(({ id, name, type, description, url }) => ({ id, name, type, description, url })),
        links: data.links.map(({ source, target, group }) => ({ source: source.name, target: target.name, group }))
    };
    localStorage.setItem("Refactorable_data_local", JSON.stringify(newData));
}

function downloadJSON() {
    const filteredNodes = data.nodes.map(({ id, name, type, description, url }) => ({ id, name, type, description, url }));
    const filteredLinks = data.links.map(({ source, target, group }) => ({ source: source.name, target: target.name, group }));

    const filteredData = {
        nodes: filteredNodes,
        links: filteredLinks
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "Refactorable_data.json"); // Set the filename as "Refactorable_data.json"
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function updateLinkGraph(links) {
    linkGraph = linkGraph.data(links).join("line");
    linkGraph.enter().append("line").exit().remove()
    //linkGraph.attr("stroke-width", linkNormalWidth)
    //.attr("stroke-opacity", linkNormalOpacity)
    linkGraph.attr("stroke", d => {
        if (d.group === "___is the author of___") {
            return topic4LinkColor;
        } else if (d.group === "___is the location of___") {
            return topic5LinkColor;
        } else if (d.group === "___is the flair of___") {
            return topic6LinkColor;
        } else {
            return otherLinkColor;
        }
    })
}

function updateNodeGraph(nodes) {
    nodeGraph = nodeGraph.data(nodes).join("circle");
    nodeGraph.enter().append("circle").exit().remove();
    //nodeGraph.attr("stroke", "#fff")
    //    .attr("stroke-width", 0.6)
    nodeGraph.attr("fill", d => {
        if (d.type === topic5Name) {
            return topic5Color;
        } else if (d.type === topic1Name) {
            return topic1Color
        } else if (d.type === topic6Name) {
            return topic6Color;
        } else if (d.type === topic4Name) {
            return topic4Color;
        } else if (d.type === topic2Name) {
            return topic2Color;
        } else if (d.type === topic3Name) {
            return topic3Color;
        } else {
            return otherColor;
        }
    }
    )
        .attr("r", d => d.type === topic6Name ? flairNodeSize : (d.type === topic1Name || d.type === topic2Name || d.type === topic3Name ? topicNodeSize : backgroundNodeSize))
        .call(drag(simulation))
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
}

function updateSimulation(nodes, links) {
    simulation = simulation.nodes(nodes)
        .force("link", d3.forceLink(links).id(d => d.name).distance(150).strength(1.5));
}

function updateNodeLabels(nodes) {
    nodeLabels = nodeLabels.data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.35em")
        .attr("font-size", d3.scaleLinear().domain([0, 1]).range([2, 4]).clamp(true)(1))
        //.attr("font-size", 20)
        .attr("font-family", "Futura Bk BT")
        .attr("font-weight", "bold")
        //.attr("fill", "#black") // Set the text color to white
        .text(d => d.name);
    //.style("display", "none")
}

function updateFlairButtons(nodes) {
    nodes.sort((a, b) => a.name.localeCompare(b.name)); // Sort nodes by name in alphabetical order
    flairButtons = flairButtons.data(nodes)
        .join("button")
        .text(d => d.name)
        .attr("flair-name", d => d.name) // Set the name attribute to the node name
        .style("pointer-events", "auto")
        .style("margin-top", "5px")
        .style("margin-left", "5px") // Move the buttons down by 10px
        .on("click", flairClick);
}

function flairClick(d) {
    nodeGraph.attr("opacity", nodeNormalOpacity);
    linkGraph.attr("stroke-opacity", linkNormalOpacity);
    linkGraph.attr("stroke-width", linkNormalWidth);

    // If the button is clicked again, clear the filter
    if (d3.select(this).attr("flair-name") === lastClickedButton) {
        lastClickedButton = null;
    } else {
        const connectingLinks = linkGraph.filter(linkData => linkData.source.name === d3.select(this).attr("flair-name") || linkData.target.name === d3.select(this).attr("flair-name"));
        connectingLinks.attr("stroke-opacity", linkConnectedOpacity);
        connectingLinks.attr("stroke-width", linkConnectedWidth);

        const disconnectedLinks = linkGraph.filter(linkData => linkData.source.name !== d3.select(this).attr("flair-name") && linkData.target.name !== d3.select(this).attr("flair-name"));
        disconnectedLinks.attr("stroke-opacity", linkDisconnectedOpacity);

        const disconnectedNodes = nodeGraph.filter(nodeData => {
            const connectedNodes = connectingLinks.data().flatMap(linkData => [linkData.source, linkData.target]);
            return !connectedNodes.some(connectedNode => connectedNode.name === nodeData.name);
        });
        disconnectedNodes.attr("opacity", nodeDisconnectedOpacity);

        // Update the last clicked button icon
        lastClickedButton = d3.select(this).attr("flair-name");
    }
}

function clearFlairFilter() {
    nodeGraph.attr("opacity", nodeNormalOpacity);
    linkGraph.attr("stroke-width", linkNormalWidth);
    linkGraph.attr("stroke-opacity", linkNormalOpacity);
    lastClickedButton = null;
}

const zoom = d3.zoom()
    .on("zoom", zoomed);

function zoomed(event) {
    const { transform } = event;
    //const mouseX = event.sourceEvent.clientX;
    //const mouseY = event.sourceEvent.clientY;
    const scale = transform.k;

    // Calculate the incremental translation using movementX and movementY
    const translateX = event.sourceEvent.movementX * (1 - scale) * 2 + parseFloat(svg.attr("data-translate-x") || 0);
    const translateY = event.sourceEvent.movementY * (1 - scale) * 2 + parseFloat(svg.attr("data-translate-y") || 0);

    svg.attr("transform", `translate(${translateX}, ${translateY}) scale(${scale})`);
    svg.attr("data-translate-x", translateX);
    svg.attr("data-translate-y", translateY);

    nodeLabels.style("display", d => transform.k >= nodeLabelDisplayExtent ? "block" : "none");
}

function updateWindowAttr(d) {
    descripWindow.attr("window-name", d.name);
    descripWindow.attr("window-url", d.url);
    descripWindow.attr("window-type", d.type);
    descripWindow.attr("window-description", d.description);

    const connectingLinks = linkGraph.filter(linkData => linkData.source.name === d.name || linkData.target.name === d.name);
    const connectedNodes = [...new Set(connectingLinks.data().flatMap(linkData => [linkData.source, linkData.target]))];

    if (d.type === topic1Name || d.type === topic2Name || d.type === topic3Name) {
        const authorNodes = connectedNodes.filter(nodeData => nodeData.type === topic4Name);
        const locationNodes = connectedNodes.filter(nodeData => nodeData.type === topic5Name);
        descripWindow.attr("window-author", authorNodes.map(nodeData => nodeData.name).join(", "));
        descripWindow.attr("window-location", locationNodes.map(nodeData => nodeData.name).join(", "));
    }
    else {
        descripWindow.attr("window-author", "");
        descripWindow.attr("window-location", "");
    }

    const flairNodes = connectedNodes.filter(nodeData => nodeData.type === topic6Name);
    descripWindow.attr("window-flair", flairNodes.map(nodeData => nodeData.name).join(", "));
}

function clearWindowAttr() {
    descripWindow.attr("window-name", null);
    descripWindow.attr("window-url", null);
    descripWindow.attr("window-type", null);
    descripWindow.attr("window-description", null);
    descripWindow.attr("window-author", null);
    descripWindow.attr("window-location", null);
    descripWindow.attr("window-flair", null);
}

function updateWindowDisplay(goal = "preview") {
    if (goal == "preview") {
        //    } else if (descripWindow.attr("data-source") == "preview") {
        displayWindowPreview();
    } else if (goal == "edit") {
        //    } else if (descripWindow.attr("data-source") == "edit") {
        displayWindowEdit();
    }
}

function displayWindowPreview() {
    // Set the description content to include "description"
    let descripContentHtml = `<strong style="font-family: Futura Bk BT;">Description:</strong> ${descripWindow.attr("window-description") ? `<span style="font-family: Futura Bk BT; white-space: pre-wrap;">${descripWindow.attr("window-description")}</span>` : ""}`;
    // Set the description content to include "url" attributes if "url" exists
    if (descripWindow.attr("window-url")) {
        descripContentHtml += `<br><strong style="font-family: Futura Bk BT;">URL:</strong> <a href="${descripWindow.attr("window-url")}" target="_blank" style="font-family: Futura Bk BT;">${descripWindow.attr("window-url")}</a>`;
        descripContentHtml += `<br><iframe src="${descripWindow.attr("window-url")}" width="100%" height=600px></iframe>`;
    }
    return descripContent.html(descripContentHtml);
}

function displayWindowEdit() {
    let descripContentHtml = `

    <strong style="font-family: Futura Bk BT;">Name:</strong> ${descripWindow.attr("window-name") ? `<span style="font-family: Futura Bk BT;">${descripWindow.attr("window-name")}</span>` : ""}
    <br><strong style="font-family: Futura Bk BT;">Type:</strong> ${descripWindow.attr("window-type") ? `<span style="font-family: Futura Bk BT;">${descripWindow.attr("window-type")}</span>` : ""}
    <br><strong style="font-family: Futura Bk BT;">Description:</strong> ${descripWindow.attr("window-description") ? `<span style="font-family: Futura Bk BT; white-space: pre-wrap;">${descripWindow.attr("window-description")}</span>` : ""}
    <br><strong style="font-family: Futura Bk BT;">URL:</strong> ${descripWindow.attr("window-url") ? `<span style="font-family: Futura Bk BT;">${descripWindow.attr("window-url")}</span>` : ""}

    <br><br><strong style="font-family: Futura Bk BT;">Author:</strong> ${descripWindow.attr("window-author") ? `<span style="font-family: Futura Bk BT;">${descripWindow.attr("window-author")}</span>` : ""}
    <br><strong style="font-family: Futura Bk BT;">Location:</strong> ${descripWindow.attr("window-location") ? `<span style="font-family: Futura Bk BT;">${descripWindow.attr("window-location")}</span>` : ""}
    <br><strong style="font-family: Futura Bk BT;">Flairs:</strong> ${descripWindow.attr("window-flair") ? `<span style="font-family: Futura Bk BT;">${descripWindow.attr("window-flair")}</span>` : ""}


    <br><br><br><strong style="font-family: Futura Bk BT;">Update name:</strong>
    <br><input type="text" id="name-input" value="${descripWindow.attr("window-name") ? descripWindow.attr("window-name") : ""}" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;">

    <br><br><strong style="font-family: Futura Bk BT;">Update type:</strong>
    <br><select id="type-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;">
        <option value="${topic1Name}" ${descripWindow.attr("window-type") === topic1Name ? "selected" : ""}>${topic1Name}</option>
        <option value="${topic2Name}" ${descripWindow.attr("window-type") === topic2Name ? "selected" : ""}>${topic2Name}</option>
        <option value="${topic3Name}" ${descripWindow.attr("window-type") === topic3Name ? "selected" : ""}>${topic3Name}</option>
        <option value="${topic4Name}" ${descripWindow.attr("window-type") === topic4Name ? "selected" : ""}>${topic4Name}</option>
        <option value="${topic5Name}" ${descripWindow.attr("window-type") === topic5Name ? "selected" : ""}>${topic5Name}</option>
        <option value="${topic6Name}" ${descripWindow.attr("window-type") === topic6Name ? "selected" : ""}>${topic6Name}</option>
    </select>

    <br><br><strong style="font-family: Futura Bk BT;">Update description:</strong>
    <br><textarea id="description-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 80%;">${descripWindow.attr("window-description") ? descripWindow.attr("window-description") : ""}</textarea>

    <br><br><strong style="font-family: Futura Bk BT;">Update URL:</strong>
    <br><textarea id="url-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 80%;">${descripWindow.attr("window-url") ? descripWindow.attr("window-url") : ""}</textarea>


    <br><br><br><strong style="font-family: Futura Bk BT;">Update author:</strong>
    <br><textarea id="authors-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;">${descripWindow.attr("window-author")}</textarea>

    <br><br><strong style="font-family: Futura Bk BT;">Update location:</strong>
    <br><textarea id="locations-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;">${descripWindow.attr("window-location")}</textarea>

    <br><br><strong style="font-family: Futura Bk BT;">Update flairs:</strong> (separate flairs with ",")
    <br><textarea id="flairs-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;">${descripWindow.attr("window-flair")}</textarea>
    `;
    return descripContent.html(descripContentHtml);
}

function addNodeContent() {
    let addNodeContentHtml = `
    <strong style="font-family: Futura Bk BT;">New name:</strong>
    <br><textarea id="new-name-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;"></textarea>

    <br><br><strong style="font-family: Futura Bk BT;">New type:</strong>
    <br><select id="new-type-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;">
        <option value="${topic1Name}">${topic1Name}</option>
        <option value="${topic2Name}">${topic2Name}</option>
        <option value="${topic3Name}">${topic3Name}</option>
    </select>
    
    <br><br><strong style="font-family: Futura Bk BT;">New description:</strong>
    <br><textarea id="new-description-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 80%;"></textarea>

    <br><br><strong style="font-family: Futura Bk BT;">New URL:</strong>
    <br><textarea id="new-url-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 80%;"></textarea>

    <br><br><br><strong style="font-family: Futura Bk BT;">New author:</strong>
    <br><textarea id="new-authors-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;"></textarea>

    <br><br><strong style="font-family: Futura Bk BT;">New location:</strong>
    <br><textarea id="new-locations-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;"></textarea>

    <br><br><strong style="font-family: Futura Bk BT;">New flairs:</strong> (separate flairs with ",")
    <br><textarea id="new-flairs-input" style="font-family: Futura Lt BT; line-height: 1.2; width: 40%;"></textarea>
    `;
    return newNodeContent.html(addNodeContentHtml);
}

function handleMouseOver(event, d) {
    descripToggle = false;
    updateWindowAttr(d);

    d3.select(this)
        .attr("r", d => d.type === topic6Name ? hoveredFlairNodeSize : (d.type === topic1Name || d.type === topic2Name || d.type === topic3Name ? hoveredTopicNodeSize : hoveredBackgroundNodeSize))
        .attr("fill", "#808080");

    if (d.type !== topic6Name) {
        updateWindowDisplay("preview")
        descripWindow.style("display", "block")
            .style("left", `${event.clientX + 30}px`)
            .style("top", `${event.clientY - descripHeight / 2}px`);
        saveButton.style("display", "none");
        backButton.style("display", "none");
    };
    simulation.stop(); // Pause the simulation
}

function handleMouseOut(event, d) {
    d3.select(this)
        .attr("r", d => d.type === topic6Name ? flairNodeSize : d.type === topic1Name || d.type === topic2Name || d.type === topic3Name ? topicNodeSize : backgroundNodeSize)
        .attr("fill", d => d.type === topic5Name ? topic5Color : d.type === topic1Name ? topic1Color : d.type === topic6Name ? topic6Color : d.type === topic4Name ? topic4Color : d.type === topic2Name ? topic2Color : d.type === topic3Name ? topic3Color : otherColor);

    simulation.restart(); // Resume the simulation

    if (!descripToggle) {
        descripWindow.style("display", "none");
    }
}
