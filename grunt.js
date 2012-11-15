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
            app: {
                src: "app.coffee",
                dest: "app.js"
            },
            controls: {
                src: sortDependencies.sortFiles( "controls/*.coffee" ),
                dest: "build/controls.js"
            },
            facebook: {
                src: sortDependencies.sortFiles( "facebook/*.coffee" ),
                dest: "build/facebook.js"
            },
            missions: {
                src: sortDependencies.sortFiles(
                    "chatter/*.coffee",
                    "citizen/*.coffee",
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
            test: {
                src: "test/*.coffee",
                dest: "test/unittests.js"
            },
            /* Build-time tools, not included in client. */
            tools: {
                src: "password/gen/*.coffee",
                dest: "build/tools.js"
            },
            utilities: {
                src: sortDependencies.sortFiles( "utilities/*.coffee" ),
                dest: "build/utilities.js"
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
                    "build/passwordCombinations.js",
                    "build/missions.js",
                    "build/os.js"
                ],
                dest: "client/copper.js"
            }
        },
        gen: {
            dest: "build/passwordCombinations.js"
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

    // Build everything
    grunt.registerTask( "all", "coffee:tools gen default" );

    // Generate password combinations file.
    grunt.registerMultiTask( "gen", "Generate password puzzle combinations", function() {

        var passwordCombinations = require( "./build/tools.js" );
        var path = require( "path" );
        var fs = require( "fs" );

        dest = path.resolve( this.data );
        puzzles = passwordCombinations.puzzles();
        json = JSON.stringify( puzzles );
        js = "var passwordCombinations = " + json + ";"
        fs.writeFileSync( dest, js );

    });
    
};
