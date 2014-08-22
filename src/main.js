define(function (require, exports, module) {
    "use strict";

    // Dependencies
    var _ = brackets.getModule("thirdparty/lodash");
    var CommandManager = brackets.getModule("command/CommandManager");
    var Commands = brackets.getModule("command/Commands");
    var blobStream = require("thirdparty/blob-stream");
    var DefaultDialogs = brackets.getModule("widgets/DefaultDialogs");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var exportDialogTemplate = require("text!htmlContent/export-dialog.html");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var FileSystem = brackets.getModule("filesystem/FileSystem");
    var FileUtils = brackets.getModule("file/FileUtils");
    var Menus = brackets.getModule("command/Menus");
    var NodeDomain = brackets.getModule("utils/NodeDomain");
    var Nls = require("i18n!nls/strings");
    var PDFDocument = require("thirdparty/pdfkit");
    var Strings = brackets.getModule("strings");
    var StringUtils = brackets.getModule("utils/StringUtils");

    /**
     * @const
     * @private
     */
    var _ACTION_CANCEL = Dialogs.DIALOG_BTN_CANCEL;

    /**
     * @const
     * @private
     */
    var _ACTION_SAVEAS = Dialogs.DIALOG_BTN_SAVE_AS;

    /**
     * @const
     * @privte
     * @type {string}
     */
    var _COMMAND_ID = "pdfexport.export";

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
     * @type {object.<string, function(object): string>}
     */
    var _templates = {
        exportDialog: _.template(exportDialogTemplate)
    };

    function _createPDF(options) {
        var pdf = new PDFDocument();
        var stream = pdf.pipe(blobStream());

        pdf.fontSize(options.fontSize)
           .font("Courier")
           .text(options.text)
           .save()
           .end();

        stream.on("finish", function _handlePDFCreation() {
            _writeFile(options.pathname, stream.toBlob({ type: _BLOB_TYPE }));
        });
    }

    /**
     * @private
     * return {boolean}
     */
    function _isSupportedDocument(doc) {
        return doc.language.getId() !== "binary";
    }

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
            /**
             * @TODO Implement error dialog for write errors
             */
            _fs.exec("write", pathname, reader.result);
        };

        return deferred.promise();
    }

    /**
     * @TODO Refactor this function to use more abstractions
     */
    function exportAsPdf() {
        var editor = EditorManager.getActiveEditor();
        var dialog, dialogTitle, doc, inputFile;

        /**
         * @TODO Implement error dialog for nullified editor
         */
        if (!editor) {
            return;
        }

        doc = editor.document;

        /**
         * @TODO Implement error dialog for unsupported file types
         */
        if (!_isSupportedDocument(doc)) {
            return;
        }

        inputFile = doc.file.fullPath;
        dialogTitle = StringUtils.format(Nls.DIALOG_TITLE, FileUtils.getBaseName(inputFile));

        dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            dialogTitle,
            _templates.exportDialog({
                Nls: Nls
            }),
            [
                {
                    className: Dialogs.DIALOG_BTN_CLASS_NORMAL,
                    id: _ACTION_CANCEL,
                    text: Strings.CANCEL
                },
                {
                    className: Dialogs.DIALOG_BTN_CLASS_PRIMARY,
                    id: _ACTION_SAVEAS,
                    text: Strings.OK
                }
            ]
        );

        dialog.getPromise().then(function _callback(action) {
            var $element;

            if (action === _ACTION_SAVEAS) {
                $element = dialog.getElement();

                FileSystem.showSaveDialog(
                    dialogTitle,
                    FileUtils.getDirectoryPath(inputFile),
                    FileUtils.getBaseName(inputFile) + ".pdf",
                    function _callback(err, pathname) {
                        _createPDF({
                            fontSize: parseInt($element.find("#pdfexport-fontsize").val(), 10),
                            pathname: pathname,
                            text: doc.getText()
                        });
                    }
                );
            }
        });
    }

    CommandManager.register(Nls.CMD_EXPORT_PDF, _COMMAND_ID, exportAsPdf);
    Menus.getMenu(Menus.AppMenuBar.FILE_MENU)
        .addMenuItem(
            _COMMAND_ID,
            null,
            Menus.AFTER,
            Commands.FILE_SAVE_AS
        );
});
