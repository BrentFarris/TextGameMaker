import { Canvas } from "../engine/canvas.js"
import { Optional } from "../engine/std.js";
import { CoreNode, NODE_WIDTH, NODE_HEIGHT, NODE_HANDLE_HEIGHT, NODE_LINE_OFFSET } from "../node.js";
import { NodeManager } from "./node_manager.js";

export class EditorCanvas {
	/** @type {Canvas} */
	#canvas;

	/** @type {boolean} */
	#canvasAutoStop = true;

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
				let to = /** @type {CoreNode} */ (outs[j].to());
				let yOffset = ((j + 1) * 22);
				let startX = from.x + NODE_WIDTH,
					startY = (from.y + NODE_HANDLE_HEIGHT * 0.5) + yOffset,
					endX = to.x,
					endY = to.y + NODE_HANDLE_HEIGHT * 0.5,
					startOffset = NODE_LINE_OFFSET,
					endOffset = NODE_LINE_OFFSET;
				let ctx = this.#canvas.context.Value;
				ctx.beginPath();
				ctx.lineWidth = 1;
				ctx.moveTo(startX, startY);
				ctx.lineTo(startX + startOffset, startY);
				// The node is not to the right of this node
				if (to.x < from.x + NODE_WIDTH) {
					ctx.lineTo(startX + startOffset, endY - NODE_HANDLE_HEIGHT);
					ctx.lineTo(endX - endOffset, endY - NODE_HANDLE_HEIGHT);
					ctx.lineTo(endX - endOffset, endY);
				} else
					ctx.lineTo(endX - endOffset, endY);
				ctx.lineTo(endX, endY);
				ctx.stroke();
			}
		}
		if (this.#canvasAutoStop && this.#nodeManager.Count)
			Canvas.stop(this.#canvas);
	}

	/**
	 * 
	 */
	resize() {
		const extraBuffer = 100;
		let nodes = this.#nodeManager.Nodes;
		for (let i = 0; i < nodes.length; ++i) {
			let node = nodes[i];
			if (node.x + NODE_WIDTH > this.#canvas.width)
				this.#canvas.width = node.x + NODE_WIDTH + extraBuffer;
			if (node.y + NODE_HEIGHT > this.#canvas.height)
				this.#canvas.height = node.y + NODE_HEIGHT + extraBuffer;
		}
	}

	trim() {
		this.#canvas.width = 0;
		this.#canvas.height = 0;
		this.resize();
	}

	drawFrame() {
		if (this.#canvasAutoStop)
			Canvas.start(this.#canvas);
	}

	setContinuousRender() {
		this.#canvasAutoStop = false;
	}

	setRenderFreezeFrame() {
		this.#canvasAutoStop = true;
	}
}