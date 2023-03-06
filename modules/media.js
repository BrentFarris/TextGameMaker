import { GameAudio } from "./game_audio.js";

export class Media {
	/** @type {GameAudio|null} */
	bgm = null;

	/** @type {KnockoutObservable<string>} */
	backgroundImage = ko.observable("");

	/** @type {KnockoutObservable<string>} */
	backgroundImageBuffer = ko.observable("");

	/** @type {KnockoutObservable<number>} */
	backgroundImageBufferOpacity = ko.observable(0.0);

	/** @type {KnockoutObservable<number>} */
	backgroundImageOpacity = ko.observable(1.0);

	constructor() {
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
	}
}