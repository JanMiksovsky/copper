/*
 * Grunt file to build the QuickUI Catalog.
 *
 * This has to encompass two separate build systems: one for new controls built
 * with CoffeeScript + LESS, and one for older controls built with QuickUI
 * Markup (http://github.com/JanMiksovsky/quickui-markup). Both types of
 * controls are built separate, and the output of both are then combined.
 */

module.exports = function(grunt) {

    grunt.loadNpmTasks( "grunt-contrib-coffee" );
    grunt.loadNpmTasks( "grunt-contrib-less" );

    var sortDependencies = require( "sort-dependencies" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            controls: {
                src: sortDependencies.sortFiles( "controls/*.coffee" ),
                dest: "build/controls.js"
            },
            facebook: {
                src: sortDependencies.sortFiles( "facebook/*.coffee" ),
                dest: "build/facebook.js"
            },
            // Code that generates puzzles not included by run-time client pages.
            gen: {
                src: "gen/*.coffee",
                dest: "build/gen.js"
            },
            missions: {
                src: sortDependencies.sortFiles(
                    "chatter/*.coffee",
                    "citizen/*.coffee",
                    "coding/*.coffee",
                    "retail/*.coffee",
                    "password/*.coffee",
                    "satellite/*.coffee",
                    "terminal/*.coffee",
                    "timeline/*.coffee"
                ),
                dest: "build/missions.js"
            },
            os: {
                src: sortDependencies.sortFiles(
                    "terminal/shell/*.coffee",
                    "terminal/commands/*.coffee"
                ),
                dest: "build/os.js"
            },
            // Password used by both client (for testing) and server.
            password: {
                src: "password/*.coffee",
                dest: "build/password.js"
            },
            server: {
                src: "server/*.coffee",
                dest: "app.js",
                options: { bare: true }
            },
            test: {
                src: "test/*.coffee",
                dest: "test/unittests.js"
            },
            utilities: {
                src: sortDependencies.sortFiles( "utilities/*.coffee" ),
                dest: "build/utilities.js"
            }
        },
        concat: {
            client: {
                src: [
                    /* These initial declarations should come before the missions. */
                    "lib/*.js",
                    "build/utilities.js",
                    "build/controls.js",
                    "build/facebook.js",
                    /* Remaining declarations can come in any order. */
                    "build/missions.js",
                    "build/password.js",
                    "build/os.js"
                ],
                dest: "client/copper.js"
            }
            /*
            ,
            server: {
                src: [
                    "build/password.js",
                    "build/server.js"
                ],
                dest: "app.js"
            }
            */
        },
        less: {
            all: {
                files: {
                    "client/copper.css": sortDependencies.sortFiles( "*/*.less" )
                }
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee less concat" );
    
};
