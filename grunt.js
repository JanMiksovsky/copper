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
            common: {
                src: sortDependencies.sortFiles(
                    "common/*.coffee",
                    "common/*/*.coffee"
                ),
                dest: "build/common.js"
            },
            // Code that generates puzzles not included by run-time client pages.
            gen: {
                src: "gen/*.coffee",
                dest: "build/gen.js"
            },
            dup: {
                src: sortDependencies.sortFiles( "dup/*.coffee", "dup/*/*.coffee" ),
                dest: "client/dup/dup.js"
            },
            duplang: {
                src: sortDependencies.sortFiles( "duplang/*.coffee", "duplang/*/*.coffee" ),
                dest: "client/duplang/duplang.js"
            },
            karma: {
                src: sortDependencies.sortFiles( "karma/*.coffee", "karma/*/*.coffee" ),
                dest: "client/karma/karma.js"
            },
            password: {
                src: sortDependencies.sortFiles( "server/password/*.coffee" ),
                dest: "build/password.js",
                options: { bare: true }
            },
            timeline: {
                src: sortDependencies.sortFiles( "timeline/*.coffee", "timeline/*/*.coffee" ),
                dest: "client/timeline/timeline.js"
            },
            server: {
                src: "server/*.coffee",
                dest: "app.js",
                options: { bare: true }
            },
            test: {
                src: "test/*.coffee",
                dest: "test/unittests.js"
            }
        },
        concat: {
            // The copper.js and copper.css files contain a concatenation of
            // files shared by all Copper UI.
            copperCss: {
                src: [
                    "lib/quickui.css",
                    "lib/quickui.catalog.css",
                    "build/common.css"
                ],
                dest: "client/copper.css"
            },
            copperJs: {
                src: [
                    "lib/jquery-1.8.2.js",
                    "lib/quickui.js",
                    "lib/quickui.catalog.js",
                    "lib/seedrandom.js",
                    "build/common.js"
                ],
                dest: "client/copper.js"
            }
        },
        less: {
            all: {
                files: {
                    "build/common.css": sortDependencies.sortFiles( "common/*.less", "common/*/*.less" ),
                    "client/dup/dup.css": sortDependencies.sortFiles( "dup/*.less", "dup/*/*.less" ),
                    "client/duplang/duplang.css": sortDependencies.sortFiles( "duplang/*.less", "duplang/*/*.less" ),
                    "client/karma/karma.css": sortDependencies.sortFiles( "karma/*.less", "karma/*/*.less" ),
                    "client/timeline/timeline.css": sortDependencies.sortFiles( "timeline/*.less", "timeline/*/*.less" )
                }
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee less concat" );
    
};
