define(function (require, exports) {
    "use strict";
    
    //Dependencies
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var extensionPrefs = PreferencesManager.getExtensionPrefs("brackets-pdfexport");
    var _ = brackets.getModule("thirdparty/lodash");
    
    //Default Preferences
    var defaultPreferences = {
        "topMargin": { type: "number", value: 72}, //
        "leftMargin": { type: "number", value: 72 }, //
        "rightMargin": { type: "number", value: 72 }, //
        "bottomMargin": { type: "number", value: 72 }, //
        "fontSize": { type: "number", value: 10 },
        "rangeExport": { type: "string", value: "whole" },
        "openAfterExport": { type: "boolean", value: 1 }
    }
    
    //Check if each preferences is set, if not set it as the default preference value
    _.each(defaultPreferences, function(definition, key, type, value) {
        if(!extensionPrefs.get(key)) {
            extensionPrefs.definePreference(key, definition.type, definition.value);
        }
    });
    
    function get(key) {
        return extensionPrefs.get(key);
    }
    
    function set(key, value) {
        // Will be implemented later
    }
    
    function getAllPreferences() {
        // Will be implemented later
    }
    
    //Define public API
    exports.getPreference = get;
    exports.setPreference = set;
});
