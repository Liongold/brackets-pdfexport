define(function (require) {
    "use strict";

    // Dependencies
    var CommandManager = brackets.getModule("command/CommandManager");
    var Commands = brackets.getModule("command/Commands");
    var Dialogs = require("Dialogs");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var FileSystem = brackets.getModule("filesystem/FileSystem");
    var FileUtils = brackets.getModule("file/FileUtils");
    var Menus = brackets.getModule("command/Menus");
    var Nls = require("i18n!nls/strings");
    var PDFDocument = require("PDFDocument");
    var StringUtils = brackets.getModule("utils/StringUtils");

    /**
     * @const
     * @privte
     * @type {string}
     */
    var _COMMAND_ID = "pdfexport.export";

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
     * @TODO Refactor this function to use more abstractions
     */
    function exportAsPdf() {
        var editor = EditorManager.getActiveEditor();
        var cursor, differences, doc, i, j, k, line, lineText, lines, newAddition, newLength, originalLength, smallestSpace, srcFile, str, text;

        if (!editor) {
            return;
        }

        doc = editor.document;
        srcFile = doc.file.fullPath;

        if (!_isSupportedDocument(doc)) {
            Dialogs.showErrorDialog(
                Nls.ERROR_UNSUPPORTED_FILE_TITLE,
                Nls.ERROR_UNSUPPORTED_FILE_MSG,
                srcFile
            );
        }

        Dialogs.showExportDialog(srcFile).then(function _callback(options) {
            if (!options) {
                return;
            }

            if (options.content === "selection") {
                lines = text.split("\n");
                differences = [];

                for (i = 0; i < lines.length; i++) {
                    line = lines[i];
                    originalLength = line.length;
                    newLength = line.trim().length;
                    differences.push(originalLength - newLength);
                }

                smallestSpace = "";
                for (k = 0; k < differences.length; k++) {
                    if (smallestSpace === "" || smallestSpace > differences[k]) {
                        smallestSpace = differences[k];
                    }
                }

                text = "";
                for (i = 0; i < lines.length; i++) {
                    if (i !== 0) {
                        lineText = lines[i];
                        newAddition = lineText.substr(smallestSpace);
                        text = newAddition + "\n";
                    } else {
                        str = "";
                        cursor = editor.getCursorPos(true, "start").ch;
                        if (cursor > smallestSpace) {
                            str += (new Array(cursor - smallestSpace)).join(" ");
                            lineText = str + lines[0];
                        } else {
                            lineText = lines[0];
                        }
                        text = lineText + "\n"; 
                    }
                }
            } else {
                text = doc.getText();
            }

            FileSystem.showSaveDialog(
                StringUtils.format(Nls.DIALOG_TITLE, FileUtils.getBaseName(srcFile)),
                FileUtils.getDirectoryPath(srcFile),
                FileUtils.getBaseName(srcFile) + ".pdf",
                function _saveDialogCallback(err, pathname) {
                    _savePDFFile({
                        fontSize: options.fontSize,
                        srcFile: srcFile,
                        pathname: pathname,
                        text: text
                    });
                }
            );
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
