import * as ko from "./knockout.js";
import { CoreNode } from "../node";
import { each, Optional } from "../modules/std.js";

export class NodeManager {
	/** @type {KnockoutObservableArray<CoreNode>} */
	#nodes = ko.observableArray();

	/** @type {Optional<CoreNode>} */
	#selectedNode = new Optional();

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