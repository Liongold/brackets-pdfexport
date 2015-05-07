module.exports = function(grunt) {

    // Configure project
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '../.jshintrc'
            },
            all: ['**.js', 'thirdparty/**/**.js']
        },
        // I'm unsure about how concatenate will work. uglify depends on it. 
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */\n',
            },
            all: {
                //src: ['FileSystemDomain.js', 'PDFDocument.js', 'Dialogs.js', 'Preferences.js', 'main.js'],
                src: ['main.js', 'Preferences.js', 'Dialogs.js', 'PDFDocument.js'/*, 'FileSystemDomain.js'*/],
                dest: 'ExportPDF.js'
            }
        },
        uglify: {
            all: {
                options: {
                    mangle: false
                },
                files: {
                    'ExportPDF.min.js': 'ExportPDF.js'
                }
            }
        },
        /*compress: {
            options: {
                archive: 'ExportPDF-v<%= pkg.version %>.zip'
            }
            files: [
                
            ]
        }*/
        requirejs: {
            compile: {
                options: {
                    useStrict: true,
                    out: '../distribution/ExportPDF.js',
                    name: 'main'
                }
            }
        }
    });

    // Load the plugins required
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-compress');

    // Register Alias Tasks
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'compress']);
}