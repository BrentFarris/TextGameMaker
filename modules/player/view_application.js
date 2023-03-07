import { each, Optional, StringHelpers } from "../engine/std.js";
import { CoreNode, NodeTypeMap, OptionNode, Output, StartNode, StoryNode } from "../node.js";
import { Application } from "../application.js";
import { Media } from "../media.js";
import { Variable } from "../database/variable_database.js";

/**
 * @typedef LoadedFile
 * @property {string} name
 * @property {Object} json
 */

/**
 * @typedef {Object} NodeHistory
 * @property {OptionNode} node
 * @property {string} choice
 */

export class ViewApplication extends Application {
	nodes = {};
	node = ko.observable(null);

	/** @type {KnockoutObservableArray<NodeHistory>} */
	history = ko.observableArray();

	/** @type {KnockoutObservable<string>} */
	textStyle = ko.observable("normal");
	
	remoteFunctions = {};
	fileStack = [];
	currentFile = null;

	/** @type {LoadedFile[]} */
	loadedFiles = [];

	/** @type {KnockoutObservable<string>} */
	statsPanelDisplay = ko.observable("none");

	/** @type {KnockoutObservable<string>} */
	logPanelDisplay = ko.observable("none");

	/** @type {KnockoutObservable<string>} */
	inventoryPanelDisplay = ko.observable("none");

	/** @type {KnockoutObservable<string>[]} */
	#panels = [];

	constructor() {
		super();
		this.#panels = [this.statsPanelDisplay, this.inventoryPanelDisplay, this.logPanelDisplay];
		this.media = new Media();
	}

	async importFolderMeta(files) {
		for (let i = 0; i < files.length; i++) {
			if (files[i].name === "meta.json") {
				await new Promise((res, rej) => {
					let reader = new FileReader();
					reader.onload = (e) => {
						this.importMeta(
						JSON.parse(/** @type {string} } */ (e.target.result)));
						res(null);
					};
					reader.readAsText(files[i]);
				});
				break;
			}
		}
	}

	async importMedia(files) {
		for (let i = 0; i < files.length; i++) {
			if (files[i].type === "audio/mpeg" || files[i].type === "audio/wav"
				|| files[i].type === "video/ogg" || files[i].type === "audio/x-wav")
			{
				await this.media.audioDatabase.add(files[i], URL.createObjectURL(files[i]));
			} else if (files[i].type === "image/png" || files[i].type === "image/jpeg")
				await this.media.imageDatabase.add(files[i], URL.createObjectURL(files[i]));
		}
	}

	async importZippedMedia(zip) {
		return new Promise((res, rej) => {
			let count = 1;
			zip.folder("audio").forEach((relativePath, file) => {
				count++;
				file.async("blob").then((blob) => {
					this.media.audioDatabase.add(file, URL.createObjectURL(blob));
					if (--count === 0)
						res(null);
				});
			});
			zip.folder("images").forEach((relativePath, file) => {
				count++;
				file.async("blob").then((blob) => {
					this.media.imageDatabase.add(file, URL.createObjectURL(blob));
					if (--count === 0)
						res(null);
				});
			});
			if (--count == 0)
				return res(null);
		});
	}

	async importZip(file) {
		let reader = new FileReader();
		reader.onload = async (e) => {
			let content = e.target?.result;
			let new_zip = new JSZip();
			let zip = await new_zip.loadAsync(content);
			await this.importZippedMedia(zip);
			let text = await zip.file("meta.json").async("string");
			this.importMeta(JSON.parse(text));
			zip.folder().forEach(async (relativePath, file) => {
				if (StringHelpers.endsWith(file.name, ".json") && file.name !== "meta.json") {
					let storyText = await file.async("string")
					this.loadedFiles.push({
						name: file.name,
						json: JSON.parse(storyText)
					});
					// Go through the nodes and find the start node
					let foundStart = false;
					for (let j = 0; j < this.loadedFiles[this.loadedFiles.length - 1].json.nodes.length && !foundStart; j++) {
						if (this.loadedFiles[this.loadedFiles.length - 1].json.nodes[j].type.toLowerCase() === "start")
							foundStart = true;
					}
					if (foundStart)
						this.load(this.loadedFiles[this.loadedFiles.length - 1]);
				}
			});
		};
		reader.readAsArrayBuffer(file);
	}

	async importFolder(event) {
		let files = event.target.files;
		if (files.length === 0)
			return;
		if (files[0].type === "application/zip" || files[0].type === "application/x-zip-compressed")
			await this.importZip(files[0]);
		else {
			await this.importFolderMeta(files);
			await this.importMedia(files);
			for (let i = 0; i < files.length; i++) {
				if (files[i].type === "application/json") {
					if (files[i].name !== "meta.json") {
						let reader = new FileReader();
						reader.onload = (e) => {
							let json = JSON.parse(/** @type {string} } */ (e.target?.result));
							this.loadedFiles.push({
								name: files[i].name,
								json: json
							});
							// Go through the nodes and find the start node
							let foundStart = false;
							for (let j = 0; j < json.nodes.length && !foundStart; j++) {
								if (json.nodes[j].type.toLowerCase() === "start")
									foundStart = true;
							}
							if (foundStart)
								this.load(this.loadedFiles[this.loadedFiles.length - 1]);
						};
						reader.readAsText(files[i]);
					}
				}
			}
		}
	}

	importMeta(json) {
		if (json.variables) {
			for (let i = 0; i < json.variables.length; i++) {
				if (this.variableDatabase.exists(json.variables[i].name))
					continue;
				let type = json.variables[i].type;
				let value = null;
				switch (type) {
					case "string":
						value = "";
						break;
					case "whole":
						value = 0;
						break;
					case "number":
						value = 0.0;
						break;
					case "bool":
						value = false;
						break;
				}
				this.variableDatabase.add(new Variable(json.variables[i].id, json.variables[i].name, type, value));
			}
		}
		if (json.characters)
			this.characterDatabase.addMany(json.characters);
	}

	import(json, jumpToId) {
		this.nodes = {};
		for (let i = 0; i < json.nodes.length; i++)
			this.nodes[json.nodes[i].id] = new NodeTypeMap[json.nodes[i].type](json.nodes[i], this);
		if (jumpToId > 0) {
			each(this.nodes, (key, val) => {
				val.initializeOuts(this.nodes);
			});
			this.jumpTo(jumpToId);
		} else {
			let jump = null;
			each(this.nodes, (key, val) => {
				val.initializeOuts(this.nodes);
				if (jump == null)
					jump = val;
				if (val instanceof StartNode && (jumpToId == null || jumpToId <= 0))
					jump = val;
			});
			this.node(jump);
		}
		let out = this.node().execute(this);
		if (out)
			this.next(out);
		this.updateText();
	}

	/**
	 * @param {number} id 
	 * @returns {OptionNode}
	 */
	nodeById(id) {
		/** @type {Optional<OptionNode>} */
		let node = new Optional();
		each(this.nodes, (key, val) => {
			if (val.id === id) {
				node.Value = val;
				return false;
			}
		});
		if (!node.HasValue || !(node.Value instanceof OptionNode))
			throw new Error(`Node with id ${id} not found`);
		return node.Value;
	}

	jumpTo(toId) {
		each(this.nodes, (key, val) => {
			if (val.id === toId) {
				this.node(val);
				return false;
			}
		});
	}

	load(loadedFile, holdId, jumpToId) {
		if (typeof loadedFile === "string") {
			let found = false;
			for (let i = 0; i < this.loadedFiles.length && !found; ++i) {
				found = `json/${this.loadedFiles[i].name}` == loadedFile;
				if (found)
					loadedFile = this.loadedFiles[i];
			}
		}
		if (holdId) {
			this.fileStack.push({
				file: this.currentFile,
				id: holdId
			});
		}
		if (jumpToId > 0)
			this.import(loadedFile.json, jumpToId);
		else
			this.import(loadedFile.json);
		this.currentFile = loadedFile;
	}

	async returnToPrevious() {
		let target = this.fileStack.pop();
		await this.load(target.file);
		this.returnTo(target.id);
	};

	returnTo(id) {
		this.node(this.nodes[id]);
		this.next(this.nodes[id].outs()[0]);
	};

	next(source) {
		let to = null;
		if (source instanceof Output)
			to = source.to();
		else
			to = this.node().outs()[source].to();
		if (!to)
			return;
		if (this.node() instanceof OptionNode) {
			let on = /** @type {OptionNode} */ (this.node());
			let choice = null;
			if (on.options().length > 0)
				choice = on.options()[source].text();
			this.history.push({node:on,choice:choice});
		}
		this.node(to);
		let newTo = this.node().execute(this);
		if (newTo)
			this.next(newTo);
		else
			this.updateText();
	}

	updateText() {
		if (this.node() instanceof StoryNode)
			this.textStyle("italic");
		else
			this.textStyle("normal");
		document.getElementById("primaryText")?.scrollIntoView();
	}

	checkRequires(requires) {
		if (!requires || !requires.length)
			return true;
		for (let i = 0; i < requires.length; i++) {
			let variable = this.variableDatabase.variable(requires[i].variable);
			if (variable.type === "bool") {
				let boolVal = requires[i].value != 0
					&& requires[i].value.toLowerCase() !== "false";
				if (variable.value != boolVal)
					return false;
				else
					continue;
			}
			if (variable.value != requires[i].value)
				return false;
		}
		return true;
	};

	togglePanel(scope) {
		for (let i = 0; i < this.#panels.length; i++) {
			if (this.#panels[i] === scope)
				continue;
			this.#panels[i]("none");
		}
		if (scope() === "none")
			scope("block");
		else
			scope("none");
	};

	addRemoteFunction(name, expression) {
		if (name in this.remoteFunctions)
			console.error(`A function with the name ${name} has already been register to the app`);
		this.remoteFunctions[name] = expression;
	}

	remoteCall(name) {
		this.remoteFunctions[name](this);
	}

	parseText(text, scope) {
		let matches = text.match(/\{[a-zA-Z0-9\s]+\}/gi);
		if (matches) {
			for (let i = 0; i < matches.length; i++) {
				let varName = matches[i].substring(1, matches[i].length - 1);
				if (this.variableDatabase.exists(varName))
					text = text.replace(matches[i], this.variableDatabase.value(varName));
			}
		}
		return StringHelpers.nl2br(text);
	}

	/**
	 * @param {number} nodeId 
	 * @param {number} optionId 
	 */
	activateNodeOption(nodeId, optionId) {
		this.nodeById(nodeId).options()[optionId].active(true);
	}

	/**
	 * @param {number} nodeId 
	 * @param {number} optionId 
	 */
	deactivateNodeOption(nodeId, optionId) {
		this.nodeById(nodeId).options()[optionId].active(false);
	}

	/**
	 * @param {number} id 
	 * @return {string}
	 */
	characterName(id) {
		return this.characterDatabase.name(id);
	}

	/**
	 * @param {CoreNode} node 
	 * @returns {boolean}
	 */
	isOptionNode(node) {
		return node instanceof OptionNode;
	}
}

let application = new ViewApplication();
ko.applyBindings(application, document.body);

window.onerror = (msg, url, linenumber) => {
	alert(`Error message: ${msg}\nURL:${url}\nLine Number: ${linenumber}`);
	return false;
};

application.addRemoteFunction("yell", () => {
	alert("This is a remote function call");
});

(function() {
	let lf = /** @type {HTMLInputElement} */ (document.getElementById("loadFolder"));
	lf.onchange = async evt => {
		application.importFolder(evt);
		lf.style.display = "none";
	};
})();
