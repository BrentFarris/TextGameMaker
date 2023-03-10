import { Manager, CharacterManager, BeastManager, ItemManager,
	VariableManager, NodeTemplateManager,
	BeastEntry, TemplateEntry } from "./manager.js";
import { CoreNode, NodeTypeMap, ValueType, Output, OptionNode, MusicNode, SoundNode, BackgroundNode, JumpNode, OutsNode } from "../node.js";
import { ArrayHelpers, each } from "../engine/std.js";
import { Input } from "../engine/input.js";
import { EditorCanvas } from "./editor_canvas.js";
import { NodeManager } from "./node_manager.js";
import { Application } from "../application.js";
import { Item } from "../database/item_database.js";
import { Variable } from "../database/variable_database.js";
import { Character } from "../database/character_database.js";
import { StringHelpers } from "../engine/std.js"
import { Project, ProjectFile, ProjectFolder } from "./project/project.js";
import { Popup } from "./popup.js";
import { ProjectDatabase } from "./project/project_database.js";

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
 */

/**
 * @typedef HoveringNode
 * @property {CoreNode} scope
 * @property {HTMLElement} elm
 */

/**
 * @typedef {Object} FileJSON
 * @property {string} name
 * @property {CoreNode[]} nodes
 */

/**
 * @typedef {Object} MetaJSON
 * @property {Character[]} characters
 * @property {BeastEntry[]} beasts
 * @property {Item[]} items
 * @property {Variable[]} variables
 * @property {TemplateEntry[]} nodeTemplates
 */

export class EditorApplication extends Application {
	static get PROJECTS_FOLDER() { return "projects" };

	/** @type {Popup} */
	popup = new Popup();
	
	/** @type {Project} */
	project;

	/** @type {ProjectDatabase} */
	projectDatabase;

	/** @type {CharacterManager} */
	characterManager;

	/** @type {BeastManager} */
	beastManager = new BeastManager(document.getElementById("beastManager"));

	/** @type {ItemManager} */
	itemManager;

	/** @type {VariableManager} */
	variableManager;

	/** @type {NodeTemplateManager} */
	templateManager = new NodeTemplateManager(document.getElementById("templateManager"));

	/** @type {KnockoutObservable<boolean>} */
	fileOptionsVisible = ko.observable(false);

	/** @type {KnockoutObservable<boolean>} */
	showNodeSearch = ko.observable(false);

	/** @type {KnockoutObservable<boolean>} */
	nodeSearchFilter = ko.observable("");

	/** @type {KnockoutObservable<boolean>} */
	metaChanged = ko.observable(false);

	/** @type {KnockoutObservable<boolean>} */
	keepProjectWindowOpen = ko.observable(false);

	/** @type {KnockoutObservable<string>} */
	createNodeType = ko.observable("");

	/** @type {NodeManager} */
	nodeManager = new NodeManager();

	/** @type {KnockoutObservable<string>} */
	name = ko.observable("TITLE");

	/** @type {KnockoutObservable<boolean>} */
	projectListVisible = ko.observable(false);

	/** @type {KnockoutObservableArray<string>} */
	projectList = ko.observableArray();
	
	/** @type {CoreNode|null} */
	pendingSelectNode = null;
	
	/** @type {ValueType|null} */
	pendingSelectNodeOption = null;
	
	/** @type {HoveringNode|null} */
	hoveringNode = null;

	/** @type {Output|null} */
	settingTo = null;
	
	/** @type {JSON|null} */
	lastData = null;

	/** @type {DragPos} */
	#dragPos = { node: null, elm: null, x1: 0, y1: 0, x2: 0, y2: 0 };

	/** @type {number} */
	#index = 0;

	/** @type {number} */
	#farthestX = 0;

	/** @type {EditorCanvas} */
	#canvas;

	constructor() {
		super();
		this.projectDatabase = new ProjectDatabase();
		this.project  = new Project("Untitled Project", this.projectDatabase);
		this.characterManager = new CharacterManager(
			document.getElementById("characterManager"), this.characterDatabase);
		this.itemManager = new ItemManager(
			document.getElementById("itemManager"), this.itemDatabase);
		this.variableManager = new VariableManager(
			document.getElementById("variableManager"), this.variableDatabase);
		this.#canvas = new EditorCanvas(this.nodeManager);

		document.addEventListener("mousemove", this.#drag.bind(this));
		document.addEventListener("touchmove", this.#drag.bind(this));
		document.addEventListener("mouseup", this.#dragEnd.bind(this));
		document.addEventListener("touchend", this.#dragEnd.bind(this));
		document.addEventListener("touchcancel", this.#dragEnd.bind(this));
	
		Input.keyUp.register((key) => {
			// Escape key should close all manager windows
			if (key.keyCode === Input.keys.Escape) {
				this.characterManager.close();
				this.beastManager.close();
				this.itemManager.close();
				this.templateManager.close();
				this.projectListVisible(false);
				this.showNodeSearch(false);
				this.popup.cancel();
			}
		}, this);
		
		Input.keyDown.register(async (evt) => {
			if (evt.ctrlKey && evt.key === 's') {
				evt.preventDefault();
				await this.saveFile();
			} else if (evt.keyCode == Input.keys.Escape)
				this.cancelOutLink();
			else if (evt.keyCode === Input.keys.Left || evt.keyCode === Input.keys.Right) {
				if (Input.Ctrl && Input.Shift) {
					let change = 10;
					if (evt.keyCode === Input.keys.Left)
						change *= -1;
					for (let i = 0; i < this.nodeManager.Count; i++) {
						let node = this.nodeManager.at(i);
						if (node.x < Input.mousePosition.x + window.scrollX)
							continue;
						node.x += change;
						let n = document.getElementById(`node-${node.id}`);
						if (n)
							n.style.left = `${node.x}px`;
					}
					this.#canvas.drawFrame();
				}
			} else if (evt.keyCode === Input.keys.Up || evt.keyCode === Input.keys.Down) {
				if (Input.Ctrl && Input.Shift) {
					let change = 10;
					if (evt.keyCode === Input.keys.Up)
						change *= -1;
					for (let i = 0; i < this.nodeManager.Count; i++) {
						let node = this.nodeManager.at(i);
						if (node.x < Input.mousePosition.x + window.scrollX)
							continue;
							node.y += change;
						let n = document.getElementById(`node-${node.id}`);
						if (n)
							n.style.top = `${node.y}px`;
					}
					this.#canvas.drawFrame();
				}
			} else if (evt.target == document.body)
				if (this.#bodyKeyEvent(evt))
					evt.preventDefault();
		}, this);

		(async () => {
			// Locate the first available project
			await this.projectDatabase.connect();
			let names = await this.projectDatabase.listProjects();
			if (names?.length > 0)
				this.project.Name = names[0];
			else
				await this.project.setupNew(this);
			if (!await this.project.deserialize())
				await this.project.initialize(this, this.#blankJson());
			else {
				let mf = this.project.root.file(Project.META_FILE_NAME);
				this.importMeta(mf.Value.fileData);
				this.project.pickRandomFile(this.#blankJson());
				this.import(this.project.openFile.fileData);
			}
			this.name(this.project.openFile.Name);
			this.#canvas.resize();
		})();
	}

	/**
	 * @param {KeyboardEvent} evt 
	 * @return {boolean}
	 */
	#bodyKeyEvent(evt) {
		switch (evt.keyCode) {
			case Input.keys.Delete:
			case Input.keys.Backspace:
				if (this.hoveringNode)
					this.deleteNode(this.hoveringNode.scope);
				return true;
			case Input.keys.P:
				this.keepProjectWindowOpen(!this.keepProjectWindowOpen());
				return true;
			case Input.keys.C:
				this.showManager(this.characterManager);
				return true;
			case Input.keys.B:
				this.showManager(this.beastManager);
				return true;
			case Input.keys.I:
				this.showManager(this.itemManager);
				return true;
			case Input.keys.V:
				this.showManager(this.variableManager);
				return true;
			case Input.keys.F:
				this.toggleFileOptions();
				return true;
			case Input.keys.Space:
				this.showNodeSearch(true);
				return true;
		}
		return false;
	}

	async #updateProjectList() {
		this.projectList.removeAll();
		let projects = await this.projectDatabase.listProjects();
		for (let i = 0; i < projects?.length ?? 0; ++i)
			this.projectList.push(projects[i]);
	}

	importMeta(json) {
		// TODO:  This is weird in the new setup
		//let current = this.getMetaJson();
		//if (current.characters.length || current.variables.length || current.nodeTemplates.length
		//	|| current.beasts.length || current.items.length)
		//{
		//	if (!confirm("You have existing metadata would you like to overwrite it?"))
		//		return;
		//}
		if (json.characters)
			this.characterDatabase.addMany(json.characters);
		if (json.beasts)
			this.beastManager.beasts(json.beasts);
		if (json.items)
			this.itemDatabase.addMany(json.items);
		if (json.variables)
			this.variableDatabase.addMany(json.variables);
		if (json.nodeTemplates)
			this.templateManager.nodeTemplates(json.nodeTemplates);
		this.metaChanged(false);
	}

	import(json) {
		this.#clearFile();
		this.lastData = json;
		this.name(json.name);
		this.nodeManager.clear();
		let i = 0;
		for (i = 0; i < json.nodes.length; i++)
			this.initializeNode(NodeTypeMap[json.nodes[i].type], json.nodes[i]);
		// Now that we created the nodes, we need to go through and set the "to" on each
		for (i = 0; i < this.nodeManager.Count; i++)
			this.nodeManager.at(i).initializeOuts(this.nodeManager.Nodes);
		this.#canvas.drawFrame();
	}

	importJson(scope, event) {
		let input = event.target;
        let reader = new FileReader();
        reader.onload = () => {
			let json = JSON.parse(/** @type {string} */ (reader.result));
			if ("characters" in json)
				this.importMeta(json);
			else
				this.import(json);
		};
        reader.readAsText(input.files[0]);
		this.fileOptionsVisible(false);
	}

	/**
	 * @param {JumpNode} scope 
	 */
	async jumpLoad(scope) {
		let file = this.project.findFile(scope.src.Value);
		if (file.HasValue) {
			this.openFile(file.Value);
			window.scrollTo(0, 0);
		}
	}

	/**
	 * @returns {FileJSON}
	 */
	#blankJson() {
		return {
			name: "Untitled",
			nodes: []
		};
	}

	/**
	 * @returns {FileJSON}
	 */
	getJson() {
		let sanitize = [];
		for (let i = 0; i < this.nodeManager.Count; i++)
			sanitize.push(this.nodeManager.at(i).serialize());
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
			characters: this.characterDatabase.asArray(),
			beasts: this.beastManager.beasts(),
			items: this.itemDatabase.asArray(),
			variables: this.variableDatabase.asArray(),
			nodeTemplates: this.templateManager.nodeTemplates()
		};
	}

	/**
	 * @param {Manager} manager
	 */
	showManager(manager) {
		manager.show();
		this.fileOptionsVisible(false);
	}

	/**
	 * @param {Manager} manager
	 * @param {EditorApplication} self
	 * @param {KeyboardEvent} e 
	 */
	managerInputExec(manager, self, e) {
		e = getEvent(e);
		if (e.keyCode === Input.keys.Enter) {
			manager.inputExec();
			this.metaChanged(true);
		}
	}

	async exportJson() {
		/** @type {ProjectFile} */
		let metaFile = this.project.root.file(Project.META_FILE_NAME).Value;
		metaFile.setContent(this.getMetaJson());
		/** @type {ProjectFile} */
		let current;
		if (this.project.root.fileExists("start.json"))
			current = this.project.root.file("start.json").Value;
		else
			current = this.project.root.createFile("start.json");
		current.setContent(this.getJson());
		await this.project.export();
	}

	async newProject() {
		this.popup.showConfirm("New Project?", "Are you sure you want to start a new project?", async () => {
			await this.#saveFileInternal();
			this.nodeManager.clear();
			this.#canvas.drawFrame();
			this.characterDatabase.clear();
			this.beastManager.beasts.removeAll();
			this.itemDatabase.clear();
			this.variableDatabase.clear();
			this.templateManager.nodeTemplates.removeAll();
			this.metaChanged(false);
			this.fileOptionsVisible(false);
			// TODO:  Make sure this doesn't clash with any other projects
			await this.project.setupNew(this);
			await this.project.initialize(this, this.#blankJson());
			this.name(this.project.openFile.Name);
		});
	}

	#clearFile() {
		this.nodeManager.clear();
		this.#canvas.drawFrame();
		this.fileOptionsVisible(false);
	}

	async newFile() {
		await this.#saveFileInternal();
		this.#clearFile();
		this.project.newTempFile(this.#blankJson());
		this.name(this.project.openFile.Name);
	}

	async #saveFileInternal() {
		this.project.openFile.setContent(this.getJson());
		this.project.root.file("meta.json").Value.setContent(this.getMetaJson());
		// TODO:  Save just this file
		await this.project.serialize(this);
	}

	async saveFile() {
		this.#canvas.drawFrame();
		this.#canvas.drawFrame();
		await this.#saveFileInternal();
		this.fileOptionsVisible(false);
		this.popup.showAlert("File saved", "The file has been saved successfully");
	}

	async newFolder() {
		this.popup.showPrompt("New Folder", "Enter the name of the new folder", (name) => {
			if (!name || !name.trim())
				return;
			name = name.trim();
			if (this.project.root.folderExists(name)) {
				this.popup.showAlert("Folder already exists", "A folder with that name already exists");
				return;
			}
			this.project.root.createFolder(name);
			this.fileOptionsVisible(false);
		});
	}

	/**
	 * @template T
	 * @param {object} type 
	 * @param {object} [existing] 
	 * @param {number} [x]
	 * @param {number} [y]
	 * @returns {T}
	 */
	initializeNode(type, existing, x, y) {
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
		node.x = x ?? node.x;
		node.y = y ?? node.y;
		if (node.x > this.#farthestX) {
			let elm = this.nodeManager.elementMap[node.id];
			this.#farthestX = node.x + elm?.clientWidth ?? 250;
		}
		this.nodeManager.add(node);
		return node;
	}

	createNode(scope, evt, existing) {
		this.initializeNode(NodeTypeMap[this.createNodeType()], existing);
	}

	/**
	 * @param {Application} self
	 * @param {KeyboardEvent} evt 
	 */
	nodeSearchExec(self, evt) {
		if (evt.keyCode === 13) {
			let nt = this.nodeManager.NodeTypes;
			let search = this.nodeSearchFilter().toLowerCase();
			let found = nt.find(n => n.toLowerCase().indexOf(search) >= 0);
			if (found)
				this.nodeSearchCreateNode(found);
			evt.preventDefault();
		}
	}

	/**
	 * @param {string} nodeType 
	 */
	nodeSearchCreateNode(nodeType) {
		this.initializeNode(NodeTypeMap[nodeType]);
		this.nodeSearchFilter("");
		this.showNodeSearch(false);
	}

	nodeClick(elm, scope, e) {
		if (!this.settingTo || scope.outs.indexOf(this.settingTo) !== -1)
			return;
		this.settingTo.to(scope);
		this.settingTo = null;
		elm.style.borderColor = "black";
		this.#canvas.drawFrame();
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
			this.#canvas.drawFrame();
			return;
		}
		this.settingTo = scope;
	}

	breakTo(scope, e) {
		scope.to = [];
		this.#canvas.drawFrame();
	}

	deleteNode(scope) {
		this.popup.showConfirm("Delete node", "Are you sure you wish to delete this node?", () => {
			for (let i = 0; i < this.nodeManager.Count; i++) {
				let outs = this.nodeManager.at(i).outs();
				for (let j = 0; j < outs.length; j++) {
					if (outs[j].to() === scope) {
						outs[j].to(null);
					}
				}
			}
			this.nodeManager.remove(scope);
			this.#canvas.drawFrame();
		});
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
		this.popup.showConfirm("Make template", "Are you sure you would like to make this node into a template?", () => {
			this.popup.showPrompt("Make template", "Enter the name of the template", (name) => {
				if (!name || !name.trim())
					return;
				name = name.trim();
				let templates = this.templateManager.nodeTemplates();
				let found = -1;
				for (let i = 0; i < templates.length && found == -1; i++) {
					if (templates[i].name.toLowerCase() === name.toLowerCase())
						found = i;
				}
				let end = () => {
					let info = scope.serialize();
					for (let i = 0; i < info.outs.length; i++)
						info.outs[i] = null;
					this.templateManager.nodeTemplates.push({
						name: name,
						template: info
					});
					this.metaChanged(true);
				};
				if (found !== -1) {
					this.popup.showConfirm("Overwrite template", "A template with that name already exists, would you like to overwrite it?", () => {
						this.templateManager.nodeTemplates.splice(found, 1);
						end();
					});
				} else
					end();
			});
		});
	}

	createNodeFromTemplate(scope) {
		let info = scope.template;
		info.id = this.#index++;
		info.x = window.scrollX + 64;
		info.y = window.scrollY + 64;
		this.initializeNode(NodeTypeMap[scope.template.type], info);
	}

	deleteNodeTemplate(scope) {
		this.templateManager.nodeTemplates.remove(scope);
		this.metaChanged(true);
	}

	/**
	 * @param {CoreNode} sourceNode 
	 */
	dupeNode(sourceNode) {
		let info = sourceNode.serialize();
		info.id = this.#index++;
		for (let i = 0; i < info.outs.length; i++)
			info.outs[i] = null;
		info.x = sourceNode.x + 64;
		info.y = sourceNode.y + 64;
		this.initializeNode(NodeTypeMap[sourceNode.type], info);
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
		this.isolate(scope);
		this.#canvas.drawFrame();
	}

	#setNodeDraggedPos() {
		let dpn = /** @type {CoreNode} */ (this.#dragPos.node);
		let dpe = /** @type {HTMLElement} */ (this.#dragPos.elm.parentElement);
		dpn.x = parseInt(dpe.style.left);
		dpn.y = parseInt(dpe.style.top);
	}

	#drag(e) {
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
		this.#setNodeDraggedPos();
		this.#canvas.resize();
		this.#canvas.drawFrame();
	}

	#dragEnd(e) {
		if (!this.#dragPos.elm)
			return;
		this.#setNodeDraggedPos();
		if (this.#dragPos.node.x > this.#farthestX) {
			this.#farthestX = this.#dragPos.node.x
				+ this.nodeManager.elementMap[this.#dragPos.node.id].clientWidth;
		}
		this.#dragPos.elm = null;
		this.#dragPos.node = null;
		this.nodeManager.deselect();
		this.#canvas.trim();
		this.#canvas.drawFrame();
	}

	async setPageName() {
		this.popup.showPrompt("Set page name", "What would you like to name this page?", async (name) => {
			if (!name || !name.trim().length)
				return;
			name = name.trim();
			if (name === Project.META_FILE_NAME)
				this.popup.showAlert("Invalid file name", "The specified name is reserved by the system, please try a different name");
			else if (this.project.openFile.parent.fileExists(`${name}.json`))
				this.popup.showAlert("Invalid file name", "The specified name already exists, please try a different name");
			else {
				this.project.openFile.Name = `${name}.json`;
				this.name(this.project.openFile.Name);
				await this.#saveFileInternal();
			}
		}, undefined, undefined, undefined, this.project.openFile.Name);
	};

	renameCharacter(scope) {
		this.popup.showPrompt("Rename character", "What would you like to rename this character to?", (newName) => {
			if (!newName || !newName.length) {
				this.popup.showAlert("No name supplied", "You must supply a valid name for the character");
				return;
			}
			scope.name = newName;
			// Splice and valueHasMutated are not calling refresh, so we are going to have to do
			// a "dirty" refresh by re-assigning the array
			let contents = this.characterDatabase.asArray()
			this.characterDatabase.clear();
			this.characterDatabase.addMany(contents);
		}, undefined, undefined, undefined, scope.name);
	}

	deleteCharacter(scope) {
		this.popup.showConfirm("Delete character", `Are you sure you wish to delete the character: ${scope.name}?`, () => {
			this.characterDatabase.remove(scope);
			this.metaChanged(true);
		});
	};

	renameBeast(scope) {
		this.popup.showPrompt("Rename beast", "What would you like to rename this beast to?", (newName) => {
			if (!newName || !newName.length) {
				this.popup.showAlert("No name supplied", "You must supply a valid name for the beast");
				return;
			}
			scope.name = newName;
			// Splice and valueHasMutated are not calling refresh, so we are going to have to do
			// a "dirty" refresh by re-assigning the array
			let contents = this.beastManager.beasts();
			this.beastManager.beasts([]);
			this.beastManager.beasts(contents);
		}, undefined, undefined, undefined, scope.name);
	}

	deleteBeast(scope) {
		this.popup.showConfirm("Delete beast", `Are you sure you wish to delete the beast: ${scope.name}?`, () => {
			this.beastManager.beasts.remove(scope);
			this.metaChanged(true);
		});
	}

	renameItem(scope) {
		this.popup.showPrompt("Rename item", "What would you like to rename this item to?", (newName) => {
			if (!newName || !newName.length) {
				this.popup.showAlert("No name supplied", "You must supply a valid name for the item");
				return;
			}
			scope.name = newName;
			// Splice and valueHasMutated are not calling refresh, so we are going to have to do
			// a "dirty" refresh by re-assigning the array
			let contents = this.itemDatabase.asArray()
			this.itemDatabase.clear();
			this.itemDatabase.addMany(contents);
		}, undefined, undefined, undefined, scope.name);
	}

	deleteItem(scope) {
		this.popup.showConfirm("Delete item", `Are you sure you wish to delete the item: ${scope.name}?`, () => {
			this.itemDatabase.remove(scope);
			this.metaChanged(true);
		});
	}

	deleteVariable(scope) {
		this.popup.showConfirm("Delete variable", `Are you sure you wish to delete the variable: ${scope.name}?`, () => {
			this.variableDatabase.remove(scope);
		});
	}

	toggleFileOptions() {
		this.fileOptionsVisible(!this.fileOptionsVisible());
	}

	isolate(scope) {
		if (this.nodeManager.SelectedNode.HasValue
			&& this.nodeManager.SelectedNode.Value === scope)
		{
			this.nodeManager.deselect();
		} else
			this.nodeManager.select(scope);
	};

	cancelOutLink() {
		if (this.hoveringNode)
			this.hoveringNode.elm.style.borderColor = "black";
		this.settingTo = null;
	}

	canvasClick(scope, elm) {
		this.cancelOutLink();
		this.fileOptionsVisible(false);
	}

	/**
	 * @param {CoreNode} node 
	 * @returns {boolean}
	 */
	isOptionNode(node) {
		return node instanceof OptionNode;
	}

	/**
	 * @param {CoreNode} node 
	 * @returns {boolean}
	 */
	isOutsNode(node) {
		return node instanceof OutsNode;
	}

	toggleCheck(value, elm) {
		// This is nonsense, but KO is trippin, probably because I'm trippin...
		setTimeout(() => {
			elm.checked = value();
		}, 10);
	}

	nl2br(str) {
		return StringHelpers.nl2br(str);
	}

	/**
	 * @param {ProjectFolder} folder 
	 */
	async projectFolderClicked(folder) {
		if (Input.Ctrl) {
			this.popup.showPrompt("Rename folder", "What would you like to rename your folder to?", async (name) => {
				if (name?.trim().length > 0 && name.indexOf("/") == -1) {
					try {
						if (folder == this.project.root)
							await this.project.rename(name, this);
						else {
							folder.Name = name;
							await this.project.serialize(this);
						}
					} catch (err) {
						this.popup.showAlert("Error", err.message);
					}
				}
			}, undefined, undefined, undefined, folder.Name);
		} else if (Input.Shift) {
			this.popup.showConfirm("Delete folder", `Are you sure you wish to delete the folder: ${folder.Path}?`, () => {
				folder.parent.deleteFolder(folder);
			});
		} else
			folder.collapsed(!folder.collapsed());
		return true;
	}

	/**
	 * @param {ProjectFile} file 
	 */
	openFile(file) {
		this.project.openFile = file;
		this.name(file.Name);
		this.import(file.fileData);
	}

	/**
	 * @param {ProjectFile} file 
	 */
	async projectFileClicked(file) {
		if (Input.Shift) {
			this.popup.showConfirm("Delete file", `Are you sure you wish to delete the file: ${file.Path}?`, () => {
				if (file == this.project.openFile) {
					this.project.deleteOpenFile(this.#blankJson());
					this.import(this.project.openFile.fileData);
					this.name(this.project.openFile.Name);
				} else
					file.parent.deleteFile(file);
			});
		} else {
			if (file.Name === "meta.json" || this.project.openFile == file)
				return;
			if (!file.Name.endsWith(".json"))
				return;
			if (this.project.openFile)
				await this.#saveFileInternal();
			this.openFile(file);
		}
	}

	/**
	 * @param {ProjectFolder} folder 
	 * @param {HTMLDivElement} elm
	 * @param {DragEvent} evt
	 */
	async projectFolderDrop(folder, elm, evt) {
		if (evt.dataTransfer?.files && evt.dataTransfer.files.length > 0) {
			let files = evt.dataTransfer.files;
			for (let i = 0; i < files.length; i++) {
				if (folder.fileExists(files[i].name)) {
					this.popup.showAlert("File already exists", `File already exists: ${files[i].name}`);
					continue;
				}
				switch (files[i].type) {
					case "audio/mpeg":
					case "audio/wav":
					case "video/ogg":
					case "audio/x-wav":
					{
						let path = await this.media.audioDatabase.add(
							files[i], URL.createObjectURL(files[i]));
						let f = folder.createFile(files[i].name);
						f.setContent(await this.media.audioDatabase.blob(path));
						break;
					}
					case "image/png":
					case "image/jpeg":
					case "image/jpg":
					case "image/gif":
					case "image/svg+xml":
					{
						let path = await this.media.imageDatabase.add(
							files[i], URL.createObjectURL(files[i]));
						let f = folder.createFile(files[i].name);
						f.setContent(await this.media.imageDatabase.blob(path));
						break;
					}
				}
			}
		}
		let moved = false;
		if (this.dragFolder)
			moved = this.dragFolder.moveTo(folder);
		else if (this.dragFile && this.dragFile.Name != Project.META_FILE_NAME)
			moved = this.dragFile.moveTo(folder);
		this.dragFolder = null;
		this.dragFile = null;
		if (moved)
			await this.#saveFileInternal();
		elm.style.backgroundColor = "";
	}

	/**
	 * @param {ProjectFolder} folder 
	 * @param {HTMLDivElement} elm
	 */
	projectFolderDragOver(folder, elm) {
		elm.style.backgroundColor = "lightgray";
	}

	/**
	 * @param {ProjectFolder} folder 
	 * @param {HTMLDivElement} elm
	 */
	projectFolderDragLeave(folder, elm) {
		elm.style.backgroundColor = "";
	}

	/**
	 * @param {ProjectFolder} folder 
	 */
	projectFolderDragStart(folder) {
		this.dragFolder = folder;
		return true;
	}

	/**
	 * @param {ProjectFile} file 
	 */
	projectFileDragStart(file) {
		this.dragFile = file;
		return true;
	}

	bodyDragOver(self, evt) {

	}

	bodyDragLeave(self, evt) {

	}

	/**
	 * @param {Application} self
	 * @param {DragEvent} evt 
	 */
	bodyDrop(self, evt) {
		if (this.dragFile) {
			if (this.dragFile.fileData instanceof File || this.dragFile.fileData instanceof Blob) {
				switch (this.dragFile.fileData.type) {
					case "audio/mpeg":
					case "video/ogg":
					{
						/** @type {MusicNode} */
						let n = this.initializeNode(MusicNode, undefined, evt.offsetX, evt.offsetY);
						n.src.Value = this.dragFile.Path;
						break;
					}
					case "audio/wav":
					case "audio/x-wav":
					{
						/** @type {SoundNode} */
						let n = this.initializeNode(SoundNode, undefined, evt.offsetX, evt.offsetY);
						n.src.Value = this.dragFile.Path;
						break;
					}
					case "image/png":
					case "image/jpeg":
					case "image/jpg":
					case "image/gif":
					case "image/svg+xml":
					{
						/** @type {BackgroundNode} */
						let n = this.initializeNode(BackgroundNode, undefined, evt.offsetX, evt.offsetY);
						n.src.Value = this.dragFile.Path;
						break;
					}
				}
			} else if (this.dragFile.Name.endsWith(".json") && !this.dragFile.Name.endsWith(Project.META_FILE_NAME)) {
				/** @type {JumpNode} */
				let n = this.initializeNode(JumpNode, undefined, evt.offsetX, evt.offsetY);
				n.src.Value = this.dragFile.Path;
			}
		}
		this.dragFile = null;
		this.dragFolder = null;
	}

	/**
	 * 
	 */
	async showProjectList() {
		await this.#updateProjectList();
		this.projectListVisible(true);
		this.fileOptionsVisible(false);
	}

	/**
	 * @param {string} projectName 
	 */
	async selectProject(projectName) {
		await this.project.open(projectName, this);
		this.projectListVisible(false);
	}
}

(function() {
	let app = new EditorApplication();
	ko.applyBindings(app, document.body);
	window.onerror = (msg, url, linenumber) => {
		app.popup.showAlert("Error", `Error message: ${msg}\nURL:${url}\nLine Number: ${linenumber}`);
		return false;
	};
})();