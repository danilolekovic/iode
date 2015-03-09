var shell = require("shelljs");

module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			files: ['package.son', 'examples/*.stps'],
			tasks: ['stripes']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('stripes', "compile script", function() {
		shell.exec('stripes -ns package.son');
	});

	grunt.registerTask('stripes-examples', "compile examples", function() {
		shell.exec('stripes -s examples/call.stps examples/js/call.js');
		shell.exec('stripes -s examples/case.stps examples/js/case.js');
		shell.exec('stripes -s examples/comments.stps examples/js/comments.js');
		shell.exec('stripes -s examples/if.stps examples/js/if.js');
		shell.exec('stripes -s examples/ranges.stps examples/js/ranges.js');
		shell.exec('stripes -s examples/strings.stps examples/js/strings.js');
		shell.exec('stripes -s examples/try.stps examples/js/try.js');
	});

	grunt.registerTask('default', ['stripes', 'stripes-examples']);
};
