define(function (require) {
    "use strict";

    // Dependencies
    var _ = brackets.getModule("thirdparty/lodash");
    var CommandManager = brackets.getModule("command/CommandManager");
    var Commands = brackets.getModule("command/Commands");
    var DefaultDialogs = brackets.getModule("widgets/DefaultDialogs");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var exportDialogTemplate = require("text!htmlContent/export-dialog.html");
    var FileSystem = brackets.getModule("filesystem/FileSystem");
    var FileUtils = brackets.getModule("file/FileUtils");
    var Menus = brackets.getModule("command/Menus");
    var Nls = require("i18n!nls/strings");
    var PDFDocument = require("PDFDocument");
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
     * @private
     * @type {object.<string, string>}
     */
    var _selectors = {
        fontSize: "#pdfexport-fontsize"
    };

    /**
     * @private
     * @type {object.<string, function(object): string>}
     */
    var _templates = {
        exportDialog: _.template(exportDialogTemplate)
    };

    /**
     * @private
     * return {boolean}
     */
    function _isSupportedDocument(doc) {
        return doc.language.getId() !== "binary";
    }

    /**
     * @param {{fontSize: number, pathname: string, text: string}} options
     */
    function _savePDFFile(options) {
        PDFDocument.create(options)
            .fail(function _handleError() {
                /**
                 * @TODO Use error codes in order to simplify displaying of error dialogs
                 */
            });
    }

    /**
     * @private
     * @param {!string} title
     * @param {!string} message
     * @param {?string} inputFile
     * @param {?string} outputFile
     */
    function _showErrorDialog(title, message, inputFile, outputFile) {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            title,
            StringUtils.format(message, inputFile, outputFile)
        );
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
        inputFile = doc.file.fullPath;

        if (!_isSupportedDocument(doc)) {
            return _showErrorDialog(
                Nls.ERROR_UNSUPPORTED_FILE_TITLE,
                Nls.ERROR_UNSUPPORTED_FILE_MSG,
                inputFile
            );
        }

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
                    function _saveDialogCallback(err, pathname) {
                        _savePDFFile({
                            fontSize: parseInt($element.find(_selectors.fontSize).val(), 10),
                            inputFile: inputFile,
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
