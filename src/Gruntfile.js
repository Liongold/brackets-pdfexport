module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        // Start setting up tasks
        jshint: {
            options: {
                jshintrc: "../.jshintrc",
                force: true
            },
            all: ["**.js", "thirdparty/**.js", "nls/**/**.js"]
        },
        /*requirejs: {
            all: {
                options: {
                    name: "main",
                    out: "../distribution/main.js",
                    useStrict: true,
                    optimise: "uglify2",
                    uglify2: {}
                }
            }
        }*/
        compress: {
            options: {
                archive: "<%= pkg.name %>-<%= pkg.version %>.zip"
            },
            src: ["*.js", "*.json", "thirdparty/**", "nls/**", "htmlContent/**", "**.md", "LICENSE"]
        }
    });

    // Load tasks
    grunt.loadNpmTasks("grunt-contrib-jshint");
    //grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-compress");

    // Register Tasks 
    grunt.registerTask("default", ["jshint", /*"requirejs", */"compress"]);
};