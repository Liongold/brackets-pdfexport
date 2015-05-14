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
     * @param {{fontSize: number, pathname: string, text: string, margins: object,includePageNumbers: boolean, syntaxHighlight: boolean}} options
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
            
            if(options.syntaxHighlight) {
                var docText = [];
                var specifiedColours = [];
                var lineTheme = [], fullTheme = [];
                brackets.getModule(["thirdparty/CodeMirror2/addon/runmode/runmode", "thirdparty/CodeMirror2/lib/codemirror"], function(runmode, codemirror) {
                    var themeColours = {
                          keyword: '#cb4b16',
                          atom: '#d33682',
                          number: '#009999',
                          def: '#2aa198',
                          variable: '#108888',
                          'variable-2': '#b58900',
                          'variable-3': '#6c71c4',
                          property: '#2aa198',
                          operator: '#6c71c4',
                          comment: '#999988',
                          string: '#dd1144',
                          'string-2': '#009926',
                          meta: '#768E04',
                          qualifier: '#b58900',
                          builtin: '#d33682',
                          bracket: '#cb4b16',
                          tag: '#93a1a1',
                          attribute: '#2aa198',
                          header: '#586e75',
                          quote: '#93a1a1',
                          link: '#93a1a1',
                          special: '#6c71c4',
                          default: '#000000'
                    };
                    var specifiedColours = [];
                    var test = text;
                    var language = brackets.getModule("document/Document");
                    var lineColoursd = [];
                    var lines = test.split("\n");
                    for(var l = 0; l < lines.length; l++){
                        var line = lines[l];
                        codemirror.runMode(line, doc.language.getMode(), function(text, style) {
                            if(!style) { style = "default"; };
                            lineColoursd.push(themeColours[style]);
                            docText.push({ text: text/*, style: themeColours[style]*/ });
                            lineTheme.push({ text: text, style: themeColours[style] });
                            //console.log("end of loine");
                        });
                        specifiedColours.push({ text: docText.text, style: lineColoursd});
                        lineColoursd = [];
                        fullTheme.push( lineTheme );
                        lineTheme = [];
                    };
                });
            };

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
                        includePageNumbers: options.includepagenumbers,
                        syntaxHighlight: options.syntaxHighlight, 
                        syntaxText: fullTheme //maybe merge with 'text' above
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
