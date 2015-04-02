define(function (require, exports, module) {
    "use strict";

    // Dependencies
    var blobStream = require("thirdparty/blob-stream");
    var Dialogs = require("Dialogs");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var PDFKit = require("thirdparty/pdfkit");
    var Nls = require("i18n!nls/strings");
    var NodeDomain = brackets.getModule("utils/NodeDomain");

    /**
     * @const
     * @private
     * @type {string}
     */
    var _BLOB_TYPE = "application/pdf";

    /**
     * @private
     * @type {NodeDomain}
     */
    var _fs = new NodeDomain(
        "pdfexport.FileSystemDomain",
        ExtensionUtils.getModulePath(module, "FileSystemDomain.js")
    );

    /**
     * @private
     * @type {string}
     */
    var _PDF_FONTFACE = "Courier";

    /**
     * @private
     * @param {!string} pathname
     * @param {!blob} blob
     * @return {!promise}
     */
    function _writeFile(pathname, blob) {
        var deferred = new $.Deferred();
        var reader = new FileReader();

        reader.readAsDataURL(blob);
        reader.onloadend = function onLoadEnd() {
            _fs.exec("write", pathname, reader.result)
                .fail(function(err) {
                    Dialogs.showErrorDialog(
                        Nls.ERROR_PDFKIT_TITLE,
                        Nls.ERROR_WRITE_MSG,
                        err.errno
                    );
            });
        };

        return deferred.promise();
    }

    /**
     * @private
     * @param {{fontSize: number, pathname: string, text: string}} options
     * @return {!promise}
     */
    function create(options) {
        var deferred = new $.Deferred();
        var pdf = new PDFKit();
        var stream = pdf.pipe(blobStream());

        pdf.font(_PDF_FONTFACE, options.fontSize)
           .text(options.text)
           .save()
           .end();

        /**
         * @TODO Research PDFKit errors in order to provide improved error messages
         */
        stream.on("error", function _handleError(err) {
            deferred.reject(err);
        });

        stream.on("finish", function _handlePDFCreation() {
            var blob = stream.toBlob({ type: _BLOB_TYPE });

            _writeFile(options.pathname, blob)
                .fail(deferred.reject.bind(deferred))
                .then(deferred.resolve.bind(deferred));
        });

        return deferred.promise();
    }

    // Define public API
    exports.create = create;
});
