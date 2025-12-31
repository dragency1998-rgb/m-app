// Re-export the actual config from the config folder
const path = require('path');
module.exports = require(path.join(__dirname, 'config', 'next.config.js'));

