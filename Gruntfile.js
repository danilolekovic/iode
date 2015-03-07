var shell = require("shelljs");

module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			files: ['package.son'],
			tasks: ['stripes']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('stripes', "compile script", function() {
		shell.exec('stripes -c package.son');
	});

	grunt.registerTask('default', ['stripes']);
};
