define(function (require, exports, module) {
    "use strict";

    // Dependencies
    var _ = brackets.getModule("thirdparty/lodash");
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
            _fs._load().then(function () {
                _fs.exec("write", pathname, reader.result)
                    .fail(function(err) {
                        Dialogs.showErrorDialog(
                            Nls.ERROR_PDFKIT_TITLE,
                            Nls.ERROR_WRITE_MSG,
                            err.errno
                        );
                        deferred.reject.bind(deferred);
                    })
                    .then(deferred.resolve.bind(deferred));
            });
        };

        return deferred.promise();
    }

    /**
     * @private
     * @param {{fontSize: number, pathname: string, text: string, margins: object, includepagenumbers: boolean, syntaxHighlight: boolean}} options
     * @return {!promise}
     */
    function create(options) {
        var PDFKitOptions = {
            margins: {
                bottom: options.margins.bottom,
                left: options.margins.left,
                right: options.margins.right,
                top: options.margins.top
            },
            footerHeight: (options.includePageNumbers ? (options.fontSize * 1.5) : 0),
            bufferPages: options.includePageNumbers
        };
        var deferred = new $.Deferred();
        var pdf = new PDFKit(PDFKitOptions);
        var stream = pdf.pipe(blobStream());

        pdf.font(_PDF_FONTFACE, options.fontSize);
        
        if (typeof options.text === "object") {
            var lineTheme = [];
            for (var i = 0; i < (options.text).length; i++) {
                lineTheme = options.text[i];
                _.each(lineTheme, function(definition) {
                    pdf.fillColor(definition.style);
                    pdf.text(definition.text, {
                        continued: true
                    });
                });
                pdf.fillColor("#000000");
                pdf.text(" ", {
                    continued: false
                });
            }
        } else {
            pdf.text(options.text);
        }
        
        if (options.includePageNumbers) {
            var totalPageCount = pdf.bufferedPageRange().count;
            /* Write footer in each page */
            for (var page = 0; page < totalPageCount; page++) {
                pdf.switchToPage(page);
                pdf.fillColor("black");
                pdf.text("Page " + (page + 1), options.margins.left + 1, 700, {
                    align: "center"
                });
            }
        }
        
        pdf.save()
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
                
            deferred.resolve();
        });

        return deferred.promise();
    }

    function open(pathname) {
        _fs._load().then(function() {
            _fs.exec("open", pathname);
        })
    }

    // Define public API
    exports.create = create;
    exports.open = open;
});
