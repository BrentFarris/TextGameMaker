import { CoreNode, NodeTypeMap } from "../node.js";
import { each, Optional } from "../engine/std.js";

export class NodeManager {
	/** @type {KnockoutObservableArray<CoreNode>} */
	#nodes = ko.observableArray();

	/** @type {Optional<CoreNode>} */
	#selectedNode = new Optional();

	/** @type {KnockoutObservable<CoreNode>} */
	focusededNode = ko.observable();

	/** @type {string[]} */
	#nodeTypes = [];

	constructor() {
		each(NodeTypeMap, (key, val) => {
			this.#nodeTypes.push(/** @type {string} */ (key));
		});
	}

	get NodeTypes() {
		return this.#nodeTypes;
	}

	/**
	 * @return {CoreNode[]}
	 */
	get Nodes() {
		return this.#nodes();
	}

	/**
	 * @return {number}
	 */
	get Count() {
		return this.#nodes().length;
	}

	/**
	 * @return {Optional<CoreNode>}
	 */
	get SelectedNode() {
		return this.#selectedNode;
	}

	/**
	 * @param {CoreNode} node 
	 */
	add(node) {
		this.#nodes.push(node);
	}

	/**
	 * @param {CoreNode} node 
	 */
	remove(node) {
		this.#nodes.remove(node);
	}

	/**
	 * @param {CoreNode} node 
	 */
	select(node) {
		this.#selectedNode.Value = node;
	}

	/**
	 * @param {CoreNode} node 
	 */
	focus(node) {
		this.focusededNode(node);
	}

	/**
	 * 
	 */
	deselect() {
		this.#selectedNode.Value = null;
	}

	/**
	 * @return {boolean}
	 */
	isEmpty() {
		return this.#nodes.length == 0;
	}

	/**
	 * 
	 */
	clear() {
		this.#nodes.removeAll();
	}

	/**
	 * @param {number} index 
	 * @return {CoreNode}
	 */
	at(index) {
		return this.#nodes()[index];
	}

	/**
	 * @param {number} id 
	 * @returns {CoreNode}
	 */
	nodeById(id) {
		let node = null;
		each(this.Nodes, (key, val) => {
			if (val.id === id) {
				node = val;
				return false;
			}
		});
		return node;
	}
}