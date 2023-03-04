function getEvent(e) { return e || window.event; }

function app() {
	this.characterManager = new CharacterManager(document.getElementById("characterManager"));
	this.beastManager = new BeastManager(document.getElementById("beastManager"));
	this.itemManager = new ItemManager(document.getElementById("itemManager"));
	this.variableManager = new VariableManager(document.getElementById("variableManager"));
	this.viewManager = new ViewManager(document.getElementById("viewNodeManager"), this);
	this.templateManager = new NodeTemplateManager(document.getElementById("templateManager"));

	let dragPos = { node: null, elm: null, x1: 0, y1: 0, x2: 0, y2: 0 };
	let canvas = new web2d.canvas(document.getElementById("canvas"), 1.0, 1.0);
	let canvasAutoStop = true;
	let index = 0;
	let lastPageY = 0;
	let isolated = null;
	const NODE_WIDTH = 200;
	const NODE_HANDLE_HEIGHT = 24;
	const NODE_LINE_OFFSET = 10;
	const PROJECTS_FOLDER = "projects";
	const TEMP_FILE_NAME = "temp.json";
	const TEMP_META_FILE_NAME = "temp-meta.json";
	const META_FILE_NAME = "meta";
	let farthestX = 0;
	
	this.fileOptionsVisible = ko.observable(false);
	this.metaChanged = ko.observable(false);
	this.createNodeType = ko.observable("");
	this.nodes = ko.observableArray([]);
	this.characters = ko.observableArray([]);
	this.beasts = ko.observableArray([]);
	this.items = ko.observableArray([]);
	this.variables = ko.observableArray([]);
	this.nodeTemplates = ko.observableArray([]);
	this.name = ko.observable("");
	this.settingTo = null;
	this.view = ko.observable(null);
	this.nodeTypes = [];
	this.jumpStack = [];
	this.lastData = null;

	web2d.each(Node.typeMap, (key, val) => {
		this.nodeTypes.push(key);
	});

	this.importMeta = function(json) {
		let current = this.getMetaJson();
		if (current.name || current.characters.length || current.variables.length || current.nodeTemplates.length) {
			if (!confirm("You have existing metadata would you like to overwrite it?")) {
				return;
			}
		}

		if (json.characters) {
			this.characters(json.characters);
		}

		if (json.beasts) {
			this.beasts(json.beasts);
		}

		if (json.items) {
			this.items(json.items);
		}

		if (json.variables) {
			this.variables(json.variables);
		}

		if (json.nodeTemplates) {
			this.nodeTemplates(json.nodeTemplates);
		}

		alert("The metadata has been imported");
		this.metaChanged(false);
	};

	this.import = function(json) {
		this.lastData = json;
		this.name(json.name);

		if (this.nodes().length) {
			if (!confirm("Your current nodes will be deleted on importing of this file. Make sure to export the current nodes or they will be lost. Would you like to continue the import and delete the existing nodes?")) {
				return;
			}

			this.nodes.removeAll();
		}

		let i = 0;
		for (i = 0; i < json.nodes.length; i++) {
			this.initializeNode(Node.typeMap[json.nodes[i].type], json.nodes[i]);
		}

		// Now that we created the nodes, we need to go through and set the "to" on each
		for (i = 0; i < this.nodes().length; i++) {
			this.nodes()[i].initializeOuts(this.nodes());
		}

		web2d.canvasHelpers.start(canvas);
	};

	this.importJson = function(scope, event) {
		let input = event.target;

        let reader = new FileReader();
        reader.onload = () => {
			let json = JSON.parse(reader.result);

			if ("characters" in json) {
				this.importMeta(json);
			} else {
				if (!this.characters().length) {
					if (confirm("You have not imported any meta information, you should import your meta file first. Would you still like to continue loading the node information?")) {
						this.import(json);
					}
				} else {
					this.import(json);
				}
			}
		};
		
        reader.readAsText(input.files[0]);
		this.fileOptionsVisible(false);
	};

	this.jumpLoad = async function(scope) {
		let data = await web2d.http.get("view/json/" + scope.src.Value);
		if (data) {
			let hasReturn = false;
			console.log(data.nodes);
			for (let i = 0; i < data.nodes.length; i++) {
				if (data.nodes[i].type === "Return") {
					hasReturn = true;
					break;
				}
			}

			if (!hasReturn) {
				this.jumpStack.clear();
			} else if (this.lastData) {
				this.jumpStack.push(this.lastData);
			}

			this.import(data);
			window.scrollTo(0, 0);
			lastPageY = 0;
		}
	};

	this.returnLoad = async function(scope) {
		if (!this.jumpStack.length) {
			return;
		}

		this.import(this.jumpStack.pop());
	};

	this.getJson = function() {
		let sanitize = [];
		for (let i = 0; i < this.nodes().length; i++) {
			sanitize.push(this.nodes()[i].serialize());
		}

		return {
			name: this.name(),
			nodes: sanitize
		}
	};

	this.getMetaJson = function() {
		return {
			characters: this.characters(),
			beasts: this.beasts(),
			items: this.items(),
			variables: this.variables(),
			nodeTemplates: this.nodeTemplates()
		};
	};

	this.exportJson = function() {
		let info = this.getJson();
		var json = JSON.stringify(info);
		var blob = new Blob([json], {type: "application/json"});
		saveAs(blob, `${this.name()}.json`);
		this.fileOptionsVisible(false);
	};

	this.exportMetaJson = function() {
		let info = this.getMetaJson();
		var json = JSON.stringify(info);
		var blob = new Blob([json], {type: "application/json"});
		saveAs(blob, META_FILE_NAME);
		this.metaChanged(false);
		this.fileOptionsVisible(false);
	};

	this.newTemp = async function() {
		if (!confirm("Are you sure that you would like to start a new file?")) {
			return;
		}

		let folder = await web2d.storage.getFolder(PROJECTS_FOLDER);
		if (!folder) {
			window.location.reload();
			return;
		}

		await web2d.storage.deleteFile(folder, TEMP_FILE_NAME);
		this.nodes.removeAll();
		this.name("");

		web2d.canvasHelpers.start(canvas);

		if (confirm("Would you also like completely new meta data?")) {
			await web2d.storage.deleteFile(folder, TEMP_META_FILE_NAME);
			this.characters.removeAll();
			this.beasts.removeAll();
			this.items.removeAll();
			this.variables.removeAll();
			this.nodeTemplates.removeAll();
			this.metaChanged(false);
			this.name("start");
			//this.importMeta(await web2d.http.get("view/json/meta.json"));
		}

		this.fileOptionsVisible(false);
	}

	this.saveTemp = async function(anything) {
		web2d.canvasHelpers.start(canvas);
		canvasAutoStop = true;
		web2d.canvasHelpers.start(canvas);
		let folder = await web2d.storage.getFolder(PROJECTS_FOLDER);
		if (!folder) {
			folder = await web2d.storage.createFolder(PROJECTS_FOLDER);
		}

		await web2d.storage.writeFile(folder, TEMP_FILE_NAME, this.getJson());
		await web2d.storage.writeFile(folder, TEMP_META_FILE_NAME, this.getMetaJson());

		if (anything) {
			alert("Temporary data saved");
		}

		this.fileOptionsVisible(false);
	}

	this.initializeNode = function(type, existing) {
		let node = null;
		if (existing) {
			node = new type(existing, this);
			if (existing.id >= index) {
				index = existing.id + 1;
			}
		} else {
			node = new type(index++, this);
			node.x = window.scrollX + window.innerWidth * 0.5;
			node.y = window.scrollY + window.innerHeight * 0.5;
		}

		if (node.x > farthestX) {
			farthestX = node.x + NODE_WIDTH;
		}
		
		this.nodes.push(node);
		return node;
	};

	this.createNode = function(scope, evt, existing) {
		this.initializeNode(Node.typeMap[this.createNodeType()], existing);
	};

	this.nodeClick = function(elm, scope, e) {
		if (!this.settingTo || scope.outs.indexOf(this.settingTo) !== -1) {
			return;
		}

		this.settingTo.to(scope);
		this.settingTo = null;
		elm.style.borderColor = "black";
		this.saveTemp();
	};
	
	this.nodeMouseOver = function(elm, scope, e) {
		if (!this.settingTo || this.settingTo === scope) {
			return;
		}

		elm.style.borderColor = "red";
	};
	
	this.nodeMouseOut = function(elm, scope, e) {
		if (!this.settingTo || this.settingTo === scope) {
			return;
		}

		elm.style.borderColor = "black";
	};

	this.setTo = function(scope, e) {
		e = getEvent(e);
		if (scope.to()) {
			scope.to(null);
			web2d.canvasHelpers.start(canvas);
			this.saveTemp();
			return;
		}

		this.settingTo = scope;
	};

	this.breakTo = function(scope, e) {
		scope.to = [];
		web2d.canvasHelpers.start(canvas);
	};

	this.deleteNode = function(scope) {
		if (!confirm("Are you sure you wish to delete this node?")) {
			return;
		}

		for (let i = 0; i < this.nodes().length; i++) {
			let outs = this.nodes()[i].outs();

			for (let j = 0; j < outs.length; j++) {
				if (outs[j].to() === scope) {
					outs[j].to(null);
				}
			}
		}

		this.nodes.remove(scope);
		this.saveTemp();
	};

	this.makeTemplate = function(scope) {
		if (!confirm("Are you sure you would like to make this node into a template?")) {
			return;
		}

		let name = prompt("What would you like to name this template?");
		if (!name || !name.trim()) {
			return;
		}

		name = name.trim();

		let templates = this.nodeTemplates();
		for (let i = 0; i < templates.length; i++) {
			if (templates.name.toLowerCase() === name.toLowerCase()) {
				if (!confirm("A template with that name already exists, would you like to overwrite it?")) {
					return;
				}

				this.nodeTemplates.splice(i, 1);
				break;
			}
		}

		let info = scope.serialize();
		for (let i = 0; i < info.outs.length; i++) {
			info.outs[i] = null;
		}

		this.nodeTemplates.push({
			name: name,
			template: info
		});

		this.metaChanged(true);
	};

	this.createNodeFromTemplate = function(scope) {
		let info = scope.template;
		info.id = index++;
		info.x = window.scrollX + 64;
		info.y = window.scrollY + 64;
		this.initializeNode(Node.typeMap[scope.template.type], info);
	};

	this.deleteNodeTemplate = function(scope) {
		this.nodeTemplates.remove(scope);
		this.metaChanged(true);
	};

	this.dupeNode = function(scope) {
		let info = scope.serialize();
		info.id = index++;
		for (let i = 0; i < info.outs.length; i++) {
			info.outs[i] = null;
		}
		
		info.x = window.scrollX + 64;
		info.y = window.scrollY + 64;

		this.initializeNode(Node.typeMap[scope.type], info);
	};

	this.dragStart = function(scope, e) {
		e = getEvent(e);
		
		dragPos.node = scope;
		dragPos.elm = e.target;

		let inputX = e.clientX,
			inputY = e.clientY;

		// Get the initial offset
		if (e.touches) {
			inputX = e.touches[0].screenX;
			inputY = e.touches[0].screenY;
		}
		
		dragPos.x2 = inputX;
		dragPos.y2 = inputY;

		canvasAutoStop = false;
		this.isolate(scope);
		web2d.canvasHelpers.start(canvas);
	};

	this.drag = function(e) {
		if (dragPos.elm === null) {
			return;
		}
		
		e = getEvent(e);
		let target = dragPos.elm.parentNode;
		let inputX = e.clientX,
			inputY = e.clientY;

		// Get the initial offset
		if (e.touches) {
			inputX = e.touches[0].screenX;
			inputY = e.touches[0].screenY;
		}

		dragPos.x1 = dragPos.x2 - inputX;
		dragPos.y1 = dragPos.y2 - inputY;
		dragPos.x2 = inputX;
		dragPos.y2 = inputY;

		let x = (target.offsetTop - dragPos.y1);
		let y = (target.offsetLeft - dragPos.x1);

		if (x < 0) {
			x = 0;
		}

		if (y < 0) {
			y = 0;
		}

		target.style.top = x + "px";
	    target.style.left = y + "px";
		dragPos.node.x = parseInt(dragPos.elm.parentNode.style.left);
		dragPos.node.y = parseInt(dragPos.elm.parentNode.style.top);

		// If the node is outside of the bounds, then auto scroll
		let moveBox = NODE_HANDLE_HEIGHT * 3;
		let scrollX = window.innerWidth - dragPos.node.x - moveBox + window.scrollX;
		if (scrollX < 0) {
			scrollX *= 0.5;
			window.scrollTo(window.scrollX - scrollX, window.scrollY);
			dragPos.x1 += scrollX;
			dragPos.x2 += scrollX;
		} else if (scrollX + moveBox > window.innerWidth) {
			scrollX -= window.innerWidth - moveBox;
			scrollX *= 0.5;
			window.scrollTo(window.scrollX - scrollX, window.scrollY);
			dragPos.x1 += scrollX;
			dragPos.x2 += scrollX;
		}

		let scrollY = window.innerHeight - dragPos.node.y - moveBox + window.scrollY;
		if (scrollY < 0) {
			scrollY *= 0.5;
			window.scrollTo(window.scrollX, window.scrollY - scrollY);
			dragPos.y1 += scrollY;
			dragPos.y2 += scrollY;
		} else if (scrollY + moveBox > window.innerHeight) {
			scrollY -= window.innerHeight - moveBox;
			scrollY *= 0.5;
			window.scrollTo(window.scrollX, window.scrollY - scrollY);
			dragPos.y1 += scrollY;
			dragPos.y2 += scrollY;
		}
	};

	this.dragEnd = function(e) {
		if (!dragPos.elm) {
			return;
		}

		dragPos.node.x = parseInt(dragPos.elm.parentNode.style.left);
		dragPos.node.y = parseInt(dragPos.elm.parentNode.style.top);

		if (dragPos.node.x > farthestX) {
			farthestX = dragPos.node.x + NODE_WIDTH;
		}

		dragPos.elm = null;
		dragPos.node = null;
		isolated = null;
		web2d.canvasHelpers.start(canvas);
		this.saveTemp();
	};

	this.setPageName = function() {
		let name = prompt('Input a name for this page:');

		if (!name || !name.trim().length) {
			return;
		}

		name = name.trim();
		if (name === TEMP_FILE_NAME || name === TEMP_META_FILE_NAME || name === META_FILE_NAME) {
			alert("The specified name is reserved by the system, please try a different name");
		} else {
			this.name(name);
		}

		this.saveTemp();
	};

	this.renameCharacter = function(scope) {
		console.log(scope);
		let newName = prompt("What would you like to rename this character to?", scope.name);
		if (!newName || !newName.length) {
			alert("Invalid name specified");
			return;
		}

		scope.name = newName;
		
		// Splice and valueHasMutated are not calling refresh, so we are going to have to do
		// a "dirty" refresh by re-assigning the array
		let contents = this.characters();
		this.characters([]);
		this.characters(contents);
	};

	this.deleteCharacter = function(scope) {
		if (!confirm(`Are you sure you wish to delete the character: ${scope.name}?`)) {
			return;
		}

		this.characters.remove(scope);
		this.metaChanged(true);
		this.saveTemp();
	};

	this.renameBeast = function(scope) {
		console.log(scope);
		let newName = prompt("What would you like to rename this beast to?", scope.name);
		if (!newName || !newName.length) {
			alert("Invalid name specified");
			return;
		}

		scope.name = newName;
		
		// Splice and valueHasMutated are not calling refresh, so we are going to have to do
		// a "dirty" refresh by re-assigning the array
		let contents = this.beasts();
		this.beasts([]);
		this.beasts(contents);
	};

	this.deleteBeast = function(scope) {
		if (!confirm(`Are you sure you wish to delete the beast: ${scope.name}?`)) {
			return;
		}

		this.beasts.remove(scope);
		this.metaChanged(true);
		this.saveTemp();
	};

	this.renameItem = function(scope) {
		console.log(scope);
		let newName = prompt("What would you like to rename this beast to?", scope.name);
		if (!newName || !newName.length) {
			alert("Invalid name specified");
			return;
		}

		scope.name = newName;
		
		// Splice and valueHasMutated are not calling refresh, so we are going to have to do
		// a "dirty" refresh by re-assigning the array
		let contents = this.items();
		this.items([]);
		this.items(contents);
	};

	this.deleteItem = function(scope) {
		if (!confirm(`Are you sure you wish to delete the beast: ${scope.name}?`)) {
			return;
		}

		this.items.remove(scope);
		this.metaChanged(true);
		this.saveTemp();
	};

	this.deleteVariable = function(scope) {
		if (!confirm(`Are you sure you wish to delete the variable: ${scope.name}?`)) {
			return;
		}

		this.variables.remove(scope);
		this.saveTemp();
	};

	this.toggleFileOptions = function() {
		this.fileOptionsVisible(!this.fileOptionsVisible());
	};

	this.isolate = function(scope) {
		if (isolated === scope) {
			isolated = null;
		} else {
			isolated = scope;
		}
	};

	canvas.drawing.register(() => {
		for (let i = 0; i < this.nodes().length; i++) {
			if (!this.nodes()[i].outs().length) {
				continue;
			}

			let outs = this.nodes()[i].outs();
			for (let j = 0; j < outs.length; j++) {
				if (!outs[j].to()) {
					continue;
				}

				if (isolated && outs[j].to() !== isolated && this.nodes()[i] !== isolated) {
					continue;
				}

				let from = this.nodes()[i];
				let to = outs[j].to();
				let yOffset = ((j + 1) * 22);

				let startX = from.x + NODE_WIDTH,
					startY = (from.y + NODE_HANDLE_HEIGHT * 0.5) + yOffset,
					endX = to.x,
					endY = to.y + NODE_HANDLE_HEIGHT * 0.5,
					startOffset = NODE_LINE_OFFSET,
					endOffset = NODE_LINE_OFFSET;

				canvas.context.beginPath();
				canvas.context.lineWidth = 1;
				canvas.context.moveTo(startX, startY);
				canvas.context.lineTo(startX + startOffset, startY);

				// The node is not to the right of this node
				if (to.x < from.x + NODE_WIDTH) {
					canvas.context.lineTo(startX + startOffset, endY - NODE_HANDLE_HEIGHT);
					canvas.context.lineTo(endX - endOffset, endY - NODE_HANDLE_HEIGHT);
					canvas.context.lineTo(endX - endOffset, endY);
				} else {
					canvas.context.lineTo(endX - endOffset, endY);
				}
				
				canvas.context.lineTo(endX, endY);
				canvas.context.stroke();
			}
		}

		if (canvasAutoStop && this.nodes().length) {
			web2d.canvasHelpers.stop(canvas);
		}
	}, null);

	canvas.updating.register(() => {
		canvas.resize(document.body.scrollWidth, document.body.scrollHeight);
	}, null);

	document.addEventListener("mousemove", this.drag.bind(this));
	document.addEventListener("touchmove", this.drag.bind(this));
	document.addEventListener("mouseup", this.dragEnd.bind(this));
	document.addEventListener("touchend", this.dragEnd.bind(this));
	document.addEventListener("touchcancel", this.dragEnd.bind(this));
	document.addEventListener("wheel", (e) => {
		e = getEvent(e);

		// Allow the user to be able to still scroll in text areas that
		// are currently overflowed
		if (e.target.type === "textarea") {
			if (e.target.clientHeight < e.target.scrollHeight) {
				return;
			}
		}

		let toX = window.scrollX + (e.deltaY * 20);
		let fullWidth = document.body.scrollWidth - window.innerWidth;

		if (toX > fullWidth) {
			canvas.resize(toX + window.innerWidth, document.body.scrollHeight);
			web2d.canvasHelpers.start(canvas);
		} else if (e.deltaY < 0 && toX + window.innerWidth > farthestX) {
			canvas.resize(toX + window.innerWidth, document.body.scrollHeight);
			web2d.canvasHelpers.start(canvas);
		}

		window.scrollTo(toX, lastPageY);
		e.preventDefault();
		return false;
	});

	web2d.input.keyUp.register((key) => {
		// Escape key should close all manager windows
		if (key.keyCode === web2d.input.keys.Escape) {
			Manager._closeManagers();
		}
	}, this);

	(async () => {
		let folder = await web2d.storage.getFolder(PROJECTS_FOLDER);
		if (folder) {
			if (await web2d.storage.fileExists(folder, TEMP_META_FILE_NAME)) {
				this.importMeta(await web2d.storage.readFile(folder, TEMP_META_FILE_NAME));
			} else {
				this.name("start");
			}
			
			if (await web2d.storage.fileExists(folder, TEMP_FILE_NAME)) {
				this.import(await web2d.storage.readFile(folder, TEMP_FILE_NAME));
			}
		} else {
			this.name("start");
		}
	})();

	web2d.input.keyDown.register((key) => {
		if (key.keyCode === web2d.input.keys.Left || key.keyCode === web2d.input.keys.Right) {
			if (web2d.input.Ctrl && web2d.input.Alt) {
				let change = 10;
				if (key.keyCode === web2d.input.keys.Left) {
					change *= -1;
				}
	
				for (let i = 0; i < this.nodes().length; i++) {
					if (this.nodes()[i].x < web2d.input.mousePosition.x + window.scrollX) {
						continue;
					}

					this.nodes()[i].x += change;
					document.getElementById(`node-${this.nodes()[i].id}`).style.left = `${this.nodes()[i].x}px`;
				}

				web2d.canvasHelpers.start(canvas);
			}
		} else if (key.keyCode === web2d.input.keys.Up || key.keyCode === web2d.input.keys.Down) {
			if (web2d.input.Ctrl && web2d.input.Alt) {
				let change = 10;
				if (key.keyCode === web2d.input.keys.Up) {
					change *= -1;
				}
	
				for (let i = 0; i < this.nodes().length; i++) {
					if (this.nodes()[i].x > web2d.input.mousePosition.x + window.scrollX) {
						continue;
					}

					this.nodes()[i].y += change;
					document.getElementById(`node-${this.nodes()[i].id}`).style.top = `${this.nodes()[i].y}px`;
				}

				web2d.canvasHelpers.start(canvas);
			}
		}
	}, this);
}

ko.applyBindings(new app(), document.body);

window.onerror = (msg, url, linenumber) => {
	alert(`Error message: ${msg}\nURL:${url}\nLine Number: ${linenumber}`);
	return false;
};