var shell = require("shelljs");

module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			files: ['package.son', 'examples/*.stps'],
			tasks: ['stripes', 'stripes-examples']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('stripes', "compile script", function() {
		shell.exec('stripes package.son = package.json');
	});

	grunt.registerTask('stripes-examples', "compile examples", function() {
		shell.exec('stripes -s examples/booleans.stps=examples/js/booleans.js');
		shell.exec('stripes -s examples/case.stps=examples/js/case.js');
		shell.exec('stripes -s examples/comments.stps=examples/js/comments.js');
		shell.exec('stripes -s examples/if.stps=examples/js/if.js');
		shell.exec('stripes -s examples/literal.litstps=examples/js/literal.js');
		shell.exec('stripes -s examples/pointers.stps=examples/js/pointers.js');
		shell.exec('stripes -s examples/prelude.stps=examples/js/prelude.js');
		shell.exec('stripes -s examples/ranges.stps=examples/js/ranges.js');
		shell.exec('stripes -s examples/strings.stps=examples/js/strings.js');
		shell.exec('stripes -s examples/technicalranges.stps=examples/js/technicalranges.js');
		shell.exec('stripes -s examples/try.sast=examples/js/try-ast.js');
		shell.exec('stripes -s examples/try.stps=examples/js/try.js');
	});

	grunt.registerTask('stripes-tests', "run unit tests", function() {
		shell.exec('nodeunit src/tests.js');
	});

	grunt.registerTask('default', ['stripes', 'stripes-examples', 'stripes-tests']);
};
