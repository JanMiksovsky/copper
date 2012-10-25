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
                dest: "build/controls.js",
                options: { bare: false }
            },
            facebook: {
                src: sortDependencies.sortClassFiles( "facebook/*.coffee" ),
                dest: "build/facebook.js",
                options: { bare: false }
            },
            missions: {
                src: sortDependencies.sortClassFiles(
                    "citizen/*.coffee",
                    "satellite/*.coffee",
                    "timeline/*.coffee"
                ),
                dest: "build/missions.js",
                options: { bare: false }
            },
            utilities: {
                src: sortDependencies.sortClassFiles( "utilities/*.coffee" ),
                dest: "build/utilities.js",
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
                    /* These initial declarations should come before the missions. */
                    "lib/*.js",
                    "build/utilities.js",
                    "build/controls.js",
                    "build/facebook.js",
                    /* Remaining declarations can come in any order. */
                    "build/missions.js"
                ],
                dest: "dup.js"
            }
        },
        less: {
            all: {
                files: {
                    "dup.css": sortDependencies.sortClassFiles( "*/*.less" )
                }
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee less concat" );
    
};
