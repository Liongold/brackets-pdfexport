define(function (require, exports) {
    "use strict";
    
    //Dependencies
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var extensionPrefs = PreferencesManager.getExtensionPrefs("brackets-pdfexport");
    var _ = brackets.getModule("thirdparty/lodash");
    
    /**
     * @const
     * @private
     * The default preferences to be set on first extension run
     * @object
     */
    var defaultPreferences = {
        "topMargin": { type: "number", value: 72}, 
        "leftMargin": { type: "number", value: 72 }, 
        "rightMargin": { type: "number", value: 72 }, 
        "bottomMargin": { type: "number", value: 72 }, 
        "fontSize": { type: "number", value: 10 },
        "rangeExport": { type: "string", value: "whole" },
        "openAfterExport": { type: "boolean", value: 1 },
        "includepagenumbers": { type: "boolean", value: 0} 
    };
    
    /**
     * If preferences are not, set the default ones right now
     */
    _.each(defaultPreferences, function (definition, key, type, value) {
        extensionPrefs.definePreference(key, definition.type, definition.value);
    });
    
    /**
     * @param {!string} key
     * @return {!string}
     */
    function get(key) {
        return extensionPrefs.get(key);
    }
    
    /**
     * @param {!string} key
     * @param {!string/boolean/number} value
     */
    function set(key, value) {
        return extensionPrefs.set(key, value, {
            location: {
                scope: "user"
            }
        });
    }
    
    //Define public API
    exports.getPreference = get;
    exports.setPreference = set;
});

