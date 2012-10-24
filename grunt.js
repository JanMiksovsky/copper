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
            citizen: {
                src: sortDependencies.sortClassFiles( "citizen/*.coffee" ),
                dest: "build/citizen.js",
                options: { bare: false }
            },
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
            satellite: {
                src: sortDependencies.sortClassFiles( "satellite/*.coffee" ),
                dest: "build/satellite.js",
                options: { bare: false }
            },
            timeline: {
                src: sortDependencies.sortClassFiles( "timeline/*.coffee" ),
                dest: "build/timeline.js",
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
                    /* These initial declarations should come before the rest. */
                    "lib/*.js",
                    "build/utilities.js",
                    "build/controls.js",
                    "build/facebook.js",
                    /* Remaining declarations can come in any order. */
                    "build/citizen.js",
                    "build/satellite.js",
                    "build/timeline.js"
                ],
                dest: "dup.js"
            },
            css: {
                src: [
                    "build/*.css"
                ],
                dest: "dup.css"
            }
        },
        less: {
            citizen: {
                files: {
                    "build/citizen.css": sortDependencies.sortClassFiles( "citizen/*.less" )
                }
            },
            controls: {
                files: {
                    "build/controls.css": sortDependencies.sortClassFiles( "controls/*.less" )
                }
            },
            facebook: {
                files: {
                    "build/facebook.css": sortDependencies.sortClassFiles( "facebook/*.less" )
                }
            },
            satellite: {
                files: {
                    "build/satellite.css": sortDependencies.sortClassFiles( "satellite/*.less" )
                }
            },
            timeline: {
                files: {
                    "build/timeline.css": sortDependencies.sortClassFiles( "timeline/*.less" )
                }
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee less concat" );
    
};
