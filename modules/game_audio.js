/**
 * Controls and play audio
 * @property {Audio} clip The audio clip to play
 */
export class GameAudio {
	/** @type {number} */
	#loops = 0;

	/**
	 * @param {string|Audio} src The resource to use for this audio clip
	 */
	constructor(src) {
		if (typeof src == "string") {
			this.clip = new Audio();
			this.clip.src = src;
		} else {
			this.clip = src;
		}
	}

	/**
	 * Plays this audio clip. If looping it will play it for the remaining loop count
	 */
	play() {
		this.clip.play();
	}

	/**
	 * Pauses this audio clip and allows to continue it from this point if played again
	 */
	pause() {
		this.clip.pause();
	}

	/**
	 * 
	 */
	stop() {
		this.clip.pause();
		this.clip.currentTime = 0;
	}

	/**
	 * This sets the current time of the audio clip to allow "jumping"
	 * @param {number} time time that the audio clip should start at
	 */
	setTime(time) {
		this.clip.currentTime = time;
	}

	/**
	 * Sets the volume for this audio clip
	 * @param {number} volume 
	 */
	setVolume(volume) {
		if (volume > 1)
			this.clip.volume = volume * 0.01;
		else
			this.clip.volume = volume;
	}

	/**
	 * The function that is to be used as a callback only for when the audio clip has ended
	 */
	#endLoopDecrement() {
		if (this.#loops > 0)
			this.#loops--;
		if (this.#loops > 0)
			this.play();
	};

	/**
	 * Sets how many times the audio clip should loop when playing. If 0 is
	 * passed then it will loop forever, if -1 is passed then it will turn
	 * looping off, otherwise loops the specified amount
	 * @param {number} repeats The amount of times this audio clip should loop
	 */
	setLoopCount(repeats) {
		if (repeats == 0) {
			this.clip.loop = true;
		} else if (repeats < 0) {
			this.clip.loop = false;
			this._loops = 0;
		} else {
			this._loops = repeats;
		}
	};
}
