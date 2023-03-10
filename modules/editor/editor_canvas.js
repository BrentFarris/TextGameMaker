import { Canvas } from "../engine/canvas.js"
import { CoreNode, NODE_LINE_OFFSET } from "../node.js";
import { NodeManager } from "./node_manager.js";

export class EditorCanvas {
	/** @type {Canvas} */
	#canvas;

	/** @type {NodeManager} */
	#nodeManager;
	
	constructor(nodeManager) {
		this.#nodeManager = nodeManager;
		this.#canvas = new Canvas(document.getElementById("canvas"));
		this.#registerDrawingEvent();
	}

	#registerDrawingEvent() {
		this.#canvas.drawing.register(() => { this.#draw(); }, null);
	}

	#draw() {
		for (let i = 0; i < this.#nodeManager.Count; i++) {
			let node = this.#nodeManager.at(i);
			if (!node.outs().length)
				continue;
			let outs = node.outs();
			for (let j = 0; j < outs.length; j++) {
				if (!outs[j].to())
					continue;
				if (this.#nodeManager.SelectedNode.HasValue
					&& outs[j].to() !== this.#nodeManager.SelectedNode.Value
					&& node !== this.#nodeManager.SelectedNode.Value)
				{
					continue;
				}
				let from = node;
				let fromElm = this.#nodeManager.elementMap[node.id];
				let fromHandle = fromElm.getElementsByClassName("nodeHandle")[0];
				let to = /** @type {CoreNode} */ (outs[j].to());
				let toHandle = fromElm.getElementsByClassName("nodeHandle")[0];
				let yOffset = ((j + 1) * 22);
				let startX = from.x + fromElm.clientWidth,
					startY = (from.y + fromHandle.clientHeight * 0.5) + yOffset,
					endX = to.x,
					endY = to.y + toHandle.clientHeight * 0.5,
					startOffset = NODE_LINE_OFFSET,
					endOffset = NODE_LINE_OFFSET;
				let ctx = this.#canvas.context.Value;
				ctx.beginPath();
				ctx.lineWidth = 1;
				ctx.moveTo(startX, startY);
				ctx.lineTo(startX + startOffset, startY);
				// The node is not to the right of this node
				if (to.x < from.x + fromElm.clientWidth) {
					ctx.lineTo(startX + startOffset, endY - fromHandle.clientHeight * 0.5 - 5.0);
					ctx.lineTo(endX - endOffset, endY - toHandle.clientHeight * 0.5 - 5.0);
					ctx.lineTo(endX - endOffset, endY);
				} else
					ctx.lineTo(endX - endOffset, endY);
				ctx.lineTo(endX, endY);
				ctx.stroke();
			}
		}
		Canvas.stop(this.#canvas);
	}

	/**
	 * 
	 */
	resize() {
		const extraBufferX = 100;
		const extraBufferY = 275;
		let nodes = this.#nodeManager.Nodes;
		for (let i = 0; i < nodes.length; ++i) {
			let node = nodes[i];
			let elm = this.#nodeManager.elementMap[node.id];
			if (node.x + elm.clientWidth > this.#canvas.width)
				this.#canvas.width = node.x + elm.clientWidth + extraBufferX;
			if (node.y + elm.clientHeight > this.#canvas.height)
				this.#canvas.height = node.y + elm.clientHeight + extraBufferY;
		}
	}

	trim() {
		this.#canvas.width = 0;
		this.#canvas.height = 0;
		this.resize();
	}

	drawFrame() {
		Canvas.start(this.#canvas);
	}
}