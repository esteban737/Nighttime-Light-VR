
function requireAll (req) { req.keys().forEach(req); }

// Require all components.
requireAll(require.context('./components/', true, /\.js$/));
requireAll(require.context('./systems/', true, /\.js$/));

require('./scene.html');
