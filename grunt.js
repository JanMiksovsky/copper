/*
 * Grunt file to build the QuickUI Catalog.
 *
 * This has to encompass two separate build systems: one for new controls built
 * with CoffeeScript + LESS, and one for older controls built with QuickUI
 * Markup (http://github.com/JanMiksovsky/quickui-markup). Both types of
 * controls are built separate, and the output of both are then combined.
 */

module.exports = function(grunt) {

    grunt.loadTasks( "../quickui/grunt" );
    grunt.loadNpmTasks( "grunt-contrib-less" );

    var sortDependencies = require( "sort-dependencies" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            app: {
                src: "app.coffee",
                dest: "app.js",
                options: { bare: false }
            },
            controls: {
                src: sortDependencies.sortFiles( "controls/*.coffee" ),
                dest: "build/controls.js",
                options: { bare: false }
            },
            facebook: {
                src: sortDependencies.sortFiles( "facebook/*.coffee" ),
                dest: "build/facebook.js",
                options: { bare: false }
            },
            missions: {
                src: sortDependencies.sortFiles(
                    "citizen/*.coffee",
                    "satellite/*.coffee",
                    "terminal/*.coffee",
                    "timeline/*.coffee"
                ),
                dest: "build/missions.js",
                options: { bare: false }
            },
            os: {
                src: sortDependencies.sortFiles(
                    "terminal/shell/*.coffee",
                    "terminal/commands/*.coffee"
                ),
                dest: "build/os.js",
                options: { bare: false }
            },
            utilities: {
                src: sortDependencies.sortFiles( "utilities/*.coffee" ),
                dest: "build/utilities.js",
                options: { bare: false }
            }
        },
        concat: {
            js: {
                src: [
                    /* These initial declarations should come before the missions. */
                    "lib/*.js",
                    "build/utilities.js",
                    "build/controls.js",
                    "build/facebook.js",
                    /* Remaining declarations can come in any order. */
                    "build/missions.js",
                    "build/os.js"
                ],
                dest: "copper.js"
            }
        },
        less: {
            all: {
                files: {
                    "copper.css": sortDependencies.sortFiles( "*/*.less" )
                }
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee less concat" );
    
};
