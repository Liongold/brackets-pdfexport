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
                        dest: "../distribution"
                    },
                    {
                        expand: true,
                        src: ["nls/**"],
                        dest: "../distribution"
                    },
                    {
                        expand: true,
                        src: ["thirdparty/**"],
                        dest: "../distribution"
                    },
                    {
                        cwd: "../",
                        expand: true,
                        src:["README.md"],
                        dest: "../distribution",
                        filter: "isFile"
                    },
                    {
                        expand: true,
                        src: ["*.json"],
                        dest: "../distribution",
                        filter: "isFile"
                    },
                    {
                        cwd: "../",
                        expand: true,
                        src: ["LICENSE"],
                        dest: "../distribution",
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
                   "../distribution/Dialogs.js": "Dialogs.js",
                   "../distribution/FileSystemDomain.js": "FileSystemDomain.js",
                   "../distribution/main.js": "main.js",
                   "../distribution/PDFDocument.js": "PDFDocument.js",
                   "../distribution/Preferences.js": "Preferences.js"
               }
           }
        },
        compress: {
            all: {
                options: {
                    archive: "../../<%= pkg.name %>.zip"
                },
                cwd: "../distribution",
                src: ["**"],
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