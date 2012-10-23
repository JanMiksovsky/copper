/*
 * Grunt file to build the QuickUI Catalog.
 *
 * This has to encompass two separate build systems: one for new controls built
 * with CoffeeScript + LESS, and one for older controls built with QuickUI
 * Markup (http://github.com/JanMiksovsky/quickui-markup). Both types of
 * controls are built separate, and the output of both are then combined.
 */

module.exports = function(grunt) {

    grunt.loadTasks( "../../quickui/grunt" );
    grunt.loadNpmTasks( "grunt-contrib-less" );

    var sortDependencies = require( "../../quickui/grunt/sortDependencies.js" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            controls: {
                src: sortDependencies.sortClassFiles( "controls/*.coffee" ),
                dest: "controls/controls.js",
                options: { bare: false }
            },
            facebook: {
                src: sortDependencies.sortClassFiles( "facebook/*.coffee" ),
                dest: "facebook/facebook.js",
                options: { bare: false }
            },
            models: {
                src: sortDependencies.sortClassFiles( "models/*.coffee" ),
                dest: "models/models.js",
                options: { bare: false }
            },
            profile: {
                src: sortDependencies.sortClassFiles( "profile/*.coffee" ),
                dest: "profile/profile.js",
                options: { bare: false }
            },
            app: {
                src: "app.coffee",
                dest: "app.js",
                options: { bare: false }
            }
        },
        concat: {
            js: {
                src: [
                    "lib/*.js",
                    "facebook/facebook.js",
                    "models/models.js",
                    "controls/controls.js"
                ],
                dest: "dup.js"
            },
            css: {
                src: [
                    "facebook/facebook.css",
                    "controls/controls.css",
                ]
            }
        },
        less: {
            controls: {
                files: {
                    "controls/controls.css": sortDependencies.sortClassFiles( "controls/*.less" )
                }
            },
            facebook: {
                files: {
                    "facebook/facebook.css": sortDependencies.sortClassFiles( "facebook/*.less" )
                }
            },
            profile: {
                files: {
                    "profile/profile.css": sortDependencies.sortClassFiles( "profile/*.less" )
                }
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee less concat" );
    
};
