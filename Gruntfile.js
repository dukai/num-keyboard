
module.exports = function(grunt) {

	var config = require('./grunt-config/global');

	grunt.initConfig({
		config: config,
		less: {
			dev: {
				options: {
					paths: ["less"]
				},
				files: [{
					expand: true,
					cwd: '<%= config.webroot %>/less/',
					src: ['**/*.less'],
					dest: 'src/css/',
					ext: '.css',
					extDot: 'first' //Extensions in filenames begin after the first dot
				},
				],
			},
            dist: {
                options: {
                    paths: ["less"],
                    compress: true
                },
                files: [
                    {
                        expand: true,     //Enable dynamic expansion.
                        cwd: '<%= config.webroot %>/less/',      //Src matches are relative to this path.
                        src: ['**/*.less'], //Actual pattern(s) to match.
                        dest: 'src/css/',   //Destination path prefix.
                        ext: '.css',   //Dest filepaths will have this extension.
                        extDot: 'first'   //Extensions in filenames begin after the first dot
                    },
                ],
            }
		},

		clean: {
            tests: ['dist'],
            tmpl: ['src/js/app/**/*.tmpl.js', 'src/js/comp/**/*.tmpl.js']
        },

        inline_text: {
            def: {
                files: [{
                    expand: true,
                    cwd: '<%= config.webroot %>',
                    src: ['js/app/**/*.tmpl', 'js/comp/**/*.tmpl'],
                    dest: '<%= config.webroot %>'
                }]
            }
        },

		requirejs: {
			compile: {
				options: {
					appDir: '<%= config.webroot %>',
					baseUrl: "js",
					dir: '<%= config.dist %>',
					mainConfigFile: '<%= config.webroot %>/js/rs-config.js',
					optimize: 'uglify',
					skipDirOptimize: true,
                    fileExclusionRegExp: /^\.|\.less$/,
					modules: [].concat(require('./grunt-config/requirejs-modules'))
				}
			},

            test: {
                options: {
                    appDir: '<%= config.webroot %>',
                    baseUrl: "js",
                    dir: '<%= config.dist %>',
                    mainConfigFile: '<%= config.webroot %>/js/rs-config.js',
                    optimize: 'none',
                    skipDirOptimize: true,
                    optimizeAllPluginResources: true,
                    fileExclusionRegExp: /^\.|\.less$/,
                    modules: []
                }
            }
		},

		watch: {
            options: {
                livereload: 35729
            },
            less: {
                files: ['<%= config.webroot %>/less/**/*.less'],
                tasks: [
                	'less:dev'
                ],
                options: {
                    nospawn: true
                }
            },
            html: {
                files: ['<%= config.webroot %>/**/*'],
                tasks: [],
                options: {
                    nospawn: true
                }
            },
            express: {
                files: ['server/**/*.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false
                }
            },
        },
        cacheBust: {
        	options: {
        		encoding: 'utf8',
        		algorithm: 'md5',
        		length: 16,
        		deleteOriginals: true,
        		jsonOutput: true,
        		ignorePatterns: ['test', 'require.js', 'bootstrap', 'jquery', 'moment'],
        		baseDir: '<%= config.dist %>',
                filters: {
                    'script': [
                        function() {
                            return this.attribs['data-main'];
                        },
                        function() {
                            return this.attribs.src;
                        }
                    ]
                }
            },
        	assets: {
        		files: [
	        		{   
	        			expand: true,
	        			cwd: '<%= config.dist %>',
	        			src: ['css/**/*.css', 'page/**/*.html']
	        		}
                  ]
        	}
        },

		bust_requirejs_cache: {
			default:{
				options:{
					dist: '<%= config.dist%>',
                    appDir: '<%= config.dist%>',
                    ignorePatterns: ['jquery', 'rs-config', 'moment'],
                    shortHash: true
				},
				files: [{
					expand: true,
					cwd: '<%= config.dist %>',
					src: ['page/**/*.html', 'js/app/widget/*.js'],
					dest: '<%= config.dist%>'
				}]
			}
		},

		replace: {
			dist: {
				options: {
					patterns: [{
						match: /([\("'])((\.+\/)+)(.*?[\("'])/ig,
						replacement: function() {
							return arguments[1] + config.staticHost + arguments[4];
						}
					}]
				},
				files: [{
					expand: true,
					cwd: '<%= config.dist %>',
                    src: ['page/**/*.html', 'css/**/*.css', 'js/app/static-config.js'], 
					dest: '<%= config.dist %>'
				}]
			}
		},

        source_map: {
            bust:{
                options:{
                    dist: '<%= config.dist%>',
                    java: '<%= config.javaFile%>',
                    filename: 'source-map.json'
                },
                files: [{
                    expand: true, 
                    cwd: '<%= config.dist %>',
                    src: ['grunt-cache-bust.json', 'resource-map.json'], 
                    dest: '<%= config.dist %>'
                }]
            },
            debug: {
                options: {
                    nomap: true,
                    java: '<%= config.javaFile%>',
                    filename: 'source-map.json'
                }
            }
        },

        copy: {
            main: {
                options:{},
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: ['js/**/*', 'css/**/*', 'images/**/*'],
                    dest: '<%= config.copyto%>',
                    filter: 'isFile'
                }]
            }
        },

        express: {
            options:{
                port: config.expressPort
            },
            dev: {
                options: {
                    script: 'server/index.js'
                }
            },
            dist: {
                options: {
                    script: 'server/dist.js'
                }
            }
        }

	});

	grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-cache-bust-alt');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-bust-requirejs-cache');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-inline-text');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-source-map');

    grunt.registerTask('dev', ['express:dev', 'watch']);
	grunt.registerTask('debug', [
		'clean',
        'less:dev',
        'inline_text',
        'requirejs:debug',
        'clean:tmpl',
        'replace',
        'source_map:debug'
		]);
	grunt.registerTask('release', [
		'clean',
        'less:dist',
        'requirejs:compile',
        'cacheBust',
        'bust_requirejs_cache',
        'replace',
        'source_map:bust'
		]);

};
