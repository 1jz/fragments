// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// const { createHash } = require('crypto');

// Functions for working with fragment metadata/data using our DB
const {
    readFragment,
    writeFragment,
    readFragmentData,
    writeFragmentData,
    listFragments,
    deleteFragment,
} = require('./data/memory');

const validTypes = [
    `text/plain`,
    /*
   Currently, only text/plain is supported. Others will be added later.

  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
  */
];

class Fragment {
    constructor({ id, ownerId, created, updated, type, size = 0 }) {
        if (!ownerId) throw new Error('ownerId must be supplied');
        if (!type) throw new Error('type must be supplied');
        if (typeof size !== 'number') throw new Error('size must be a number');
        if (size < 0) throw new Error('size must be greater or equal to 0');
        if (!type || !Fragment.isSupportedType(type)) throw new Error('unsupported type');

        if (!id) this.id = nanoid();
        else this.id = id;

        //this.ownerId = createHash('sha256').update(ownerId).digest('hex');
        this.ownerId = ownerId;

        if (!created) this.created = new Date().toISOString();
        else this.created = created;

        if (!updated) this.updated = new Date().toISOString();
        else this.updated = updated;

        this.type = type;
        this.size = size;
    }

    /**
     * Get all fragments (id or full) for the given user
     * @param {string} ownerId user's hashed email
     * @param {boolean} expand whether to expand ids to full fragments
     * @returns Promise<Array<Fragment>>
     */
    static async byUser(ownerId, expand = false) {
        return listFragments(ownerId, expand);
    }

    /**
     * Gets a fragment for the user by the given id.
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise<Fragment>
     */
    static async byId(ownerId, id) {
        let fragment = await readFragment(ownerId, id);
        if (!fragment) throw new Error(`no data for ${ownerId}, ${id}`);
        return Promise.resolve(fragment);
    }

    /**
     * Delete the user's fragment data and metadata for the given id
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise
     */
    static delete(ownerId, id) {
        return deleteFragment(ownerId, id);
    }

    /**
     * Saves the current fragment to the database
     * @returns Promise
     */
    save() {
        this.updated = new Date().toISOString();
        return writeFragment(this);
    }

    /**
     * Gets the fragment's data from the database
     * @returns Promise<Buffer>
     */
    getData() {
        return readFragmentData(this.ownerId, this.id);
    }

    /**
     * Set's the fragment's data in the database
     * @param {Buffer} data
     * @returns Promise
     */
    async setData(data) {
        if (!data) throw new Error('no Buffer provided');
        this.size = Buffer.byteLength(data);
        this.updated = new Date().toISOString();
        return writeFragmentData(this.ownerId, this.id, data);
    }

    /**
     * Returns the mime type (e.g., without encoding) for the fragment's type:
     * "text/html; charset=utf-8" -> "text/html"
     * @returns {string} fragment's mime type (without encoding)
     */
    get mimeType() {
        const { type } = contentType.parse(this.type);
        return type;
    }

    /**
     * Returns true if this fragment is a text/* mime type
     * @returns {boolean} true if fragment's type is text/*
     */
    get isText() {
        return this.mimeType.startsWith('text/');
    }

    /**
     * Returns the formats into which this fragment type can be converted
     * @returns {Array<string>} list of supported mime types
     */
    get formats() {
        let fmts = [];
        switch (this.mimeType) {
            case 'text/plain':
                fmts = ['text/plain'];
                break;
        }
        return fmts;
    }

    /**
     * Returns true if we know how to work with this content type
     * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
     * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
     */
    static isSupportedType(value) {
        try {
            let ct = contentType.parse(value);
            if (validTypes.includes(ct.type)) return true;
        } catch (err) {
            // ignore
        }
        return false;
    }
}

module.exports.Fragment = Fragment;
