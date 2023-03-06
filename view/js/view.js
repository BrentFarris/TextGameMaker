function app() {
	this.characters = [];
	this.variables = {};
	this.nodes = {};
	this.node = ko.observable(null);
	this.backgroundImage = ko.observable("");
	this.backgroundImageBuffer = ko.observable("");
	this.backgroundImageBufferOpacity = ko.observable(0.0);
	this.backgroundImageOpacity = ko.observable(1.0);
	this.textStyle = ko.observable("normal");
	this.remoteFunctions = {};
	this.fileStack = [];
	this.currentFile = null;
	this.inventory = [];
	this.logs = ko.observableArray([]);
	this.openedLog = ko.observable(null);
	this.loadedFiles = [];

	this.statsPanelDisplay = ko.observable("none");
	this.inventoryPanelDisplay = ko.observable("none");
	this.logPanelDisplay = ko.observable("none");
	let panels = [this.statsPanelDisplay, this.inventoryPanelDisplay, this.logPanelDisplay];

	this.backgroundImage.subscribe(() => {
		this.backgroundImageBufferOpacity(1.0);
		this.backgroundImageOpacity(1.0);
		let changeBgmInterval = setInterval(() => {
			this.backgroundImageBufferOpacity(this.backgroundImageBufferOpacity() - 0.01);

			if (this.backgroundImageBufferOpacity() <= 0.0) {
				this.backgroundImageBufferOpacity(0.0);
				this.backgroundImageOpacity(1.0);
				clearInterval(changeBgmInterval);
			}
		}, 10);
	});

	this.importFolder = function(scope, event) {
		let files = event.target.files;
		for (let i = 0; i < files.length; i++) {
			if (files[i].type === "application/json") {
				let reader = new FileReader();
				reader.readAsText(files[i]);
				if (files[i].name === "meta.json") {
					reader.onload = (e) => this.importMeta(JSON.parse(e.target.result));
				} else {
					reader.onload = (e) => {
						let json = JSON.parse(e.target.result);
						this.loadedFiles.push({
							name: files[i].name,
							json: json
						});
						// Go through the nodes and find the start node
						let foundStart = false;
						for (let j = 0; j < json.nodes.length && !foundStart; j++) {
							if (json.nodes[j].type.toLowerCase() === "start") {
								this.loadedFiles[this.loadedFiles.length - 1].startId = json.nodes[j].id;
								foundStart = true;
							}
						}
						if (foundStart) {
							this.load(this.loadedFiles[this.loadedFiles.length - 1]);
						}
					};
				}
			} else if (files[i].type === "audio/mpeg" || files[i].type === "audio/wav") {
				let audio = new Audio();
				audio.src = URL.createObjectURL(files[i]);
				audio.load();
				// TODO:  Keep this guy around in the background
			} else if (files[i].type === "image/png" || files[i].type === "image/jpeg") {
				let img = new Image();
				img.src = URL.createObjectURL(files[i]);
				// TODO:  Keep this guy around in the background
			}
		}
	};

	this.importMeta = function(json) {
		if (json.variables) {
			for (let i = 0; i < json.variables.length; i++) {
				if (json.variables[i].name in this.variables) {
					continue;
				}

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

				this.variables[json.variables[i].name] = {
					type: type,
					value: value
				};
			}
		}

		if (json.characters) {
			this.characters = json.characters;
		}
	};

	this.import = function(json, jumpToId) {
		this.nodes = {};

		for (let i = 0; i < json.nodes.length; i++) {
			this.nodes[json.nodes[i].id] = new NodeTypeMap[json.nodes[i].type](json.nodes[i], this);
		}

		if (jumpToId > 0) {
			web2d.each(this.nodes, (key, val) => {
				val.initializeOuts(this.nodes);
			});
			this.jumpTo(jumpToId);
		} else {
			let jump = null;
			web2d.each(this.nodes, (key, val) => {
				val.initializeOuts(this.nodes);
				if (jump == null)
					jump = val;
				if (val instanceof StartNode && (jumpToId == null || jumpToId <= 0)) {
					jump = val;
				}
			});
			this.node(jump);
		}

		let out = this.node().execute(this);
		if (out) {
			this.next(out);
		}
		
		this.updateText();
	};

	this.nodeById = function(id) {
		let node = null;
		web2d.each(this.nodes, (key, val) => {
			if (val.id === id) {
				node = val;
				return false;
			}
		});
		return node;
	};

	this.jumpTo = function(toId) {
		web2d.each(this.nodes, (key, val) => {
			if (val.id === toId) {
				this.node(val);
				return false;
			}
		});
	};

	this.load = function(loadedFile, holdId, jumpToId) {
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
		if (jumpToId > 0) {
			this.import(loadedFile.json, jumpToId);
		} else {
			this.import(loadedFile.json);
		}
		this.currentFile = loadedFile;
	};

	this.returnToPrevious = async function() {
		let target = this.fileStack.pop();
		await this.load(target.file);
		this.returnTo(target.id);
	};

	this.returnTo = function(id) {
		this.node(this.nodes[id]);
		this.next(this.nodes[id].outs()[0]);
	};

	this.next = function(source) {
		let to = null;

		if (source instanceof Output) {
			to = source.to();
		} else {
			to = this.node().outs()[source].to();
		}

		if (!to) {
			return;
		}

		this.node(to);
		let newTo = this.node().execute(this);

		if (newTo) {
			this.next(newTo);
		} else {
			this.updateText();
		}
	};

	this.updateText = function() {
		if (this.node() instanceof StoryNode) {
			this.textStyle("italic");
		} else {
			this.textStyle("normal");
		}
	};

	this.checkRequires = function(requires) {
		if (!requires || !requires.length) {
			return true;
		}
		
		for (let i = 0; i < requires.length; i++) {
			let variable = this.variables[requires[i].variable];

			if (variable.type === "bool") {
				let boolVal = requires[i].value != 0 && requires[i].value.toLowerCase() !== "false";
				if (variable.value != boolVal) {
					return false;
				} else {
					continue;
				}
			}

			if (variable.value != requires[i].value) {
				return false;
			}
		}

		return true;
	};

	this.togglePanel = function(scope) {
		for (let i = 0; i < panels.length; i++) {
			if (panels[i] === scope) {
				continue;
			}

			panels[i]("none");
		}

		if (scope() === "none") {
			scope("block");
		} else {
			scope("none");
		}
	};

	this.addRemoteFunction = function(name, expression) {
		if (name in this.remoteFunctions) {
			console.error(`A function with the name ${name} has already been register to the app`);
		}

		this.remoteFunctions[name] = expression;
	};

	this.remoteCall = function(name) {
		this.remoteFunctions[name](this);
	};

	this.parseText = function(text, scope) {
		let matches = text.match(/\{[a-zA-Z0-9\s]+\}/gi);

		if (matches) {
			for (let i = 0; i < matches.length; i++) {
				let varName = matches[i].substring(1, matches[i].length - 1);
				if (varName in this.variables) {
					text = text.replace(matches[i], this.variables[varName].value);
				}
			}
		}
		
		return web2d.nl2br(text);
	};
}

let application = new app();
ko.applyBindings(application, document.body);

window.onerror = (msg, url, linenumber) => {
	alert(`Error message: ${msg}\nURL:${url}\nLine Number: ${linenumber}`);
	return false;
};

application.addRemoteFunction("yell", () => {
	alert("This is a remote function call");
});

function loadFolder(evt) {
	application.importFolder(null, evt)
}
