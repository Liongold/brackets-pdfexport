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
        copy: {
            all: {
                files: [
                    {
                        expand: true,
                        src: ["htmlContent/**"],
                        dest: "../brackets-pdfexport"
                    },
                    {
                        expand: true,
                        src: ["nls/**"],
                        dest: "../brackets-pdfexport"
                    },
                    {
                        expand: true,
                        src: ["thirdparty/**"],
                        dest: "../brackets-pdfexport"
                    },
                    {
                        cwd: "../",
                        expand: true,
                        src:["README.md"],
                        dest: "../brackets-pdfexport",
                        filter: "isFile"
                    },
                    {
                        expand: true,
                        src: ["*.json"],
                        dest: "../brackets-pdfexport",
                        filter: "isFile"
                    },
                    {
                        cwd: "../",
                        expand: true,
                        src: ["LICENSE"],
                        dest: "../brackets-pdfexport",
                        filter: "isFile"
                    }
                ]
            }
        },
        uglify: {
           options: {
               mangle: false
           },
           all: {
               files: {
                   "../brackets-pdfexport/Dialogs.js": "Dialogs.js",
                   "../brackets-pdfexport/FileSystemDomain.js": "FileSystemDomain.js",
                   "../brackets-pdfexport/main.js": "main.js",
                   "../brackets-pdfexport/PDFDocument.js": "PDFDocument.js",
                   "../brackets-pdfexport/Preferences.js": "Preferences.js"
               }
           }
        },
        /*compress: {
            options: {
                archive: "../../<%= pkg.name %>-<%= pkg.version %>.zip"
            },
            src: ["../brackets-pdfexport/**"]
        }*/
        compress: {
            all: {
                options: {
                    archive: "../../<%= pkg.name %>.zip"
                },
                cwd: "../brackets-pdfexport",
                src: ["**"],
                //dest: "<%= pkg.name %>",
                expand: true
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");

    // Register Tasks 
    grunt.registerTask("default", ["jshint", "copy", "uglify", "compress"]);
};