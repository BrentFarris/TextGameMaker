export class ProjectDataFile {
	/** @type {string} */
	name = "";

	/** @type {any} */
	content = {};

	/**
	 * @param {string} name
	 * @param {any} data
	 */
	 constructor(name, data) {
		this.name = name;
		this.content = data;
	}
}

export class ProjectDataFolder {
	/** @type {string} */
	name = "";

	/** @type {ProjectDataFile[]} */
	files = [];

	/** @type {ProjectDataFolder[]} */
	folders = [];

	/** @param {string} name */
	constructor(name) { this.name = name; }
}

export class ProjectData {
	/** @type {string} */
	name = "";

	/** @type {ProjectDataFolder} */
	root = new ProjectDataFolder("/");

	/** @param {string} name */
	constructor(name) { this.name = name; }
}

export class ProjectDatabase {
	/** @type {string} */
	static get #DB_NAME() { return "ProjectDatabase" };
	
	/** @type {number} */
	static get #DB_VERSION() { return 1 };

	/** @type {string} */
	static get #DB_STORE_NAME() { return "projects" };

	/** @type {IDBDatabase} */
	#db;

	constructor() {
		
	}

	/**
	 * @returns {Promise<void>}
	 */
	async connect() {
		return new Promise((res, rej) => {
			const request = indexedDB.open(ProjectDatabase.#DB_NAME, ProjectDatabase.#DB_VERSION);
			request.onerror = evt => { this.#error(evt); rej(); }
			request.onupgradeneeded = evt => this.#upgradeNeeded(evt);
			request.onsuccess = evt => { this.#connected(evt); res(); }
		});
	}

	/**
	 * @param {Event} evt 
	 */
	#error(evt) {

	}

	/**
	 * @param {Event} evt 
	 */
	#storeCreated(evt) {

	}

	/**
	 * @param {IDBVersionChangeEvent} evt 
	 */
	#upgradeNeeded(evt) {
		/** @type {IDBDatabase} */
		const db = evt.target.result;
		const store = db.createObjectStore(ProjectDatabase.#DB_STORE_NAME, { keyPath: "name", autoIncrement: false });
		store.transaction.oncomplete = evt => this.#storeCreated(evt);
	}

	/**
	 * @param {IDBVersionChangeEvent} evt 
	 */
	#versionChanged(evt) {
		/** @type {IDBDatabase} */
		const db = evt.target.result;
		db.close();
		alert("A new version of the database is ready, please reload the tab");
	}

	/**
	 * @param {Event} evt 
	 */
	#connected(evt) {
		/** @type {IDBDatabase} */
		const db = evt.target.result;
		db.onversionchange = evt => this.#versionChanged(evt);
		this.#db = db;
	}

	/**
	 * @typedef {Object} TransactionOut
	 * @property {any} val
	 */

	/**
	 * @param {(store:IDBObjectStore,out:TransactionOut)=>void} exec
	 * @returns {Promise<any>}
	 */
	#transaction(exec) {
		return new Promise((res, rej) => {
			let out = {val: null};
			const transaction = this.#db.transaction([ProjectDatabase.#DB_STORE_NAME]);
			transaction.oncomplete = evt => res(out.val);
			transaction.onerror = evt => rej();
			const store = transaction.objectStore(ProjectDatabase.#DB_STORE_NAME);
			exec(store, out);
		});
	}

	/**
	 * @param {string} projectName
	 * @return {Promise<ProjectData>}  
	 */
	async readProject(projectName) {
		return this.#transaction((store, out) => {
			const req = store.get(projectName);
			req.onsuccess = evt => out.val = req.result;
		});
	}

	/**
	 * @param {ProjectData} projectData 
	 */
	async saveProject(projectData) {
		return this.#transaction((store, out) => {
			const req = store.get(projectData.name);
			req.onsuccess = evt => {
				if (req.result)
					store.put(projectData);
				else
					store.add(projectData);
			}
		});
	}

	/**
	 * @param {string} projectName 
	 */
	async deleteProject(projectName) {
		return this.#transaction((store, out) => {
			store.delete(projectName);
		});
	}

	/**
	 * @param {string} oldName 
	 * @param {string} newName 
	 */
	async renameProject(oldName, newName) {
		return this.#transaction((store, out) => {
			const req = store.get(oldName);
			req.onsuccess = evt => {
				if (req.result) {
					const movReq = store.add(newName, req.result);
					store.delete(oldName);
				}
			}
		});
	}

	/**
	 * @return {Promise<string[]>}
	 */
	async listProjects() {
		return this.#transaction((store, out) => {
			const req = store.getAllKeys();
			req.onsuccess = evt => out.val = req.result;
		});
	}
}