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
                dest: "build/dup.js"
            },
            duplang: {
                src: sortDependencies.sortFiles( "duplang/*.coffee", "duplang/*/*.coffee" ),
                dest: "build/duplang.js"
            },
            facebook: {
                src: sortDependencies.sortFiles( "facebook/*.coffee" ),
                dest: "build/facebook.js"
            },
            karma: {
                src: sortDependencies.sortFiles( "karma/*.coffee", "karma/*/*.coffee" ),
                dest: "build/karma.js"
            },
            password: {
                src: sortDependencies.sortFiles( "server/password/*.coffee" ),
                dest: "build/password.js"
            },
            timeline: {
                src: sortDependencies.sortFiles( "timeline/*.coffee", "timeline/*/*.coffee" ),
                dest: "build/timeline.js"
            },
            server: {
                src: "server/*.coffee",
                dest: "build/server.js"
                // options: { bare: true }
            },
            test: {
                src: "test/*.coffee",
                dest: "test/unittests.js"
            }
        },
        concat: {
            dupCss: {
                src: [ "build/common.css", "build/dup.css" ],
                dest: "client/dup/dup.css"
            },
            dupJs: {
                src: [ "lib/*.js", "build/common.js", "build/dup.js" ],
                dest: "client/dup/dup.js"
            },
            duplangCss: {
                src: [ "build/common.css", "build/duplang.css" ],
                dest: "client/duplang/duplang.css"
            },
            duplangJs: {
                src: [ "lib/*.js", "build/common.js", "build/duplang.js" ],
                dest: "client/duplang/duplang.js"
            },
            karmaCss: {
                src: [ "build/common.css", "build/facebook.css", "build/karma.css" ],
                dest: "client/karma/karma.css"
            },
            karmaJs: {
                src: [ "lib/*.js", "build/common.js", "build/facebook.js", "build/karma.js" ],
                dest: "client/karma/karma.js"
            },
            server: {
                src: [ "build/server.js", "build/password.js" ],
                dest: "app.js"
            },
            timelineCss: {
                src: [ "build/common.css", "build/facebook.css", "build/timeline.css" ],
                dest: "client/timeline/timeline.css"
            },
            timelineJs: {
                src: [ "lib/*.js", "build/common.js", "build/facebook.js", "build/timeline.js" ],
                dest: "client/timeline/timeline.js"
            },
        },
        less: {
            all: {
                files: {
                    "build/common.css": sortDependencies.sortFiles( "common/*.less", "common/*/*.less" ),
                    "build/dup.css": sortDependencies.sortFiles( "dup/*.less", "dup/*/*.less" ),
                    "build/duplang.css": sortDependencies.sortFiles( "duplang/*.less", "duplang/*/*.less" ),
                    "build/facebook.css": sortDependencies.sortFiles( "facebook/*.less" ),
                    "build/karma.css": sortDependencies.sortFiles( "karma/*.less", "karma/*/*.less" ),
                    "build/timeline.css": sortDependencies.sortFiles( "timeline/*.less", "timeline/*/*.less" )
                }
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee less concat" );
    
};
