var colors = require('colors');

exports.err = function(msg) {
    console.log("[".red + "Stripes Error".red.bold + "]:\n".red + msg.green);
    process.exit(0);
};
