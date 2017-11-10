const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractSCSS = new ExtractTextPlugin({
	filename: function(getPath) {
		return getPath('css/[name].css');
	},
	allChunks: false
});
const ExtractHTML = new ExtractTextPlugin({
	filename: function(getPath) {
		return getPath('../../[name].html');
	},
	allChunks: false
});
const EntryObj = function(entryDir, entryExt, customEntryObj) {
	let entry = {}
	fs.readdirSync(entryDir).forEach(function(file) {
		fileRegex = new RegExp('(\\w+)'+(!!entryExt && typeof entryExt == 'string' ? entryExt : '\.js'));
		fileEntry = file.match(fileRegex);
		!!fileEntry && (entry[RegExp.$1] = entryDir+file);
	});
	!!customEntryObj && typeof customEntryObj == 'object' && (entry = Object.assign(entry, customEntryObj));
	// console.log(entry);
	return entry;
}
const EntrySen = function(){
	let obj = EntryObj('./entry/', '.js');
	obj.app = './css/tourpackages.scss';
	console.log(obj)
	return obj;
}
module.exports = {
	entry: EntrySen(),
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, ( (env = 'develop') => {
			let assignRoot = {
				'production': './publish/_shared/bundle/',
				'release': './release/_shared/bundle/',
				'develop': './develop/_shared/bundle/'
			};
			return assignRoot[env];
		} )( process.env.NODE_ENV )),
		publicPath: './_shared/bundle/'
	},
	module: {
        rules: [
        	{
        		test: /\.ejs$/,
        		use: ExtractHTML.extract({
	                use: {
	                	loader: 'ejs-render-loader',
	                	options: {
	                		rmWhitespace: false,
	                		strict: false,
	                		filename: './',
	                		title: 'test',
	                		routerHashCode: function (str) {
								var hash = 5381,i = str.length;
								while(i) {hash = (hash * 33) ^ str.charCodeAt(--i);}
								return hash >>> 12;
							}
		            	}
	                }
	            })  
        	},
        	{
        		test: /\.js$/,
        		exclude: /(node_modules|bower_components)/,
        		use: [
        			{
        				loader: 'imports-loader?this=>window,jQuery=>this.jQuery,jquery=>jQuery'
        			},
	        		{
				        loader: 'babel-loader',
				        options: {
							presets: ['env']
				        }
				    },
        			{
        				loader: 'preprocess-loader',
        				options: {
        					ENVIRONMENT: ( (env = 'develop') => {
	                			let assignEnv = {
		                			'production': 'production',
									'release': 'release',
									'develop': 'develop'
	                			};
	                			return assignEnv[env];
	                		} )( process.env.NODE_ENV ),
        					DOMAIN: ( (env = 'develop') => {
        						let assignDomain = {
		                			'production': 'www.liontravel.com',
									'release': 'uwww.liontravel.com',
									'develop': 'localhost:2290'
	                			};
	                			return assignDomain[env];
        					} )( process.env.NODE_ENV )
        				}
        			}
			    ]
        	},
        	{
        		test: /\.png$|\.eot$|\.ttf$|\.svg$|\.woff$|\.gif/,
        		use: "file-loader?name=[hash].[ext]&publicPath=../&outputPath=files/"
        	},
	        {
	            test: /\.css$|\.scss$/,
	            use: ExtractSCSS.extract({
	                use: [
	                	{
		                	loader: 'css-loader',
		                	options: {
		                		minimize: false,
		                	}
		                },
		                {
		                	loader: 'sass-loader'
		                }
	                ],
	            })
	        }
        ]
    },
    devtool: "source-map",
    plugins: ( (env = 'develop') => {
    	let defaultPlugins = [
    		ExtractSCSS,
    		ExtractHTML,
    		new CopyWebpackPlugin([
				{ from: './lib/fancybox/source', to: './lib/fancybox/source' },
				{ from: './lib/jquery/dist', to: './lib/jquery/dist' },
				{ from: './lib/moment/min', to: './lib/moment/min' },
				{ from: './imgs', to: '../imgs' },
				{ from: './js', to: './js' },
				{ from: './json', to: '../json' },
				{ from: './rehtml', to: '../rehtml' },

			], {
				copyUnmodified: true,
				ignore: [
					'*.scss', '*.ejs'
				]
			}),
    		new WebpackShellPlugin({
				onBuildExit:[
					// (env === 'develop') ? 'node sass.compiler.js' : ''
				]
			})
    	];
    	let envPlugins = {
    		'production': [
    			new UglifyJSPlugin({
					compress: {
						drop_console: true
					}
				})
    		],
			'release': [],
			'develop': []
    	};
    	return defaultPlugins.concat(envPlugins[env]);
	} )( process.env.NODE_ENV )
};