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
     * @param {{fontSize: number, openPdf: boolean, pathname: string, text: string, margins: object,includePageNumbers: boolean, syntaxHighlight: boolean}} options
     */
    function _savePDFFile(options) { 
        $("body").append("<div class='modal-wrapper'><div class='modal-inner-wrapper'><div class='modal-backdrop in' style='z-index:1052;'></div></div></div>");
        PDFDocument.create(options)
            .fail(function _handleError() {
                /**
                 * @TODO Use error codes in order to simplify displaying of error dialogs
                 */
            })
            .always(function () {
                $(".modal-wrapper").remove();
            })
            .then(function() {
                if (options.openPdf) {
                    PDFDocument.open(options.pathname);
                }
            });
    }

    /**
     * @TODO Refactor this function to use more abstractions
     */
    function exportAsPdf() {
        var editor = EditorManager.getActiveEditor(),
            smallestSpace = 0;
        var cursorStart, difference, doc, i, indent, line, lines, newLength, newLine, numberOfLines, originalLength, regexp, selectedText, srcFile, text;
        
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
                    
                    if (difference === 0 && i === 0) {
                        difference = cursorStart;
                    }
                    
                    if (difference < smallestSpace || i === 0) {
                        smallestSpace = difference;
                    }
                }

                indent = (new Array(smallestSpace)).join(" ");

                if (smallestSpace !== 0) {
                    regexp = new RegExp(indent+"{1}");
                }

                for (i = 0; i < numberOfLines; i++) {
                    line = lines[i];
                    
                    if (i === 0 && cursorStart !== 0) {
                        line = (new Array(cursorStart)).join(" ") + " " + line;
                    }
                    
                    newLine = line.replace(regexp, "");
                    text += newLine + "\n";
                }  
                
            } else {
                text = doc.getText();
            }
            
            if (options.syntaxHighlight) {
                var docText = [], lineTheme = [];
                
                brackets.getModule(["thirdparty/CodeMirror2/addon/runmode/runmode", "thirdparty/CodeMirror2/lib/codemirror"], function(runmode, codemirror) {
                    /**
                     * Appropriate colours for final document - taken from PDFKit documentation
                     */
                    var themeColours = {
                        keyword: "#CB4B16",
                        atom: "#D33682",
                        number: "#009999",
                        def: "#2AA198",
                        variable: "#108888",
                        "variable-2": "#B58900",
                        "variable-3": "#6C71C4",
                        property: "#2AA198",
                        operator: "#6C71C4",
                        comment: "#999988",
                        string: "#DD1144",
                        "string-2": "#009926",
                        meta: "#768E04",
                        qualifier: "#B58900",
                        builtin: "#D33682",
                        bracket: "#CB4b16",
                        tag: "#93A1A1",
                        attribute: "#2AA198",
                        header: "#586E75",
                        quote: "#93A1A1",
                        link: "#93A1A1",
                        special: "#6C71C4",
                        default: "#000000"
                    };
                    
                    lines = text.split("\n");
                    
                    for (var l = 0; l < lines.length; l++) {
                        line = lines[l];
                        codemirror.runMode(line, doc.language.getMode(), function (text, style) {
                            if (!style) { 
                                style = "default"; 
                            } //maybe ternary operator
                            lineTheme.push( { text: text, style: themeColours[style] } );
                        });
                        docText.push(lineTheme);
                        lineTheme = [];
                    }
                    
                    text = docText;
                });
            }

            FileSystem.showSaveDialog(
                StringUtils.format(Nls.DIALOG_TITLE, FileUtils.getBaseName(srcFile)),
                FileUtils.getDirectoryPath(srcFile),
                FileUtils.getBaseName(srcFile) + ".pdf",
                function _saveDialogCallback(err, pathname) {
                    _savePDFFile({ 
                        fontSize: options.fontSize,
                        openPdf: options.openPdf,
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
    
    /**
     * Add onerror handler
     */
    window.onerror = function(message) {
        var regularExpression = /(\/brackets-pdfexport\/)/g;
        if (regularExpression.test(url)) {
            Dialogs.showErrorDialog(Nls.ERROR_PDFKIT_TITLE, Nls.ERROR_PDFKIT_MSG_WITH_ERROR, message);
        }
    };
});
