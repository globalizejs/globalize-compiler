module.exports = function( grunt ) {

	"use strict";

	var pkg = grunt.file.readJSON( "package.json" );

	grunt.initConfig({
		pkg: pkg,
		commitplease: {
			all: {
				options: {
					committish: "--root"
				}
			}
		},
		jshint: {
			options: {
				jshintrc: ".jshintrc"
			},
			source: {
				src: [ "index.js", "src/**/*.js" ]
			},
			grunt: {
				src: [ "Gruntfile.js" ]
			}
		},
		jscs: {
			source: [ "index.js", "src/**/*.js" ],
			grunt: "Gruntfile.js"
		},
		checkDependencies: {
			npm: {
				options: {
					packageManager: "npm"
				}
			}
		}
	});

	require( "matchdep" ).filterDev( "grunt-*" ).forEach( grunt.loadNpmTasks );

	// Default task.
	grunt.registerTask( "default", [
		"jshint:grunt",
		"jshint:source",
		"jscs:grunt",
		"jscs:source",
		"commitplease"
	]);

};
