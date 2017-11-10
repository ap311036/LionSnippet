// LOAD MODULES =================================================================
var express    = require('express');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');
var path = require('path');
var app = express();
var router = express.Router();
var port = process.env.PORT || 2293;

// SETUP EXPRESS APPLICATION ====================================================
app.use('/', router);
app.use('/', serveIndex('./', {
	'icons': true,
	'view': 'details',
	'filter': function(filename, index, files, dir) {
		if ( filename == 'node_modules' || filename == 'server.js' || /\.ejs$/.test(filename) || filename == 'gruntfile.js' ) {
			return false;
		} else {
			return true;
		}
	}
}));
app.use(serveStatic(__dirname, {
	'index': ['default.html', 'default.htm'],
}));

app.listen(port);

router.use('/',function(req,res,next){
	console.log('%s %s',req.method,req.url||req.path);
	next();
});

router.post('/develop/_shared/json/keyword.json', function (req, res) {
  res.sendFile( path.resolve(__dirname, './develop/_shared/json/keyword.json') );
});