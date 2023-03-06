import * as ko from "./knockout.js";
import { Manager, CharacterManager, BeastManager, ItemManager, VariableManager, ViewManager, NodeTemplateManager } from "./manager.js";
import { Canvas } from "./modules/canvas.js";
import { each } from "./modules/std.js";
import { CoreNode, NodeTypeMap, ValueType, Output } from "./node.js";
import { ArrayHelpers } from "./modules/std.js";
import { Input } from "./modules/input.js";
import { Storage } from "./modules/storage.js";
import { HTTP } from "./modules/http.js";

function getEvent(e) { return e || window.event; }

/**
 * @name saveAs
 * @function
 * @param {Blob} blob
 * @param {string} filename
 */

/**
 * @typedef DragPos
 * @property {number} x1
 * @property {number} y1
 * @property {number} x2
 * @property {number} y2
 * @property {CoreNode|null} node
 * @property {HTMLElement|null} elm
 * 
 */

/**
 * @typedef HoveringNode
 * @property {CoreNode} scope
 * @property {HTMLElement} elm
 */

/**
 * @typedef {Object} NodeTemplate
 * @property {string} name
 * @property {string} template
 */

/**
 * @typedef {Object} FileJSON
 * @property {string} name
 * @property {CoreNode[]} nodes
 */

/**
 * @typedef {Object} MetaJSON
 * @property {string[]} characters
 * @property {string[]} beasts
 * @property {string[]} items
 * @property {string[]} variables
 * @property {NodeTemplate[]} nodeTemplates
 */

/**
 * @typedef {Object} CharacterEntry
 * @property {string} name
 */

/**
 * @typedef {Object} BeastEntry
 * @property {string} name
 */

/**
 * @typedef {Object} ItemEntry
 * @property {string} name
 */

/**
 * @typedef {Object} VariableEntry
 * @property {string} name
 * @property {string} type
 */

export class EditorApplication {
	static get NODE_WIDTH() { return 200 };
	static get NODE_HANDLE_HEIGHT() { return 24 };
	static get NODE_LINE_OFFSET() { return 10 };
	static get PROJECTS_FOLDER() { return "projects" };
	static get TEMP_FILE_NAME() { return "temp.json" };
	static get TEMP_META_FILE_NAME() { return "temp-meta.json" };
	static get META_FILE_NAME() { return "meta" };

	/** @type {CharacterManager} */
	characterManager = new CharacterManager(document.getElementById("characterManager"));

	/** @type {BeastManager} */
	beastManager = new BeastManager(document.getElementById("beastManager"));

	/** @type {ItemManager} */
	itemManager = new ItemManager(document.getElementById("itemManager"));

	/** @type {VariableManager} */
	variableManager = new VariableManager(document.getElementById("variableManager"));

	/** @type {ViewManager} */
	viewManager = new ViewManager(document.getElementById("viewNodeManager"), this);

	/** @type {NodeTemplateManager} */
	templateManager = new NodeTemplateManager(document.getElementById("templateManager"));

	/** @type {Storage} */
	storage = new Storage();

	/** @type {KnockoutObservable<boolean>} */
	fileOptionsVisible = ko.observable(false);

	/** @type {KnockoutObservable<boolean>} */
	metaChanged = ko.observable(false);

	/** @type {KnockoutObservable<string>} */
	createNodeType = ko.observable("");

	/** @type {KnockoutObservableArray<CoreNode>} */
	nodes = ko.observableArray();

	/** @type {KnockoutObservableArray<CharacterEntry>} */
	characters = ko.observableArray();

	/** @type {KnockoutObservableArray<BeastEntry>} */
	beasts = ko.observableArray();

	/** @type {KnockoutObservableArray<ItemEntry>} */
	items = ko.observableArray();

	// TODO:  Is this the correct type?
	/** @type {KnockoutObservableArray<VariableEntry>} */
	variables = ko.observableArray();

	// TODO:  Is this the correct type?
	/** @type {KnockoutObservableArray<NodeTemplate>} */
	nodeTemplates = ko.observableArray();

	/** @type {KnockoutObservable<string>} */
	name = ko.observable("");
	
	/** @type {CoreNode|null} */
	pendingSelectNode = null;
	
	/** @type {ValueType|null} */
	pendingSelectNodeOption = null;
	
	/** @type {HoveringNode|null} */
	hoveringNode = null;

	/** @type {Output|null} */
	settingTo = null;

	/** @type {string[]} */
	nodeTypes = [];
	
	// TODO:  This and lastData should be typedefs
	/** @type {JSON[]} */
	jumpStack = [];
	
	/** @type {JSON|null} */
	lastData = null;

	/** @type {Canvas} */
	#canvas;

	/** @type {DragPos} */
	#dragPos = { node: null, elm: null, x1: 0, y1: 0, x2: 0, y2: 0 };

	/** @type {boolean} */
	#canvasAutoStop = true;

	/** @type {number} */
	#index = 0;

	/** @type {number} */
	#lastPageY = 0;
	
	/** @type {CoreNode|null} */
	#isolated = null;

	/** @type {number} */
	#farthestX = 0;

	constructor() {
		this.#canvas = new Canvas(document.getElementById("canvas"), 1.0, 1.0);

		each(NodeTypeMap, (key, val) => {
			this.nodeTypes.push(/** @type {string} */ (key));
		});

		this.#canvas.drawing.register(() => {
			for (let i = 0; i < this.nodes().length; i++) {
				if (!this.nodes()[i].outs().length)
					continue;
				let outs = this.nodes()[i].outs();
				for (let j = 0; j < outs.length; j++) {
					if (!outs[j].to())
						continue;
					if (this.#isolated && outs[j].to() !== this.#isolated && this.nodes()[i] !== this.#isolated)
						continue;
					let from = this.nodes()[i];
					let to = /** @type {CoreNode} */ (outs[j].to());
					let yOffset = ((j + 1) * 22);
					let startX = from.x + EditorApplication.NODE_WIDTH,
						startY = (from.y + EditorApplication.NODE_HANDLE_HEIGHT * 0.5) + yOffset,
						endX = to.x,
						endY = to.y + EditorApplication.NODE_HANDLE_HEIGHT * 0.5,
						startOffset = EditorApplication.NODE_LINE_OFFSET,
						endOffset = EditorApplication.NODE_LINE_OFFSET;
					let ctx = this.#canvas.context.Value;
					ctx.beginPath();
					ctx.lineWidth = 1;
					ctx.moveTo(startX, startY);
					ctx.lineTo(startX + startOffset, startY);
					// The node is not to the right of this node
					if (to.x < from.x + EditorApplication.NODE_WIDTH) {
						ctx.lineTo(startX + startOffset, endY - EditorApplication.NODE_HANDLE_HEIGHT);
						ctx.lineTo(endX - endOffset, endY - EditorApplication.NODE_HANDLE_HEIGHT);
						ctx.lineTo(endX - endOffset, endY);
					} else
						ctx.lineTo(endX - endOffset, endY);
					ctx.lineTo(endX, endY);
					ctx.stroke();
				}
			}
			if (this.#canvasAutoStop && this.nodes().length)
				Canvas.stop(this.#canvas);
		}, null);
	
		this.#canvas.updating.register(() => {
			this.#canvas.resize(document.body.scrollWidth, document.body.scrollHeight);
		}, null);
	
		// TODO:
		//document.addEventListener("mousemove", this.drag.bind(this));
		//document.addEventListener("touchmove", this.drag.bind(this));
		//document.addEventListener("mouseup", this.dragEnd.bind(this));
		//document.addEventListener("touchend", this.dragEnd.bind(this));
		//document.addEventListener("touchcancel", this.dragEnd.bind(this));
	
		Input.keyUp.register((key) => {
			// Escape key should close all manager windows
			if (key.keyCode === Input.keys.Escape)
				Manager.closeManagers();
		}, this);
	
		(async () => {
			let folder = await this.storage.getFolder(EditorApplication.PROJECTS_FOLDER);
			if (folder.HasValue) {
				if (await this.storage.fileExists(folder.Value, EditorApplication.TEMP_META_FILE_NAME))
					this.importMeta(await this.storage.readFile(folder.Value, EditorApplication.TEMP_META_FILE_NAME));
				else
					this.name("start");
				if (await this.storage.fileExists(folder.Value, EditorApplication.TEMP_FILE_NAME))
					this.import(await this.storage.readFile(folder.Value, EditorApplication.TEMP_FILE_NAME));
			} else
				this.name("start");
		})();
	
		Input.keyDown.register((key) => {
			if (key.keyCode == Input.keys.Escape) {
				this.cancelOutLink();
			} else if (key.keyCode == Input.keys.Backspace) {
				if (this.hoveringNode)
					this.deleteNode(this.hoveringNode.scope);
			} else if (key.keyCode === Input.keys.Left || key.keyCode === Input.keys.Right) {
				if (Input.Ctrl && Input.Alt) {
					let change = 10;
					if (key.keyCode === Input.keys.Left)
						change *= -1;
					for (let i = 0; i < this.nodes().length; i++) {
						if (this.nodes()[i].x < Input.mousePosition.x + window.scrollX)
							continue;
						this.nodes()[i].x += change;
						let n = document.getElementById(`node-${this.nodes()[i].id}`);
						if (n)
							n.style.left = `${this.nodes()[i].x}px`;
					}
					Canvas.start(this.#canvas);
				}
			} else if (key.keyCode === Input.keys.Up || key.keyCode === Input.keys.Down) {
				if (Input.Ctrl && Input.Alt) {
					let change = 10;
					if (key.keyCode === Input.keys.Up)
						change *= -1;
					for (let i = 0; i < this.nodes().length; i++) {
						if (this.nodes()[i].x < Input.mousePosition.x + window.scrollX)
							continue;
						this.nodes()[i].y += change;
						let n = document.getElementById(`node-${this.nodes()[i].id}`);
						if (n)
							n.style.top = `${this.nodes()[i].y}px`;
					}
					Canvas.start(this.#canvas);
				}
			}
		}, this);
	}

	importMeta(json) {
		let current = this.getMetaJson();
		if (current.characters.length || current.variables.length || current.nodeTemplates.length
			|| current.beasts.length || current.items.length)
		{
			if (!confirm("You have existing metadata would you like to overwrite it?"))
				return;
		}
		if (json.characters)
			this.characters(json.characters);
		if (json.beasts)
			this.beasts(json.beasts);
		if (json.items)
			this.items(json.items);
		if (json.variables)
			this.variables(json.variables);
		if (json.nodeTemplates)
			this.nodeTemplates(json.nodeTemplates);
		alert("The metadata has been imported");
		this.metaChanged(false);
	}

	import(json) {
		this.lastData = json;
		this.name(json.name);
		if (this.nodes().length) {
			if (!confirm("Your current nodes will be deleted on importing of this file. Make sure to export the current nodes or they will be lost. Would you like to continue the import and delete the existing nodes?")) {
				return;
			}
			this.nodes.removeAll();
		}
		let i = 0;
		for (i = 0; i < json.nodes.length; i++)
			this.initializeNode(NodeTypeMap[json.nodes[i].type], json.nodes[i]);
		// Now that we created the nodes, we need to go through and set the "to" on each
		for (i = 0; i < this.nodes().length; i++)
			this.nodes()[i].initializeOuts(this.nodes());
		Canvas.start(this.#canvas);
	}

	importJson(scope, event) {
		let input = event.target;
        let reader = new FileReader();
        reader.onload = () => {
			let json = JSON.parse(/** @type {string} */ (reader.result));
			if ("characters" in json)
				this.importMeta(json);
			else {
				if (!this.characters().length) {
					if (confirm("You have not imported any meta information, you should import your meta file first. Would you still like to continue loading the node information?")) {
						this.import(json);
					}
				} else
					this.import(json);
			}
		};
        reader.readAsText(input.files[0]);
		this.fileOptionsVisible(false);
	}

	nodeById(id) {
		let node = null;
		each(this.nodes, (key, val) => {
			if (val.id === id) {
				node = val;
				return false;
			}
		});
		return node;
	}

	async jumpLoad(scope) {
		let data = await HTTP.get("view/json/" + scope.src.Value);
		if (data) {
			let hasReturn = false;
			console.log(data.nodes);
			for (let i = 0; i < data.nodes.length; i++) {
				if (data.nodes[i].type === "Return") {
					hasReturn = true;
					break;
				}
			}
			if (!hasReturn)
				ArrayHelpers.clear(this.jumpStack);
			else if (this.lastData)
				this.jumpStack.push(this.lastData);
			this.import(data);
			window.scrollTo(0, 0);
			this.#lastPageY = 0;
		}
	}

	async returnLoad(scope) {
		if (!this.jumpStack.length)
			return;
		this.import(this.jumpStack.pop());
	}

	/**
	 * @returns {FileJSON}
	 */
	getJson() {
		let sanitize = [];
		for (let i = 0; i < this.nodes().length; i++)
			sanitize.push(this.nodes()[i].serialize());
		return {
			name: this.name(),
			nodes: sanitize
		}
	}

	/**
	 * @returns {MetaJSON}
	 */
	getMetaJson() {
		return {
			characters: this.characters(),
			beasts: this.beasts(),
			items: this.items(),
			variables: this.variables(),
			nodeTemplates: this.nodeTemplates()
		};
	}

	exportJson() {
		let info = this.getJson();
		var json = JSON.stringify(info);
		var blob = new Blob([json], {type: "application/json"});
		saveAs(blob, `${this.name()}.json`);
		this.fileOptionsVisible(false);
	}

	exportMetaJson() {
		let info = this.getMetaJson();
		var json = JSON.stringify(info);
		var blob = new Blob([json], {type: "application/json"});
		saveAs(blob, EditorApplication.META_FILE_NAME);
		this.metaChanged(false);
		this.fileOptionsVisible(false);
	}

	async newTemp() {
		if (!confirm("Are you sure that you would like to start a new file?"))
			return;
		let folder = await this.storage.getFolder(EditorApplication.PROJECTS_FOLDER);
		if (!folder.HasValue) {
			window.location.reload();
			return;
		}
		await this.storage.deleteFile(folder.Value, EditorApplication.TEMP_FILE_NAME);
		this.nodes.removeAll();
		this.name("");
		Canvas.start(this.#canvas);
		if (confirm("Would you also like completely new meta data?")) {
			await this.storage.deleteFile(folder.Value, EditorApplication.TEMP_META_FILE_NAME);
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

	async saveTemp(anything) {
		Canvas.start(this.#canvas);
		this.#canvasAutoStop = true;
		Canvas.start(this.#canvas);
		let folder = await this.storage.getFolder(EditorApplication.PROJECTS_FOLDER);
		if (!folder.HasValue)
			folder = await this.storage.createFolder(EditorApplication.PROJECTS_FOLDER);
		await this.storage.writeFile(folder.Value, EditorApplication.TEMP_FILE_NAME, this.getJson());
		await this.storage.writeFile(folder.Value, EditorApplication.TEMP_META_FILE_NAME, this.getMetaJson());
		if (anything)
			alert("Temporary data saved");
		this.fileOptionsVisible(false);
	}

	initializeNode(type, existing) {
		let node = null;
		if (existing) {
			node = new type(existing, this);
			if (existing.id >= this.#index)
			this.#index = existing.id + 1;
		} else {
			node = new type(this.#index++, this);
			node.x = window.scrollX + window.innerWidth * 0.5;
			node.y = window.scrollY + window.innerHeight * 0.5;
		}
		if (node.x > this.#farthestX)
			this.#farthestX = node.x + EditorApplication.NODE_WIDTH;
		this.nodes.push(node);
		return node;
	}

	createNode(scope, evt, existing) {
		this.initializeNode(NodeTypeMap[this.createNodeType()], existing);
	}

	nodeClick(elm, scope, e) {
		if (!this.settingTo || scope.outs.indexOf(this.settingTo) !== -1)
			return;
		this.settingTo.to(scope);
		this.settingTo = null;
		elm.style.borderColor = "black";
		this.saveTemp();
	}
	
	nodeMouseOver(elm, scope, e) {
		this.hoveringNode = { scope: scope, elm: elm };
		if (!this.settingTo || this.settingTo === scope)
			return;
		elm.style.borderColor = "red";
	}
	
	nodeMouseOut(elm, scope, e) {
		this.hoveringNode = null;
		if (!this.settingTo || this.settingTo === scope)
			return;
		elm.style.borderColor = "black";
	}

	setTo(scope, e) {
		e = getEvent(e);
		if (scope.to()) {
			scope.to(null);
			Canvas.start(this.#canvas);
			this.saveTemp();
			return;
		}
		this.settingTo = scope;
	}

	breakTo(scope, e) {
		scope.to = [];
		Canvas.start(this.#canvas);
	}

	deleteNode(scope) {
		if (!confirm("Are you sure you wish to delete this node?")) 
			return;
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
	}

	selectNode(scope, elm) {
		elm.textContent = "Click on a node";
		this.pendingSelectNode = scope;
	}

	selectNodeOption(scope, elm) {
		elm.textContent = "Now click on an option";
		this.pendingSelectNodeOption = scope;
	}

	optionClick(scope, index) {
		if (this.pendingSelectNodeOption) {
			this.pendingSelectNodeOption.Value = { id: scope.id, option: index };
		}
		this.pendingSelectNodeOption = null;
	}

	makeTemplate(scope) {
		if (!confirm("Are you sure you would like to make this node into a template?"))
			return;
		let name = prompt("What would you like to name this template?");
		if (!name || !name.trim())
			return;
		name = name.trim();
		let templates = this.nodeTemplates();
		for (let i = 0; i < templates.length; i++) {
			if (templates[i].name.toLowerCase() === name.toLowerCase()) {
				if (!confirm("A template with that name already exists, would you like to overwrite it?"))
					return;
				this.nodeTemplates.splice(i, 1);
				break;
			}
		}
		let info = scope.serialize();
		for (let i = 0; i < info.outs.length; i++)
			info.outs[i] = null;
		this.nodeTemplates.push({
			name: name,
			template: info
		});
		this.metaChanged(true);
	}

	createNodeFromTemplate(scope) {
		let info = scope.template;
		info.id = this.#index++;
		info.x = window.scrollX + 64;
		info.y = window.scrollY + 64;
		this.initializeNode(NodeTypeMap[scope.template.type], info);
	}

	deleteNodeTemplate(scope) {
		this.nodeTemplates.remove(scope);
		this.metaChanged(true);
	}

	dupeNode(scope) {
		let info = scope.serialize();
		info.id = this.#index++;
		for (let i = 0; i < info.outs.length; i++)
			info.outs[i] = null;
		info.x = window.scrollX + 64;
		info.y = window.scrollY + 64;
		this.initializeNode(NodeTypeMap[scope.type], info);
	}

	dragStart(scope, e) {
		e = getEvent(e);
		this.#dragPos.node = scope;
		this.#dragPos.elm = e.target;
		let inputX = e.clientX,
			inputY = e.clientY;
		// Get the initial offset
		if (e.touches) {
			inputX = e.touches[0].screenX;
			inputY = e.touches[0].screenY;
		}
		this.#dragPos.x2 = inputX;
		this.#dragPos.y2 = inputY;
		this.#canvasAutoStop = false;
		this.isolate(scope);
		Canvas.start(this.#canvas);
	}

	drag(e) {
		if (this.#dragPos.elm === null)
			return;
		e = getEvent(e);
		let target = this.#dragPos.elm.parentElement;
		if (target == null)
			return;
		let inputX = e.clientX,
			inputY = e.clientY;
		// Get the initial offset
		if (e.touches) {
			inputX = e.touches[0].screenX;
			inputY = e.touches[0].screenY;
		}
		this.#dragPos.x1 = this.#dragPos.x2 - inputX;
		this.#dragPos.y1 = this.#dragPos.y2 - inputY;
		this.#dragPos.x2 = inputX;
		this.#dragPos.y2 = inputY;
		let x = (target.offsetTop - this.#dragPos.y1);
		let y = (target.offsetLeft - this.#dragPos.x1);
		if (x < 0)
			x = 0;
		if (y < 0)
			y = 0;
		target.style.top = x + "px";
	    target.style.left = y + "px";
		let dpn = /** @type {CoreNode} */ (this.#dragPos.node);
		let dpe = /** @type {HTMLElement} */ (this.#dragPos.elm.parentElement);
		dpn.x = parseInt(dpe.style.left);
		dpn.y = parseInt(dpe.style.top);
		// If the node is outside of the bounds, then auto scroll
		let moveBox = EditorApplication.NODE_HANDLE_HEIGHT * 3;
		let scrollX = window.innerWidth - dpn.x - moveBox + window.scrollX;
		if (scrollX < 0) {
			scrollX *= 0.5;
			window.scrollTo(window.scrollX - scrollX, window.scrollY);
			this.#dragPos.x1 += scrollX;
			this.#dragPos.x2 += scrollX;
		} else if (scrollX + moveBox > window.innerWidth) {
			scrollX -= window.innerWidth - moveBox;
			scrollX *= 0.5;
			window.scrollTo(window.scrollX - scrollX, window.scrollY);
			this.#dragPos.x1 += scrollX;
			this.#dragPos.x2 += scrollX;
		}
		let scrollY = window.innerHeight - dpn.y - moveBox + window.scrollY;
		if (scrollY < 0) {
			scrollY *= 0.5;
			window.scrollTo(window.scrollX, window.scrollY - scrollY);
			this.#dragPos.y1 += scrollY;
			this.#dragPos.y2 += scrollY;
		} else if (scrollY + moveBox > window.innerHeight) {
			scrollY -= window.innerHeight - moveBox;
			scrollY *= 0.5;
			window.scrollTo(window.scrollX, window.scrollY - scrollY);
			this.#dragPos.y1 += scrollY;
			this.#dragPos.y2 += scrollY;
		}
	}

	dragEnd(e) {
		if (!this.#dragPos.elm)
			return;
		let dpn = /** @type {CoreNode} */ (this.#dragPos.node);
		let dpe = /** @type {HTMLElement} */ (this.#dragPos.elm.parentElement);
		dpn.x = parseInt(dpe.style.left);
		dpn.y = parseInt(dpe.style.top);
		if (dpn.x > this.#farthestX)
			this.#farthestX = dpn.x + EditorApplication.NODE_WIDTH;
		this.#dragPos.elm = null;
		this.#dragPos.node = null;
		this.#isolated = null;
		Canvas.start(this.#canvas);
		this.saveTemp();
	}

	setPageName() {
		let name = prompt('Input a name for this page:');
		if (!name || !name.trim().length)
			return;
		name = name.trim();
		if (name === EditorApplication.TEMP_FILE_NAME
			|| name === EditorApplication.TEMP_META_FILE_NAME
			|| name === EditorApplication.META_FILE_NAME)
		{
			alert("The specified name is reserved by the system, please try a different name");
		} else
			this.name(name);
		this.saveTemp();
	};

	renameCharacter(scope) {
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
	}

	deleteCharacter(scope) {
		if (!confirm(`Are you sure you wish to delete the character: ${scope.name}?`))
			return;
		this.characters.remove(scope);
		this.metaChanged(true);
		this.saveTemp();
	};

	renameBeast(scope) {
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
	}

	deleteBeast(scope) {
		if (!confirm(`Are you sure you wish to delete the beast: ${scope.name}?`))
			return;
		this.beasts.remove(scope);
		this.metaChanged(true);
		this.saveTemp();
	}

	renameItem(scope) {
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
	}

	deleteItem(scope) {
		if (!confirm(`Are you sure you wish to delete the beast: ${scope.name}?`))
			return;
		this.items.remove(scope);
		this.metaChanged(true);
		this.saveTemp();
	}

	deleteVariable(scope) {
		if (!confirm(`Are you sure you wish to delete the variable: ${scope.name}?`))
			return;
		this.variables.remove(scope);
		this.saveTemp();
	}

	toggleFileOptions() {
		this.fileOptionsVisible(!this.fileOptionsVisible());
	}

	isolate(scope) {
		if (this.#isolated === scope)
			this.#isolated = null;
		else
			this.#isolated = scope;
	};

	cancelOutLink() {
		if (this.hoveringNode)
			this.hoveringNode.elm.style.borderColor = "black";
		this.settingTo = null;
	}

	canvasClick(scope, elm) {
		this.cancelOutLink();
	}
}

ko.applyBindings(new EditorApplication(), document.body);

function toggleCheck(value, elm) {
	// This is nonsense, but KO is trippin, probably because I'm trippin...
	setTimeout(() => {
		elm.checked = value();
	}, 10);
}

window.onerror = (msg, url, linenumber) => {
	alert(`Error message: ${msg}\nURL:${url}\nLine Number: ${linenumber}`);
	return false;
};