class ValueType {
	constructor(placeholder) {
		this.value = ko.observable(null);
		this.placeholder = ko.observable(placeholder || "");
		this.hint = ko.observable("");
	}

	get Value() {
		return this.value();
	}

	set Value(val) {
		this.value(val);
	}
}

class IntValue extends ValueType {
	constructor(placeholder) {
		super(placeholder);
		this.Value = 0;
	}

	get Value() {
		return parseInt(this.value());
	}

	set Value(val) {
		this.value(val);
	}
}

class IndexValue extends ValueType {
	constructor() {
		super();
		this.Value = 0;
	}
}

class BigString extends ValueType {
	constructor(placeholder) {
		super(placeholder);
		this.Value = "";
	}	
}

class ShortString extends ValueType {
	constructor(placeholder) {
		super(placeholder);
		this.Value = "";
	}
}

class CharacterIndex extends IndexValue {
	constructor() {
		super();
		this.Value = 0;
	}
}

class BeastIndex extends IndexValue {
	constructor() {
		super();
		this.Value = 0;
	}
}

class ItemIndex extends IndexValue {
	constructor() {
		super();
		this.Value = 0;
	}
}

class VariableString extends ValueType {
	constructor(hint) {
		super();
		this.Value = "";
		this.hint = hint || "";
	}
}

class VariableValueString extends ValueType {
	constructor(placeholder) {
		super(placeholder);
		this._type = ko.observable("");
	}

	setType(app, varName) {
		if (typeof app.variables === "function") {
			let vars = app.variables();
			for (let i = 0; i < vars.length; i++) {
				if (vars[i].name !== varName) {
					continue;
				}
				
				this._type(vars[i].type);
				break;
			}
		} else {
			this._type(app.variables[varName].type);
		}

		this.Value = this.value();
	}

	get Value() {
		return this.value();
	}

	set Value(val) {
		if (val === null) {
			return;
		}

		switch(this._type()) {
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
				if (typeof val === "boolean") {
					this.value(val);
				} else if (val == 0 || val.toLowerCase() === "false") {
					this.value(false);
				} else {
					this.value(true);
				}
				break;
			case "char":
			case "beast":
			case "item":
				this.value(parseInt(val));
				break;
		}
	}
}

class ConditionString extends ValueType {
	constructor(placeholder) {
		super(placeholder);
		this.Value = "";
	}
}

class Output {
	constructor() {
		this.to = ko.observable(null);
	}
}

class CoreNode {
	constructor(createInfo) {
		this.type = this.typeName;
		this.fields = [];
		this.outs = ko.observableArray([]);

		if (typeof createInfo === "number") {
			this.id = createInfo;
			this.x = 0;
			this.y = 0;
			this.outs.push(new Output());
		}
	}

	_setup(info) {
		web2d.each(this, (key, val) => {
			if (val instanceof ValueType) {
				this.fields.push(val);
			}
		});
		
		if (typeof info === "number") {
			this._newInit();
			return;
		}

		this._init(info);
	}

	_newInit() { }

	_init(info) {
		web2d.each(this, (key, val) => {
			if (val instanceof ValueType) {
				if (key in info) {
					val.Value = info[key];
				}
			}
		});

		this.id = info.id;
		this.x = info.x;
		this.y = info.y;
		this.tos = info.outs;

		for (let i = 0; i < info.outs.length; i++) {
			this.outs.push(new Output());
		}

		if (!info.outs.length) {
			this.outs.push(new Output());
		}
	}

	initializeOuts(nodes) {
		for (let i = 0; i < this.tos.length; i++) {
			if (this.tos[i] === null) {
				continue;
			}

			web2d.each(nodes, (key, val) => {
				if (val.id === this.tos[i]) {
					this.outs()[i].to(val);
					return false;
				}
			});

		}

		delete this.tos;
	}

	serialize() {
		let obj = {};
		web2d.each(this, (key, val) => {
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

				return;
			} else if (key === "fields") {
				return;
			} else if (val instanceof ValueType) {
				obj[key] = val.Value;
				return;
			}

			obj[key] = val;
		});

		return JSON.parse(JSON.stringify(obj));
	}

	get color() {
		return "grey";
	}

	get typeName() {
		return this.constructor.name.replace("Node", "");
	}

	execute(app) { }
}

class OptionNode extends CoreNode {
	constructor(createInfo) {
		super(createInfo);
		this.options = ko.observableArray([]);
	}

	_init(info) {
		super._init(info);
		
		for (let i = 0; i < info.options.length; i++) {
			this.options.push(ko.observable(info.options[i]));
		}
	}

	addOption() {
		this.options.push(ko.observable(""));

		if (this.options().length > 1) {
			this.outs.push(new Output());
		}
	}

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

	serialize() {
		let obj = super.serialize();
		obj.options = [];

		for (let i = 0; i < this.options().length; i++) {
			obj.options.push(this.options()[i]());
		}

		return obj;
	}
}

class DialogNode extends OptionNode {
	constructor(createInfo) {
		super(createInfo);
		this.character = new CharacterIndex();
		this.text = new BigString();
		super._setup(createInfo);
	}
}

class StoryNode extends OptionNode {
	constructor(createInfo) {
		super(createInfo);
		this.text = new BigString();
		super._setup(createInfo);
	}

	get color() {
		return "darkcyan";
	}
}

class PassNode extends CoreNode {
	constructor(createInfo) {
		super(createInfo);

		// Only call setup from the farthest child class
		if (this.typeName === "Pass") {
			super._setup(createInfo);
		}
	}

	execute(app) {
		return this.outs()[0];
	}
}

class StartNode extends PassNode {
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	get color() {
		return "green";
	}
}

class LogNode extends PassNode {
	constructor(createInfo) {
		super(createInfo);
		this.title = new ShortString();
		this.text = new BigString();
		super._setup(createInfo);
	}

	get color() {
		return "darkgoldenrod";
	}

	execute(app) {
		app.logs.shift({
			title: this.title.Value,
			text: this.text.Value
		});

		return super.execute(app);
	}
}

class TodoNode extends PassNode {
	constructor(createInfo) {
		super(createInfo);
		this.todo = new BigString();
		super._setup(createInfo);
	}

	get color() {
		return "red";
	}

	execute(app) {
		alert(`TODO:  ${this.todo.Value}`);
		return super.execute(app);
	}
}

class VariableNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo);
		this.key = new VariableString();
		this.value = new VariableValueString();
		this.key.value.subscribe((val) => {
			this.value.setType(app, val);
		});

		if (this.typeName === "Variable") {
			super._setup(createInfo);
		}
	}

	changedVar(app, scope) {
		this.value.setType(app, scope.Value);
	}

	get color() {
		return "darkviolet";
	}

	execute(app) {
		let variable = app.variables[this.key.Value];
		variable.value = this.value.Value;
		return super.execute(app);
	}
}

class CopyVariableToVariableNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo);
		this.from = new VariableString("From:");
		this.to = new VariableString("To:");
		super._setup(createInfo);
	}

	changedVar(app, scope) { }

	get color() {
		return "darkviolet";
	}

	execute(app) {
		app.variables[this.to.Value].value = app.variables[this.from.Value].value;
		return super.execute(app);
	}
}

class AddToVariableNode extends VariableNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}
	
	get color() {
		return "purple";
	}

	execute(app) {
		let variable = app.variables[this.key.Value];

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

		console.log(`Updated the variable ${this.key.Value} to ${variable.value}`);
		return super.execute(app);
	}
}

class AddVariableToVariableNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.alter = new VariableString("Add:");
		this.source = new VariableString("To:");
		super._setup(createInfo);
	}

	changedVar(app, scope) { }
	
	get color() {
		return "purple";
	}

	execute(app) {
		let leftHand = app.variables[this.source.Value];
		let rightHand = app.variables[this.alter.Value];

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

		console.log(`Updated the variable ${this.source.Value} to ${leftHand.value}`);
		return super.execute(app);
	}
}

class SubVariableFromVariableNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.alter = new VariableString("Subtract:");
		this.source = new VariableString("From:");
		super._setup(createInfo);
	}

	changedVar(app, scope) { }

	get color() {
		return "purple";
	}

	execute(app) {
		let leftHand = app.variables[this.source.Value];
		let rightHand = app.variables[this.alter.Value];

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

		console.log(`Updated the variable ${this.source.Value} to ${leftHand.value}`);
		return super.execute(app);
	}
}

class RandomVariableNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.key = new VariableString();
		this.min = new VariableValueString("Minimum value");
		this.max = new VariableValueString("Maximum value");
		this.key.value.subscribe((val) => {
			this.min.setType(app, val);
			this.max.setType(app, val);
		});

		if (this.typeName === "RandomVariable") {
			super._setup(createInfo);
		}
	}

	changedVar(app, scope) {
		this.min.setType(app, scope.Value);
		this.max.setType(app, scope.Value);
	}
	
	get color() {
		return "purple";
	}

	execute(app) {
		let variable = app.variables[this.key.Value];

		switch (variable.type) {
			case "number":
			case "whole":
				variable.value = random(this.min.Value, this.max.Value);
				break;
			case "text":
			case "bool":
				console.error("Can not use a text or bool for the AddRandomVariableNode node");
				break;
			default:
				console.error(`${variable.type} not yet supported for the AddRandomVariableNode node`);
				break;
		}

		console.log(`Updated the variable ${this.key.Value} to ${variable.value}`);
		return super.execute(app);
	}
}

class AddRandomToVariableNode extends RandomVariableNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	execute(app) {
		let variable = app.variables[this.key.Value];

		switch (variable.type) {
			case "number":
			case "whole":
				variable.value += random(this.min.Value, this.max.Value);
				break;
			case "text":
			case "bool":
				console.error("Can not use a text or bool for the AddRandomVariableNode node");
				break;
			default:
				console.error(`${variable.type} not yet supported for the AddRandomVariableNode node`);
				break;
		}

		console.log(`Updated the variable ${this.key.Value} to ${variable.value}`);
		return super.execute(app);
	}
}

class SourceNode extends PassNode {
	constructor(createInfo, placeholder) {
		super(createInfo);
		this.src = new ShortString(placeholder);
	}
}

class SoundNode extends SourceNode {
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	get color() {
		return "blue";
	}

	execute(app) {
		let sound = new web2d.audio(`audio/${this.src.Value}`);
		sound.play();
		return super.execute(app);
	}
}

class MusicNode extends SourceNode {
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	get color() {
		return "blue";
	}

	execute(app) {
		if (app.bgm) {
			app.bgm.stop();
			app.bgm = null;
		}

		if (this.src.Value) {
			app.bgm = new web2d.audio(`audio/${this.src.Value}`);
			app.bgm.setLoopCount(0);
			app.bgm.play();
		}
		
		return super.execute(app);
	}
}

class JumpNode extends SourceNode {
	constructor(createInfo) {
		super(createInfo, "File or blank for this file...");
		this.nodeId = new IntValue();
		super._setup(createInfo);
	}

	get color() {
		return "black";
	}

	execute(app) {
		if (!this.src.Value && this.nodeId.Value > 0) {
			app.jumpTo(this.nodeId.Value);
		} else {
			app.load(`json/${this.src.Value}`, this.id, this.nodeId.Value);
		}
	}
}

class ReturnNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	execute(app) {
		app.returnToPrevious();
	}
}

class BackgroundNode extends SourceNode {
	constructor(createInfo) {
		super(createInfo);
		super._setup(createInfo);
	}

	get color() {
		return "olivedrab";
	}

	execute(app) {
		app.backgroundImageBuffer(app.backgroundImage());
		app.backgroundImage(`img/${this.src.Value}`);
		return super.execute(app);
	}
}

class IfVariableNode extends VariableNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.condition = new ConditionString();
		super._setup(createInfo);

		let target = this.fields[this.fields.length - 1];
		this.fields[this.fields.length - 1] = this.fields[this.fields.length - 2];
		this.fields[this.fields.length - 2] = target;
	}

	_newInit() {
		this.outs.push(new Output());
	}

	execute(app) {
		let result = false;
		switch (this.condition.Value) {
			case "==":
				result = app.variables[this.key.Value].value === this.value.Value;
				break;
			case "!=":
				result = app.variables[this.key.Value].value !== this.value.Value;
				break;
			case "<=":
				result = app.variables[this.key.Value].value <= this.value.Value;
				break;
			case ">=":
				result = app.variables[this.key.Value].value >= this.value.Value;
				break;
			case "<":
				result = app.variables[this.key.Value].value < this.value.Value;
				break;
			case ">":
				result = app.variables[this.key.Value].value > this.value.Value;
				break;
		}

		if (result) {
			return this.outs()[0];
		} else {
			return this.outs()[1];
		}
	}
}

class CompareVariableNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.a = new VariableString();
		this.condition = new ConditionString();
		this.b = new VariableString();
		super._setup(createInfo);
	}
	
	changedVar(app, scope) { }

	_newInit() {
		this.outs.push(new Output());
	}

	execute(app) {
		let result = false;
		switch (this.condition.Value) {
			case "==":
				result = app.variables[this.a.Value].value === app.variables[this.b.Value].value;
				break;
			case "!=":
				result = app.variables[this.a.Value].value !== app.variables[this.b.Value].value;
				break;
			case "<=":
				result = app.variables[this.a.Value].value <= app.variables[this.b.Value].value;
				break;
			case ">=":
				result = app.variables[this.a.Value].value >= app.variables[this.b.Value].value;
				break;
			case "<":
				result = app.variables[this.a.Value].value < app.variables[this.b.Value].value;
				break;
			case ">":
				result = app.variables[this.a.Value].value > app.variables[this.b.Value].value;
				break;
		}

		if (result) {
			return this.outs()[0];
		} else {
			return this.outs()[1];
		}
	}
}

class FunctionCallNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.functionName = new ShortString();
		super._setup(createInfo);
	}

	execute(app) {
		app.remoteCall(this.functionName.Value);
		return super.execute(app);
	}
}

// Abstract
class OutsNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
	}

	addOut() {
		this.outs.push(new Output());
	}

	removeOut(target) {
		this.outs.remove(target);
	}
}

class RandomNode extends OutsNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	execute(app) {
		let outs = this.outs();
		return outs[random(0, outs.length)];
	}
}

class InventoryNode extends PassNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.inventory = new ItemIndex();
	}
}

class InventoryAddNode extends InventoryNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	execute(app) {
		app.inventory.push(this.inventory.Value);
		return super.execute(app);
	}
}

class InventoryRemoveNode extends InventoryNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	execute(app) {
		app.inventory.remove(this.inventory.Value);
		return super.execute(app);
	}
}

class InventoryExistsNode extends InventoryNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		super._setup(createInfo);
	}

	_newInit() {
		this.outs.push(new Output());
	}

	execute(app) {
		if (app.inventory.indexOf(this.inventory.Value) !== -1) {
			return this.outs()[0];
		} else {
			return this.outs()[1];
		}
	}
}

class InventoryCountNode extends InventoryNode {
	constructor(createInfo, app) {
		super(createInfo, app);
		this.condition = new ConditionString();
		this.value = new IntValue();
		super._setup(createInfo);
	}

	_newInit() {
		this.outs.push(new Output());
	}

	execute(app) {
		let result = false;
		let count = app.inventory.count(this.inventory.Value);

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

		if (result) {
			return this.outs()[0];
		} else {
			return this.outs()[1];
		}
	}
}

Node.typeMap = {
	"AddRandomToVariable": AddRandomToVariableNode,
	"AddToVariable": AddToVariableNode,
	"AddVariableToVariable": AddVariableToVariableNode,
	"Background": BackgroundNode,
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
	"Pass": PassNode,
	"Random": RandomNode,
	"RandomVariable": RandomVariableNode,
	"Return": ReturnNode,
	"Sound": SoundNode,
	"Start": StartNode,
	"Story": StoryNode,
	"SubVariableFromVariable": SubVariableFromVariableNode,
	"Todo": TodoNode,
	"Variable": VariableNode
};