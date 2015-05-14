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
     * @param {{fontSize: number, pathname: string, text: string, margins: object,includePageNumbers: boolean}} options
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
        var editor = EditorManager.getActiveEditor(),
            text = "",
            smallestSpace = 0;
        var cursorStart, difference, doc, i, indent, line, lines, newLength, newLine, numberOfLines, originalLength, smallestSpace, selectedText, srcFile, text;

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
                cursorStart = editor.getCursorPos(true, "start").ch;
                selectedText = editor.getSelectedText();
                lines = selectedText.split("\n");
                numberOfLines = lines.length;
                
                for (i = 0; i < numberOfLines; i++) {
                    line = lines[i];
                    originalLength = line.length;
                    newLength = line.trim().length;
                    difference = originalLength - newLength;
                    
                    if (difference == 0 && i == 0) {
                        difference = cursorStart;
                    }
                    
                    if (difference < smallestSpace || i == 0) {
                        smallestSpace = difference;
                    }
                }

                indent = (new Array(smallestSpace)).join(" ");

                if (smallestSpace != 0) {
                    var regexp = new RegExp(indent+"{1}");
                }

                for (i = 0; i < numberOfLines; i++) {
                    line = lines[i];
                    
                    if (i == 0 && cursorStart != 0) {
                        line = (new Array(cursorStart)).join(" ") + " " + line;
                    }
                    
                    var newLine = line.replace(regexp, "");
                    text += newLine + "\n";
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
                        text: text,
                        margins: options.margins,
                        includePageNumbers: options.includepagenumbers 
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
