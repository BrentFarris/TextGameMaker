import { GameAudio } from "./engine/game_audio.js";
import { ArrayHelpers, each, random } from "./engine/std.js";
import { Application } from "./application.js";
import { Log } from "./database/log_database.js";

export const NODE_LINE_OFFSET = 10;

/**
 * Base class for values that are presented in nodes and read by the viewer
 * @class
 * @template T
 * @abstract
 */
export class ValueType {
	/** @type {KnockoutObservable<T>} */
	value = ko.observable(null);

	/** @type {string} */
	placeholder = "";

	/** @type {KnockoutObservable<string>} */
	hint = ko.observable("");

	/** @type {string} */
	prefix = "";

	/** @type {string} */
	postfix = "";

	/**
	 * @param {string} [placeholder] 
	 */
	constructor(placeholder) {
		this.placeholder = placeholder || "";
	}

	/**
	 * @returns {T}
	 */
	get Value() {
		return this.value();
	}

	/**
	 * @param {T} val
	 */
	set Value(val) {
		this.value(val);
	}

	get TypeName() {
		return this.constructor.name;
	}
}

/**
 * Shows checkbox in editor
 * @class
 * @extends ValueType<boolean>
 */
export class BoolValue extends ValueType {
	/**
	 * @param {string} prefix 
	 */
	constructor(prefix) {
		super();
		this.Value = false;
		this.prefix = prefix || "";
	}

	/**
	 * @returns {boolean}
	 */
	get Value() {
		return this.value();
	}

	/**
	 * @param {boolean} val
	 */
	set Value(val) {
		this.value(val);
	}
}

/**
 * Shows number input in editor
 * @class
 * @extends ValueType
 */
export class IntValue extends ValueType {
	/**
	 * @param {string} [placeholder] 
	 * @param {string} [prefix] 
	 */
	constructor(placeholder, prefix) {
		super(placeholder);
		if (!placeholder)
			this.Value = 0;
		this.prefix = prefix || "";
	}

	/**
	 * @returns {number}
	 */
	get Value() {
		return parseInt(this.value());
	}

	/**
	 * @param {number} val
	 */
	set Value(val) {
		this.value(val);
	}
}

/**
 * Base class for manager indexing
 * @class
 * @extends {ValueType<number>}
 * @abstract
 */
export class IndexValue extends ValueType {
	constructor() {
		super();
		this.Value = 0;
	}
}

/**
 * Shows text area input in editor
 * @extends ValueType
 * @class
 */
export class BigString extends ValueType {
	/**
	 * @param {string} [placeholder] 
	 */
	constructor(placeholder) {
		super();
		this.Value = "";
		this.placeholder = placeholder || "";
	}	
}

/**
 * Shows text input in editor
 * @class
 * @extends ValueType
 */
export class ShortString extends ValueType {
	/**
	 * @param {string} [placeholder] 
	 */
	constructor(placeholder) {
		super(placeholder);
		this.Value = "";
	}
}

/**
 * Shows number input in editor
 * @class
 * @extends {IndexValue}
 */
export class CharacterIndex extends IndexValue {
	constructor() {
		super();
		this.Value = 0;
	}
}

/**
 * Shows number input in editor
 * @class
 * @extends {IndexValue}
 */
export class BeastIndex extends IndexValue {
	constructor() {
		super();
		this.Value = 0;
	}
}

/**
 * Shows number input in editor
 * @class
 * @extends {IndexValue}
 */
export class ItemIndex extends IndexValue {
	constructor() {
		super();
		this.Value = 0;
	}
}

/**
 * Shows button in the editor to pick a node
 * @class
 * @extends IndexValue
 */
export class NodeIndex extends IndexValue {
	constructor() {
		super();
		this.Value = null;
	}
}

/**
 * Shows button in the editor to pick a node
 * @class
 * @extends ValueType
 */
export class NodeOptionIndex extends ValueType {
	constructor() {
		super();
		this.Value = null;
	}
}

/**
 * Shows a variable selection box in the editor
 * @class
 * @extends {IndexValue}
 */
export class VariableIndex extends IndexValue {
	/**
	 * @param {string} [prefix] 
	 * @param {string} [postfix] 
	 */
	constructor(prefix, postfix) {
		super();
		this.Value = 0;
		this.prefix = prefix || "";
		this.postfix = postfix || "";
	}
}

/**
 * Shows input text box to set the value of a variable
 * @class
 * @extends ValueType<string>
 */
export class VariableValueString extends ValueType {
	/** @type {KnockoutObservable<string>} */
	type = ko.observable("");

	/**
	 * @param {string} [placeholder] 
	 */
	constructor(placeholder) {
		super(placeholder);
	}

	/**
	 * @param {Application} app 
	 * @param {number} id 
	 */
	setType(app, id) {
		this.type(app.variableDatabase.type(id));
		this.Value = this.value();
	}

	/**
	 * @returns {string}
	 */
	get Value() {
		return this.value();
	}

	/**
	 * @param {string} val
	 */
	set Value(val) {
		if (val === null)
			return;
		switch(this.type()) {
			case "":
			case "string":
				this.value(String(val));
				break;
			case "whole":
				this.value(parseInt(val));
				break;
			case "number":
				this.value(parseFloat(val));
				break;
			case "bool":
				if (typeof val === "boolean")
					this.value(val);
				else if ((typeof val == "number" && val == 0) || val.toLowerCase() === "false")
					this.value(false);
				else
					this.value(true);
				break;
			case "char":
			case "beast":
			case "item":
				this.value(parseInt(val));
				break;
		}
	}
}

/**
 * Shows a conditional string option in the editor
 * @class
 */
export class ConditionString extends ValueType {
	/**
	 * @param {string} [placeholder] 
	 */
	constructor(placeholder) {
		super(placeholder);
		this.Value = "";
	}
}

/**
 * Represents a single output of a node
 * @class
 */
export class Output {
	/** @type {KnockoutObservable<CoreNode|null>} */
	to = ko.observable(null);

	constructor() {}
}

/**
 * The base class for all nodes
 * @class
 * @abstract
 */
export class CoreNode {
	/** @type {number} */
	id = 0;

	/** @type {number} */
	x = 0;

	/** @type {number} */
	y = 0;

	/** @type {string} */
	type = "";

	/** @type {ValueType[]} */
	fields = [];

	/** @type {KnockoutObservableArray<Output>} */
	outs = ko.observableArray();

	/** @type {Output[]} */
	tos;

	/**
	 * @param {CoreNode|number} createInfo
	 */
	constructor(createInfo) {
		this.type = this.TypeName;
		if (typeof createInfo === "number") {
			this.id = createInfo;
			this.outs.push(new Output());
		}
	}

	/**
	 * @param {CoreNode|number} info
	 * @protected
	 */
	_setup(info) {
		each(this, (key, val) => {
			if (val instanceof ValueType)
				this.fields.push(val);
		});
		if (typeof info === "number") {
			this._newInit();
			return;
		}
		this._init(info);
	}

	/**
	 * Abstract function to be called after the new node has been created
	 * @protected
	 */
	_newInit() { }

	/**
	 * @param {CoreNode} info
	 * @protected
	 */
	_init(info) {
		each(this, (key, val) => {
			if (val instanceof ValueType) {
				if (key in info)
					val.Value = info[key];
			}
		});
		this.id = info.id;
		this.x = info.x;
		this.y = info.y;
		this.tos = info.outs;
		if (info.outs.length == 0)
			this.outs.push(new Output());
		else {
			for (let i = 0; i < info.outs.length; i++)
				this.outs.push(new Output());
		}
	}

	/**
	 * @param {CoreNode[]} nodes 
	 */
	initializeOuts(nodes) {
		for (let i = 0; i < this.tos.length; i++) {
			if (this.tos[i] === null)
				continue;
			each(nodes, (key, val) => {
				if (val.id === this.tos[i]) {
					this.outs()[i].to(val);
					return false;
				}
			});
		}
		//ArrayHelpers.clear(this.tos);
	}

	/**
	 * @returns {Object}
	 */
	serialize() {
		let obj = {};
		each(this, (key, val) => {
			if (key === "outs") {
				obj.outs = [];
				for (let i = 0; i < this.outs().length; i++) {
					let to = this.outs()[i].to();
					if (!to) {
						obj.outs.push(null);
						continue;
					}
					obj.outs.push(to.id);
				}
				return null;
			} else if (key === "fields") {
				return null;
			} else if (val instanceof ValueType) {
				obj[key] = val.Value;
				return null;
			}
			obj[key] = val;
		});
		return JSON.parse(JSON.stringify(obj));
	}

	/**
	 * Used to set the color of the handle/title bar of the node
	 * @returns {string}
	 * @protected
	 * @virtual
	 */
	get Color() {
		return "grey";
	}

	/**
	 * @returns {string}
	 */
	get TypeName() {
		return this.constructor.name.replace("Node", "");
	}

	/**
	 * Virtual base function to be called when the node is executed
	 * @param {Application} app 
	 * @virtual
	 */
	execute(app) { }
}

/**
 * @typedef {Object} NodeOptionEntry
 * @property {KnockoutObservable<string>} text
 * @property {KnockoutObservable<boolean>} active
 */

/**
 * Base representation of a node that can have options/choices
 * @class
 * @extends {CoreNode}
 * @abstract
 */
export class OptionNode extends CoreNode {
	/** @type {KnockoutObservableArray<NodeOptionEntry>} */
	options = ko.observableArray();

	/**
	 * @param {OptionNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
	}

	/**
	 * @param {string} text 
	 * @param {boolean} active 
	 */
	_addOption(text, active) {
		this.options.push({text:ko.observable(text),active:ko.observable(active)});
	}

	/**
	 * @param {OptionNode} info 
	 */
	_init(info) {
		super._init(info);
		for (let i = 0; i < info.options.length; i++)
			this._addOption(info.options[i].text, info.options[i].active);
	}

	/**
	 * Add an option to this node and create an output for it
	 */
	addOption() {
		this._addOption("", true);
		if (this.options().length > 1)
			this.outs.push(new Output());
	}
	
	/**
	 * @param {number} index 
	 * @param {HTMLInputElement} elm 
	 */
	toggleActive(index, elm) {
		// This is nonsense, but KO is trippin, probably because I'm trippin...
		setTimeout(() => {
			elm.checked = this.options()[index].active();
		}, 10);
	}

	/**
	 * @param {number} index 
	 */
	removeOption(index) {
		if (index === -1) {
			return;
		}
		this.options.splice(index, 1);
		if (this.options().length >= 1) {
			// Add one because the first one is the standard out
			this.outs.splice(index, 1);
		}
	}

	/**
	 * @returns {Object}
	 */
	serialize() {
		let obj = super.serialize();
		obj.options = [];
		for (let i = 0; i < this.options().length; i++) {
			obj.options.push({text:this.options()[i].text(),active:this.options()[i].active()});
		}
		return obj;
	}
}

/**
 * A dialog node which is used to allow for a character to speak
 * @class
 * @extends {OptionNode}
 */
export class DialogNode extends OptionNode {
	/** @type {CharacterIndex} */
	character = new CharacterIndex();

	/** @type {BigString} */
	text = new BigString();

	/**
	 * @param {DialogNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}
}

/**
 * A story node which is used to display a story message
 * @class
 * @extends {OptionNode}
 */
export class StoryNode extends OptionNode {
	/** @type {BigString} */
	text = new BigString();

	/**
	 * @param {StoryNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "darkcyan";
	}
}

/**
 * A node that can be used as a junction or as a base node, when this node
 * executes, it simply moves on to the first output
 * @class
 * @extends {CoreNode}
 */
export class PassNode extends CoreNode {
	/**
	 * @param {PassNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		// Only call setup from the farthest child class
		if (this.TypeName === "Pass") {
			super._setup(createInfo);
		}
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		return this.outs()[0];
	}
}

/**
 * A node that denotes this is the start of the text based adventure, there
 * should only be one of these nodes in the whole game
 * @class
 */
export class StartNode extends PassNode {
	/**
	 * @param {StartNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "green";
	}
}

/**
 * A node that is used to add log entries to the player's log. This is something
 * that they can view at any time by pulling up their log.
 * @class
 * @extends {PassNode}
 */
export class LogNode extends PassNode {
	/**
	 * @param {LogNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		this.title = new ShortString();
		this.text = new BigString();
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "darkgoldenrod";
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		app.logDatabase.add(new Log(app.logDatabase.NextId, this.title.Value, this.text.Value));
		return super.execute(app);
	}
}

/**
 * A node that is used as a comment in the editor so that the writer is able
 * to leave notes for themselves
 * @class
 * @extends {PassNode}
 */
export class CommentNode extends PassNode {
	/**
	 * 
	 * @param {CommentNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		this.text = new BigString();
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "red";
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to set the value of a variable
 * @class
 * @extends {PassNode}
 */
export class VariableNode extends PassNode {
	/**
	 * @param {VariableNode} createInfo 
	 * @param {Application} app 
	 */
	constructor(createInfo, app) {
		super(createInfo);
		this.key = new VariableIndex("", "=");
		this.value = new VariableValueString();
		this.key.value.subscribe((val) => {
			this.value.setType(app, val);
		});
		if (this.TypeName === "Variable")
			super._setup(createInfo);
	}

	/**
	 * @param {Application} app 
	 * @param {ValueType} scope 
	 */
	changedVar(app, scope) {
		this.value.setType(app, scope.Value);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "darkviolet";
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let variable = app.variableDatabase.variable(this.key.Value);
		variable.value = this.value.Value;
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to copy the value of one variable to another
 * @class
 * @extends {PassNode}
 */
export class CopyVariableToVariableNode extends PassNode {
	/** @type {VariableIndex} */
	from = new VariableIndex("From:");

	/** @type {VariableIndex} */
	to = new VariableIndex("To:");

	/**
	 * @param {CopyVariableToVariableNode} createInfo 
	 * @param {Application} app 
	 */
	constructor(createInfo, app) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app 
	 * @param {ValueType} scope 
	 */
	changedVar(app, scope) { }

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "darkviolet";
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		app.variableDatabase.setValue(this.to.Value,
			app.variableDatabase.value(this.from.Value));
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to add a value to a variable
 * @class
 * @extends {VariableNode}
 */
export class AddToVariableNode extends VariableNode {
	/**
	 * @param {AddToVariableNode} createInfo 
	 * @param {Application} app 
	 */
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "purple";
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let variable = app.variableDatabase.variable(this.key.Value);
		switch (variable.type) {
			case "number":
			case "whole":
			case "text":
				variable.value += this.value.Value;
				break;
			case "bool":
				console.error("Can not use a boolean for the AddVariable node");
				break;
			default:
				console.error(`${variable.type} not yet supported for the AddVariable node`);
				break;
		}
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to add the value of one variable to another
 * @class
 * @extends {PassNode}
 */
export class AddVariableToVariableNode extends PassNode {
	/** @type {VariableIndex} */
	alter = new VariableIndex("Add:");

	/** @type {VariableIndex} */
	source = new VariableIndex("To:");

	/**
	 * @param {AddVariableToVariableNode} createInfo
	 * @param {Application} app
	 */
	constructor(createInfo, app) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app
	 * @param {ValueType} scope
	 */
	changedVar(app, scope) { }
	
	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "purple";
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let leftHand = app.variableDatabase.variable(this.source.Value);
		let rightHand = app.variableDatabase.variable(this.alter.Value);
		switch (leftHand.type) {
			case "number":
			case "whole":
			case "text":
			leftHand.value += rightHand.value;
				break;
			case "bool":
				console.error("Can not use a boolean for the AddVariable node");
				break;
			default:
				console.error(`${leftHand.type} not yet supported for the AddVariable node`);
				break;
		}
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to subtract a value from a variable
 * @class
 * @extends {PassNode}
 */
export class SubVariableFromVariableNode extends PassNode {
	/** @type {VariableIndex} */
	alter = new VariableIndex("Subtract:");

	/** @type {VariableIndex} */
	source = new VariableIndex("From:");

	/**
	 * @param {SubVariableFromVariableNode} createInfo
	 * @param {Application} app
	 */
	constructor(createInfo, app) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app
	 * @param {ValueType} scope
	 */
	changedVar(app, scope) { }

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "purple";
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let leftHand = app.variableDatabase.variable(this.source.Value);
		let rightHand = app.variableDatabase.variable(this.alter.Value);
		switch (leftHand.type) {
			case "number":
			case "whole":
			case "text":
			leftHand.value -= rightHand.value;
				break;
			case "bool":
				console.error("Can not use a boolean for the AddVariable node");
				break;
			default:
				console.error(`${leftHand.type} not yet supported for the AddVariable node`);
				break;
		}
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to assign a random value to a variable
 * @class
 * @extends {PassNode}
 */
export class RandomVariableNode extends PassNode {
	/** @type {VariableIndex} */
	key = new VariableIndex("", "=");

	/** @type {VariableValueString} */
	min = new VariableValueString("Minimum value");

	/** @type {VariableValueString} */
	max = new VariableValueString("Maximum value");

	/**
	 * @param {RandomVariableNode} createInfo
	 * @param {Application} app
	 */
	constructor(createInfo, app) {
		super(createInfo);
		this.key.value.subscribe((val) => {
			this.min.setType(app, val);
			this.max.setType(app, val);
		});
		if (this.TypeName === "RandomVariable") {
			super._setup(createInfo);
		}
	}

	/**
	 * @param {Application} app
	 * @param {ValueType} scope
	 */
	changedVar(app, scope) {
		this.min.setType(app, scope.Value);
		this.max.setType(app, scope.Value);
	}
	
	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "purple";
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let variable = app.variableDatabase.variable(this.key.Value);
		switch (variable.type) {
			case "number":
			case "whole":
				variable.value = random(parseFloat(this.min.Value), parseFloat(this.max.Value));
				break;
			case "text":
			case "bool":
				console.error("Can not use a text or bool for the AddRandomVariableNode node");
				break;
			default:
				console.error(`${variable.type} not yet supported for the AddRandomVariableNode node`);
				break;
		}
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to add a random value to a variable
 * @class
 * @extends {RandomVariableNode}
 */
export class AddRandomToVariableNode extends RandomVariableNode {
	/**
	 * @param {AddRandomToVariableNode} createInfo 
	 * @param {Application} app 
	 */
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let variable = app.variableDatabase.variable(this.key.Value);
		switch (variable.type) {
			case "number":
			case "whole":
				variable.value += random(parseFloat(this.min.Value), parseFloat(this.max.Value));
				break;
			case "text":
			case "bool":
				console.error("Can not use a text or bool for the AddRandomVariableNode node");
				break;
			default:
				console.error(`${variable.type} not yet supported for the AddRandomVariableNode node`);
				break;
		}
		return super.execute(app);
	}
}

/**
 * A base node for nodes that require a source (image, sound, etc.)
 * @class
 * @extends {PassNode}
 * @abstract
 */
export class SourceNode extends PassNode {
	/** @type {ShortString} */
	src = new ShortString("Source:");

	/**
	 * @param {SourceNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
	}
}

/**
 * A node that allows the writer to play a sound
 * @class
 * @extends {SourceNode}
 */
export class SoundNode extends SourceNode {
	/** @type {GameAudio|null} */
	static #current = null;

	/**
	 * @param {SoundNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "blue";
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		if (SoundNode.#current)
			SoundNode.#current.stop();
		let elm = app.media.audioDatabase.elm(this.src.Value);
		let sound = new GameAudio(elm);
		sound.play();
		SoundNode.#current = sound;
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to play music
 * @class
 * @extends {SourceNode}
 */
export class MusicNode extends SourceNode {
	/**
	 * @param {MusicNode} createInfo 
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "blue";
	}

	/**
	 * @param {Application} app 
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		if (app.media.bgm) {
			app.media.bgm.stop();
			app.media.bgm = null;
		}
		if (this.src.Value) {
			let elm = app.media.audioDatabase.elm(this.src.Value);
			app.media.bgm = new GameAudio(elm);
			app.media.bgm.setLoopCount(0);
			app.media.bgm.play();
		}
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to change the availability of a given option
 * on a node that has options. This displays a button for the writer to click
 * on to select which option to control the availability of.
 * @class
 * @extends {PassNode}
 */
export class OptionAvailabilityNode extends PassNode {
	/**
	 * @type {NodeOptionIndex}
	 */
	constructor(createInfo) {
		super(createInfo);
		this.optionIdx = new NodeOptionIndex();
		this.active = new BoolValue("Activate?");
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "gray";
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		if (this.active.Value)
			app.activateNodeOption(this.optionIdx.Value.id, this.optionIdx.Value.option);
		else
			app.deactivateNodeOption(this.optionIdx.Value.id, this.optionIdx.Value.option);
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to jump to a given node in a given file
 * @class
 * @extends {SourceNode}
 */
export class JumpNode extends SourceNode {
	/**
	 * @type {IntValue}
	 */
	constructor(createInfo) {
		super(createInfo);
		this.nodeId = new IntValue();
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "black";
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		if (!this.src.Value) {
			app.jumpTo(this.nodeId.Value);
		} else {
			// Check to see if this.src.Value ends with .json
			if (this.src.Value.endsWith(".json"))
				app.load(`${this.src.Value}`, this.id, this.nodeId.Value);
			else
				app.load(`${this.src.Value}.json`, this.id, this.nodeId.Value);
		}
		return null;
	}
}

/**
 * A node that allows the writer to go back and continue from a jump node
 * @class
 * @extends {PassNode}
 */
export class ReturnNode extends PassNode {
	/**
	 * @param {ReturnNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app 
	 * @return {Output}
	 * @override
	 */
	execute(app) {
		app.returnToPrevious();
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to change the background image
 * @class
 * @extends {SourceNode}
 */
export class BackgroundNode extends SourceNode {
	/** @type {BoolValue} */
	forceFit = new BoolValue("Force fit:");

	/**
	 * @param {BackgroundNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @returns {string}
	 * @override
	 */
	get Color() {
		return "olivedrab";
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		app.media.backgroundImageBuffer(app.media.backgroundImage());
		let url = "";
		if (this.src.Value && this.src.Value.trim().length > 0)
			url = app.media.imageDatabase.url(this.src.Value);
		app.media.backgroundImage(url);
		app.media.backgroundImageForceFit(this.forceFit.Value);
		return super.execute(app);
	}
}

/**
 * A node that allows the writer to branch given a condition on a variable
 * @class
 * @extends {VariableNode}
 */
export class IfVariableNode extends VariableNode {
	/** @type {ConditionString} */
	condition = new ConditionString();

	/**
	 * @param {IfVariableNode} createInfo
	 * @param {Application} app
	 */
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
		let target = this.fields[this.fields.length - 1];
		this.fields[this.fields.length - 1] = this.fields[this.fields.length - 2];
		this.fields[this.fields.length - 2] = target;
	}

	/**
	 * @override
	 */
	_newInit() {
		this.outs.push(new Output());
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let result = false;
		let val = app.variableDatabase.value(this.key.Value);
		switch (this.condition.Value) {
			case "==":
				result = val === this.value.Value;
				break;
			case "!=":
				result = val !== this.value.Value;
				break;
			case "<=":
				result = val <= this.value.Value;
				break;
			case ">=":
				result = val >= this.value.Value;
				break;
			case "<":
				result = val < this.value.Value;
				break;
			case ">":
				result = val > this.value.Value;
				break;
		}
		if (result) {
			return this.outs()[0];
		} else {
			return this.outs()[1];
		}
	}
}

/**
 * A node that allows the writer to branch given a condition on two variables
 * @class
 * @extends {PassNode}
 */
export class CompareVariableNode extends PassNode {
	/** @type {VariableIndex} */
	a = new VariableIndex();

	/** @type {ConditionString} */
	condition = new ConditionString();

	/** @type {VariableIndex} */
	b = new VariableIndex();

	/**
	 * @param {CompareVariableNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}
	
	/**
	 * @param {Application} app
	 * @param {ValueType} scope
	 */
	changedVar(app, scope) { }

	/**
	 * @override
	 */
	_newInit() {
		this.outs.push(new Output());
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let result = false;
		let a = app.variableDatabase.value(this.a.Value);
		let b = app.variableDatabase.value(this.b.Value);
		switch (this.condition.Value) {
			case "==":
				result = a === b;
				break;
			case "!=":
				result = a !== b;
				break;
			case "<=":
				result = a <= b;
				break;
			case ">=":
				result = a >= b;
				break;
			case "<":
				result = a < b;
				break;
			case ">":
				result = a > b;
				break;
		}
		if (result) {
			return this.outs()[0];
		} else {
			return this.outs()[1];
		}
	}
}

/**
 * A node that allows the writer to call a custom registered JavaScript function
 * @class
 * @extends {PassNode}
 */
export class FunctionCallNode extends PassNode {
	/**
	 * @param {FunctionCallNode} createInfo
	 * @param {Application} app
	 */
	constructor(createInfo, app) {
		super(createInfo);
		this.functionName = new ShortString();
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 */
	execute(app) {
		app.remoteCall(this.functionName.Value);
		return super.execute(app);
	}
}

/**
 * A node that will create a number of outputs that are not bound to an
 * option/choice that the player can make
 * @class
 * @extends {PassNode}
 * @abstract
 */
export class OutsNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo);
	}

	/**
	 * 
	 */
	addOut() {
		this.outs.push(new Output());
	}

	/**
	 * 
	 */
	removeOut(target) {
		this.outs.remove(target);
	}
}

/**
 * A node that can have a series of outputs and one will be chosen at random
 * @class
 * @extends {OutsNode}
 */
export class RandomNode extends OutsNode {
	/**
	 * @param {RandomNode} createInfo
	 * @param {Application} app
	 */
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The randomly selected output from the list of outs
	 * @override
	 */
	execute(app) {
		let outs = this.outs();
		return outs[random(0, outs.length)];
	}
}

/**
 * The base node for inventory nodes
 * @class
 * @extends {PassNode}
 * @abstract
 */
export class InventoryNode extends PassNode {
	/** @type {ItemIndex} */
	inventory = new ItemIndex();

	/**
	 * @param {InventoryNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
	}
}

/**
 * A node that adds an item to the inventory
 * @class
 * @extends {InventoryNode}
 */
export class InventoryAddNode extends InventoryNode {
	/**
	 * @param {InventoryAddNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		let item = app.itemDatabase.item(this.inventory.Value);
		app.inventory.add(item);
		return super.execute(app);
	}
}

/**
 * A node that removes an item from the inventory
 * @class
 * @extends {InventoryNode}
 */
export class InventoryRemoveNode extends InventoryNode {
	/**
	 * @param {InventoryRemoveNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output
	 * @override
	 */
	execute(app) {
		app.inventory.removeMatching(this.inventory.Value);
		return super.execute(app);
	}
}

/**
 * A node that checks if an item is in the inventory
 * @class
 * @extends {InventoryNode}
 */
export class InventoryExistsNode extends InventoryNode {
	/**
	 * @param {InventoryExistsNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	/**
	 * @override
	 */
	_newInit() {
		this.outs.push(new Output());
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output if the item is in the inventory, the second output otherwise
	 */
	execute(app) {
		if (app.inventory.exists(this.inventory.Value))
			return this.outs()[0];
		else
			return this.outs()[1];
	}
}

/**
 * A node that checks the number of items in the inventory
 * @class
 * @extends {InventoryNode}
 */
export class InventoryCountNode extends InventoryNode {
	/**
	 * @param {InventoryCountNode} createInfo
	 */
	constructor(createInfo) {
		super(createInfo);
		this.condition = new ConditionString();
		this.value = new IntValue();
		super._setup(createInfo);
	}

	/**
	 * @override
	 */
	_newInit() {
		this.outs.push(new Output());
	}

	/**
	 * @param {Application} app
	 * @returns {Output} The first output if the condition is met, the second output otherwise
	 * @override
	 */
	execute(app) {
		let result = false;
		let count = 0;
		if (app.inventory.exists(this.inventory.Value))
			count = app.inventory.count(this.inventory.Value);
		switch (this.condition.Value) {
			case "==":
				result = count === this.value.Value;
				break;
			case "!=":
				result = count !== this.value.Value;
				break;
			case "<=":
				result = count <= this.value.Value;
				break;
			case ">=":
				result = count >= this.value.Value;
				break;
			case "<":
				result = count < this.value.Value;
				break;
			case ">":
				result = count > this.value.Value;
				break;
		}
		if (result)
			return this.outs()[0];
		else
			return this.outs()[1];
	}
}

export const NodeTypeMap = {
	"AddRandomToVariable": AddRandomToVariableNode,
	"AddToVariable": AddToVariableNode,
	"AddVariableToVariable": AddVariableToVariableNode,
	"Background": BackgroundNode,
	"Comment": CommentNode,
	"CompareVariable": CompareVariableNode,
	"CopyVariableToVariable": CopyVariableToVariableNode,
	"Dialog": DialogNode,
	"FunctionCall": FunctionCallNode,
	"IfVariable": IfVariableNode,
	"InventoryAdd": InventoryAddNode,
	"InventoryCount": InventoryCountNode,
	"InventoryExists": InventoryExistsNode,
	"InventoryRemove": InventoryRemoveNode,
	"Jump": JumpNode,
	"Log": LogNode,
	"Music": MusicNode,
	"OptionAvailability": OptionAvailabilityNode,
	"Pass": PassNode,
	"Random": RandomNode,
	"RandomVariable": RandomVariableNode,
	"Return": ReturnNode,
	"Sound": SoundNode,
	"Start": StartNode,
	"Story": StoryNode,
	"SubVariableFromVariable": SubVariableFromVariableNode,
	"Variable": VariableNode
};