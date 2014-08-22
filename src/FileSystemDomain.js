"use strict";

// Dependencies
var fs = require("fs");

/**
 * @const
 * @private
 * @type {String}
 */
var _DOMAIN_ID = "pdfexport.FileSystemDomain";

/**
 * @public
 * @param {DomainManager} manager
 */
function init(manager) {
    if (!manager.hasDomain(_DOMAIN_ID)) {
        manager.registerDomain(_DOMAIN_ID, {
            major: 0,
            minor: 1
        });
    }
    manager.registerCommand(_DOMAIN_ID, "write", write, true);
}

/**
 * @public
 * @param {!string} pathname
 * @param {!string} data
 * @param {!function.<?error>} done
 */
function write(pathname, data, done) {
    // Omit file header from input data
    data = data.split(",")[1];
    fs.writeFile(pathname, data, "base64", done);
}

// Define public API
exports.init = init;
