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
            /*    text = editor.getSelectedText();
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
                        text += newAddition;
                        text += "\n";
                    } else {
                        str = "";
                        cursor = editor.getCursorPos(true, "start").ch; 
                        
                        if (cursor > smallestSpace) { */
                            /*for (j = 0; j < (cursor - smallestSpace); j++) {
                                str += " ";
                            }*/
             /*               str += (new Array(cursor - smallestSpace)).join(" ");
                            lineText = str + lines[0];
                        } else {
                            lineText = lines[0];
                        }
                        
                        text = lineText + "\n"; 
                    } */
                //console.log(editor.getSelectedText());
                //console.log(editor.getCursorPos(true, "start").ch);
                
                //Determine smallest space between col 0 and text
                text = "", smallestSpace = 0;
                var cursorStart = editor.getCursorPos(true, "start").ch;
                console.log(cursorStart);
                var selectedText = editor.getSelectedText();
                lines = selectedText.split("\n");
                var numberOfLines = lines.length;
                for(var i = 0; i < numberOfLines; i++){
                    line = lines[i];
                    originalLength = line.length;
                    newLength = line.trim().length;
                    difference = originalLength - newLength;
                    console.log(difference);
                    if(difference == 0) {
                        smallestSpace = cursorStart;
                    }
                    if(difference < smallestSpace || i == 0) {
                        smallestSpace = difference;
                    }
                    console.log(smallestSpace);
                }
                //Remove amount of whitespace equivalent to smallestSpace
                var indent = (new Array(smallestSpace)).join(" ");
                console.log(indent);
                if(smallestSpace != 0) {
                    var regexp = new RegExp(/*"/"+*/indent+"{1}");
                }
                console.log(regexp);
                for(var i = 0; i < numberOfLines; i++) {
                    line = lines[i];
                    if(i == 0 && cursorStart != 0) {
                        line = (new Array(cursorStart)).join(" ") + line;
                        //
                    }
                    var newLine = line.replace(regexp, "");
                    console.log(newLine);
                    text += newLine + "\n";
                }
                //}
                //return;            
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
