define(function (require, exports) {
    "use strict";

    // Dependencies
    var _ = brackets.getModule("thirdparty/lodash");
    var DefaultDialogs = brackets.getModule("widgets/DefaultDialogs");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var FileUtils = brackets.getModule("file/FileUtils");
    var Nls = require("i18n!nls/strings");
    var Preferences = require("Preferences");
    var Strings = brackets.getModule("strings");
    var StringUtils = brackets.getModule("utils/StringUtils");

    /**
     * @const
     * @private
     */
    var _ACTION_SAVEAS = Dialogs.DIALOG_BTN_SAVE_AS;

    /**
     * @private
     * @type {object.<string, string>}
     */
    var _selectors = {
        bottomMargin: "#docBottomMargin",
        content: "input[name='pdfexport-content']:checked",
        fontSize: "#pdfexport-fontsize",
        leftMargin: "#docLeftMargin",
        rightMargin: "#docRightMargin",
        topMargin: "#docTopMargin"
    };

    /**
     * @private
     * @type {string}
     */
    var _exportDialogTemplate = _.template(require("text!htmlContent/export-dialog.html"));

    /**
     * @private
     * @param {!string} title
     * @param {!string} message
     * @param {?string} inputFile
     * @param {?string} outputFile
     */
    function showErrorDialog(title, message, inputFile, outputFile) {
        return Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            title,
            StringUtils.format(message, inputFile, outputFile)
        );
    }

    /**
     * @param {!string} inputFile
     * @return {!promise}
     */
    function showExportDialog(inputFile) {
        var deferred = new $.Deferred();
        var response = null;
        var $element, dialog;

        dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            StringUtils.format(Nls.DIALOG_TITLE, FileUtils.getBaseName(inputFile)),
            _exportDialogTemplate({ Nls: Nls, Preferences: Preferences }),
            [
                {
                    className: Dialogs.DIALOG_BTN_CLASS_NORMAL,
                    id: Dialogs.DIALOG_BTN_CANCEL,
                    text: Strings.CANCEL
                },
                {
                    className: Dialogs.DIALOG_BTN_CLASS_PRIMARY,
                    id: _ACTION_SAVEAS,
                    text: Strings.OK
                }
            ]
        );

        dialog.getPromise().then(function (action) {
            $element = dialog.getElement();

            if (action === _ACTION_SAVEAS) {
                response = {
                    content: $element.find(_selectors.content).val(),
                    fontSize: parseInt($element.find(_selectors.fontSize).val(), 10),
                    margins: {
                        bottom: parseInt($element.find(_selectors.bottomMargin).val(), 10),
                        left: parseInt($element.find(_selectors.leftMargin).val(), 10),
                        right: parseInt($element.find(_selectors.rightMargin).val(), 10),
                        top: parseInt($element.find(_selectors.topMargin).val(), 10),
                    }
                };
            }

            deferred.resolve(response);
        });

        return deferred.promise();
    }

    // Define public API
    exports.showErrorDialog = showErrorDialog;
    exports.showExportDialog = showExportDialog;
});
