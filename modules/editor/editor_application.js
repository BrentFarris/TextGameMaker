import { Manager, CharacterManager, BeastManager, ItemManager,
	VariableManager, ViewManager, NodeTemplateManager,
	BeastEntry, TemplateEntry } from "./manager.js";
import { CoreNode, NodeTypeMap, ValueType, Output, NODE_WIDTH, NODE_HANDLE_HEIGHT, OptionNode, MusicNode, SoundNode, BackgroundNode, JumpNode } from "../node.js";
import { ArrayHelpers, each } from "../engine/std.js";
import { Input } from "../engine/input.js";
import { LocalStorage } from "../engine/local_storage.js";
import { EditorCanvas } from "./editor_canvas.js";
import { NodeManager } from "./node_manager.js";
import { Application } from "../application.js";
import { Item } from "../database/item_database.js";
import { Variable } from "../database/variable_database.js";
import { Character } from "../database/character_database.js";
import { StringHelpers } from "../engine/std.js"
import { Project, ProjectFile, ProjectFolder } from "./project/project.js";

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
	
	/** @type {Project} */
	project = new Project("Untitled Project");

	/** @type {CharacterManager} */
	characterManager;

	/** @type {BeastManager} */
	beastManager = new BeastManager(document.getElementById("beastManager"));

	/** @type {ItemManager} */
	itemManager;

	/** @type {VariableManager} */
	variableManager;

	/** @type {ViewManager} */
	viewManager;

	/** @type {NodeTemplateManager} */
	templateManager = new NodeTemplateManager(document.getElementById("templateManager"));

	/** @type {LocalStorage} */
	storage = new LocalStorage();

	/** @type {KnockoutObservable<boolean>} */
	fileOptionsVisible = ko.observable(false);

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
	
	// TODO:  This and lastData should be typedefs
	/** @type {ProjectFile[]} */
	jumpStack = [];
	
	/** @type {JSON|null} */
	lastData = null;

	/** @type {DragPos} */
	#dragPos = { node: null, elm: null, x1: 0, y1: 0, x2: 0, y2: 0 };

	/** @type {number} */
	#index = 0;

	/** @type {number} */
	#lastPageY = 0;

	/** @type {number} */
	#farthestX = 0;

	/** @type {EditorCanvas} */
	#canvas;

	constructor() {
		super();
		this.characterManager = new CharacterManager(
			document.getElementById("characterManager"), this.characterDatabase);
		this.itemManager = new ItemManager(
			document.getElementById("itemManager"), this.itemDatabase);
		this.variableManager = new VariableManager(
			document.getElementById("variableManager"), this.variableDatabase);
		this.viewManager = new ViewManager(
			document.getElementById("viewNodeManager"), this.characterManager);
		this.#canvas = new EditorCanvas(this.nodeManager);

		document.addEventListener("mousemove", this.drag.bind(this));
		document.addEventListener("touchmove", this.drag.bind(this));
		document.addEventListener("mouseup", this.dragEnd.bind(this));
		document.addEventListener("touchend", this.dragEnd.bind(this));
		document.addEventListener("touchcancel", this.dragEnd.bind(this));
	
		Input.keyUp.register((key) => {
			// Escape key should close all manager windows
			if (key.keyCode === Input.keys.Escape) {
				this.characterManager.close();
				this.beastManager.close();
				this.itemManager.close();
				this.templateManager.close();
				this.viewManager.close();
				this.projectListVisible(false);
			}
		}, this);
		
		Input.keyDown.register(async (key) => {
			if (key.ctrlKey && key.key === 's') {
				key.preventDefault();
				await this.saveFile();
			} else if (key.keyCode == Input.keys.Escape) {
				this.cancelOutLink();
			} else if (key.keyCode == Input.keys.P)
				this.keepProjectWindowOpen(!this.keepProjectWindowOpen());
			else if (key.keyCode === Input.keys.Left || key.keyCode === Input.keys.Right) {
				if (Input.Ctrl && Input.Alt) {
					let change = 10;
					if (key.keyCode === Input.keys.Left)
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
			} else if (key.keyCode === Input.keys.Up || key.keyCode === Input.keys.Down) {
				if (Input.Ctrl && Input.Alt) {
					let change = 10;
					if (key.keyCode === Input.keys.Up)
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
			}
		}, this);

		(async () => {
			// Locate the first available project
			let fs = await this.storage.getFileSystem();
			let foundProject = null;
			each(fs.children, (key, val) => {
				foundProject = /** @type {string} */ (key);
				return false;
			});
			if (foundProject)
				this.project.Name = foundProject;
			else
				await this.project.setupNew(this);
			if (!await this.project.deserialize(this))
				await this.project.initialize(this, this.getJson());
			else {
				let mf = this.project.root.file(Project.META_FILE_NAME);
				this.importMeta(mf.Value.fileData);
				this.project.pickRandomFile(this.getJson());
				this.import(this.project.openFile.fileData);
			}
			this.name(this.project.openFile.Name);
		})();
	}

	async #updateProjectList() {
		this.projectList.removeAll();
		let fs = await this.storage.getFileSystem();
		each(fs.children, (key, val) => {
			this.projectList.push(key);
		});
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
		if (!this.nodeManager.isEmpty()) {
			if (!confirm("Your current nodes will be deleted on importing of this file. Make sure to export the current nodes or they will be lost. Would you like to continue the import and delete the existing nodes?")) {
				return;
			}
			this.nodeManager.clear();
		}
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
			else {
				if (!this.characterDatabase.Count) {
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

	/**
	 * @param {JumpNode} scope 
	 */
	async jumpLoad(scope) {
		let file = this.project.findFile(scope.src.Value);
		if (file.HasValue) {
			this.jumpStack.push(this.project.openFile);
			this.openFile(file.Value);
			let hasReturn = false;
			for (let i = 0; i < file.Value.fileData.nodes.length && !hasReturn; i++)
				hasReturn = file.Value.fileData.nodes[i].type === "Return";
			if (!hasReturn)
				ArrayHelpers.clear(this.jumpStack);
			window.scrollTo(0, 0);
			this.#lastPageY = 0;
		}
	}

	/**
	 * 
	 */
	async returnLoad() {
		if (!this.jumpStack.length)
			return;
		this.openFile(this.jumpStack.pop());
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
	showManager(manager, scope) {
		manager.show(scope);
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

	exportJson() {
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
		this.project.export(this);
	}

	async newProject() {
		if (!confirm("Are you sure you want to start a new project?"))
			return;
		await this.#saveFileInternal();
		this.nodeManager.clear();
		this.#canvas.drawFrame();
		this.characterDatabase.clear();
		this.beastManager.beasts.removeAll();
		this.itemDatabase.clear();
		this.variableDatabase.clear();
		this.templateManager.nodeTemplates.removeAll();
		this.metaChanged(false);
		//this.importMeta(await HTTP.get("view/json/meta.json"));
		this.fileOptionsVisible(false);
		// TODO:  Make sure this doesn't clash with any other projects
		await this.project.setupNew(this);
		await this.project.initialize(this, this.getJson());
		this.name(this.project.openFile.Name);
	}

	#clearFile() {
		this.nodeManager.clear();
		this.#canvas.drawFrame();
		this.fileOptionsVisible(false);
	}

	async newFile() {
		await this.#saveFileInternal();
		this.#clearFile();
		this.project.newTempFile(this.getJson());
		this.name(this.project.openFile.Name);
	}

	async #saveFileInternal() {
		this.project.openFile.setContent(this.getJson());
		// TODO:  Save just this file
		await this.project.serialize(this);
	}

	async saveFile() {
		this.#canvas.drawFrame();
		this.#canvas.setRenderFreezeFrame();
		this.#canvas.drawFrame();
		await this.#saveFileInternal();
		this.fileOptionsVisible(false);
		alert("File saved");
	}

	async newFolder() {
		let name = prompt("Enter the name of the new folder");
		if (!name || !name.trim())
			return;
		name = name.trim();
		if (this.project.root.folderExists(name)) {
			alert("A folder with that name already exists");
			return;
		}
		this.project.root.createFolder(name);
		this.fileOptionsVisible(false);
	}

	/**
	 * @template T
	 * @param {object} type 
	 * @param {object} existing 
	 * @returns {T}
	 */
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
			this.#farthestX = node.x + NODE_WIDTH;
		this.nodeManager.add(node);
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
		if (!confirm("Are you sure you wish to delete this node?")) 
			return;
		for (let i = 0; i < this.nodeManager.Count; i++) {
			let outs = this.nodeManager.at(i).outs();
			for (let j = 0; j < outs.length; j++) {
				if (outs[j].to() === scope) {
					outs[j].to(null);
				}
			}
		}
		this.nodeManager.remove(scope);
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
		let templates = this.templateManager.nodeTemplates();
		for (let i = 0; i < templates.length; i++) {
			if (templates[i].name.toLowerCase() === name.toLowerCase()) {
				if (!confirm("A template with that name already exists, would you like to overwrite it?"))
					return;
				this.templateManager.nodeTemplates.splice(i, 1);
				break;
			}
		}
		let info = scope.serialize();
		for (let i = 0; i < info.outs.length; i++)
			info.outs[i] = null;
		this.templateManager.nodeTemplates.push({
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
		this.templateManager.nodeTemplates.remove(scope);
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
		this.#canvas.setContinuousRender();
		this.isolate(scope);
		this.#canvas.drawFrame();
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
	}

	dragEnd(e) {
		if (!this.#dragPos.elm)
			return;
		let dpn = /** @type {CoreNode} */ (this.#dragPos.node);
		let dpe = /** @type {HTMLElement} */ (this.#dragPos.elm.parentElement);
		dpn.x = parseInt(dpe.style.left);
		dpn.y = parseInt(dpe.style.top);
		if (dpn.x > this.#farthestX)
			this.#farthestX = dpn.x + NODE_WIDTH;
		this.#dragPos.elm = null;
		this.#dragPos.node = null;
		this.nodeManager.deselect();
		this.#canvas.drawFrame();
	}

	async setPageName() {
		let name = prompt('Input a name for this page:');
		if (!name || !name.trim().length)
			return;
		name = name.trim();
		if (name === Project.META_FILE_NAME)
			alert("The specified name is reserved by the system, please try a different name");
		else if (this.project.openFile.parent.fileExists(`${name}.json`))
			alert("The specified name already exists, please try a different name");
		else {
			this.project.openFile.Name = `${name}.json`;
			this.name(this.project.openFile.Name);
			await this.#saveFileInternal();
		}
	};

	renameCharacter(scope) {
		let newName = prompt("What would you like to rename this character to?", scope.name);
		if (!newName || !newName.length) {
			alert("Invalid name specified");
			return;
		}
		scope.name = newName;
		// Splice and valueHasMutated are not calling refresh, so we are going to have to do
		// a "dirty" refresh by re-assigning the array
		let contents = this.characterDatabase.asArray()
		this.characterDatabase.clear();
		this.characterDatabase.addMany(contents);
	}

	deleteCharacter(scope) {
		if (!confirm(`Are you sure you wish to delete the character: ${scope.name}?`))
			return;
		this.characterDatabase.remove(scope);
		this.metaChanged(true);
	};

	renameBeast(scope) {
		let newName = prompt("What would you like to rename this beast to?", scope.name);
		if (!newName || !newName.length) {
			alert("Invalid name specified");
			return;
		}
		scope.name = newName;
		// Splice and valueHasMutated are not calling refresh, so we are going to have to do
		// a "dirty" refresh by re-assigning the array
		let contents = this.beastManager.beasts();
		this.beastManager.beasts([]);
		this.beastManager.beasts(contents);
	}

	deleteBeast(scope) {
		if (!confirm(`Are you sure you wish to delete the beast: ${scope.name}?`))
			return;
		this.beastManager.beasts.remove(scope);
		this.metaChanged(true);
	}

	renameItem(scope) {
		let newName = prompt("What would you like to rename this beast to?", scope.name);
		if (!newName || !newName.length) {
			alert("Invalid name specified");
			return;
		}
		scope.name = newName;
		// Splice and valueHasMutated are not calling refresh, so we are going to have to do
		// a "dirty" refresh by re-assigning the array
		let contents = this.itemDatabase.asArray()
		this.itemDatabase.clear();
		this.itemDatabase.addMany(contents);
	}

	deleteItem(scope) {
		if (!confirm(`Are you sure you wish to delete the beast: ${scope.name}?`))
			return;
		this.itemDatabase.remove(scope);
		this.metaChanged(true);
	}

	deleteVariable(scope) {
		if (!confirm(`Are you sure you wish to delete the variable: ${scope.name}?`))
			return;
		this.variableDatabase.remove(scope);
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
	}

	/**
	 * @param {CoreNode} node 
	 * @returns {boolean}
	 */
	isOptionNode(node) {
		return node instanceof OptionNode;
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
			let name = prompt("What would you like to rename your folder to?", folder.Name);
			if (name?.trim().length > 0 && name.indexOf("/") == -1) {
				try {
					if (folder == this.project.root)
						await this.project.rename(name, this);
					else {
						folder.Name = name;
						await this.project.serialize(this);
					}
				} catch (err) {
					alert(/** @type {Error} */ (err).message);
				}
			}
		} else if (Input.Alt) {
			if (confirm(`Would you like to delete the folder '${folder.Path}' and all it's contents?`))
				folder.parent.deleteFolder(folder);
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
		if (Input.Alt) {
			if (confirm(`Would you like to delete the file '${file.Path}'?`)) {
				if (file == this.project.openFile) {
					this.project.deleteOpenFile(this.getJson());
					this.import(this.project.openFile.fileData);
					this.name(this.project.openFile.Name);
				} else
					file.parent.deleteFile(file);
			}
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
					alert(`File already exists: ${files[i].name}`);
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
		else if (this.dragFile)
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

	canvasDragOver(self, evt) {

	}

	canvasDragLeave(self, evt) {

	}

	/**
	 * @param {DragEvent} evt 
	 */
	canvasDrop(self, evt) {
		if (this.dragFile) {
			if (this.dragFile.fileData instanceof File) {
				switch (this.dragFile.fileData.type) {
					case "audio/mpeg":
					case "video/ogg":
					{
						/** @type {MusicNode} */
						let n = this.initializeNode(MusicNode);
						n.src.Value = this.dragFile.Path;
						break;
					}
					case "audio/wav":
					case "audio/x-wav":
					{
						/** @type {SoundNode} */
						let n = this.initializeNode(SoundNode);
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
						let n = this.initializeNode(BackgroundNode);
						n.src.Value = this.dragFile.Path;
						break;
					}
				}
			} else if (this.dragFile.Name.endsWith(".json")) {
				/** @type {JumpNode} */
				let n = this.initializeNode(JumpNode);
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
		alert(`Error message: ${msg}\nURL:${url}\nLine Number: ${linenumber}`);
		return false;
	};
})();