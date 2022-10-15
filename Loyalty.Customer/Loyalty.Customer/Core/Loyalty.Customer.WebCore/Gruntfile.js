

/// <binding ProjectOpened='watch' />

var path = require("path");
var files = [];
var activeCSSBundle = false;

module.exports = function (grunt) {

    function getFiles(txtPath, txtName, prefix, dest) {
        result = grunt.file.read(path.resolve(txtPath) + path.sep + txtName);
        res2 = result.split("\n");
        res3 = [];
        for (var key in res2) {
            res3.push(prefix + res2[key]);
        }
        ret = {};
        ret[dest] = res3;
        return ret;
    }

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        //Make CSS 'bundle' 
        cssmin: {
            sitecss: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */'
                },
                files: {
                    'wwwroot/loyalty/css/bundle/site.css': ['wwwroot/loyalty/css/main-Loyalty.css']
                }
            },

            IEcss: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */',
                    advanced: false
                },
                files: {
                    'wwwroot/loyalty/css/bundle/site_1.css': ['wwwroot/loyalty/css/main-loyalty_1.css'],
                    'wwwroot/loyalty/css/bundle/site_2.css': ['wwwroot/loyalty/css/main-loyalty_2.css']
                }
            }
        },

        jshint: {
            grunt: ['Gruntfile.js'],
            jsmodule: ['wwwroot/loyalty/Scripts/Spa/**/*.js', '!wwwroot/loyalty/Scripts/Spa/app.bundle.js', '!wwwroot/loyalty/Scripts/Spa/app.bundle.raw.js']//,
            //jsmodulespec: ['../Loyalty.Customer.Tests/JavaScriptTests/spec/Spa/**/*.spec.js']
        },

        // Make Scripts bundle
        uglify: {
            options: {
                //mangle: false,
                sourceMap: true,
                sourceMapIncludeSources: true
            },
            Common: {
                files: getFiles("wwwroot/loyalty/SharedUI", "commonJS.txt", "wwwroot/loyalty/SharedUI/Scripts/", "wwwroot/loyalty/Scripts/bundle/common.js")
            },
            Vertical: {
                files: getFiles("wwwroot/loyalty/Scripts/app", "vertical.txt", "", "wwwroot/loyalty/Scripts/bundle/vertical.js")
            }
        },

        clean: {
            all: ['wwwroot/loyalty/Scripts/bundle/vertical.js', 'wwwroot/loyalty/css/bundle/site*.css'],
            commonJS: ['wwwroot/loyalty/Scripts/bundle/common.js'],
            verticalJS: ['wwwroot/loyalty/Scripts/bundle/vertical.js'],
            css: ['wwwroot/loyalty/css/bundle/site*.css'],
            sharedUI: ['wwwroot/loyalty/sharedUI']
        },

        shell: {
            // task options
            options: {
                stdout: true,
                stdin: false//,
                //execOptions: {
                //    cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                //}
            },

            updateJsCompileFlagFalse: {
                command: "echo internal class Invalid*TestClass { /* If you see this error, that means, your JS modules does not compile successfully. So, please check compilation error via Task Runner Explorer panel */ } > ..\\Loyalty.Customer.Tests\\TestClass.cs"
            },

            updateJsCompileFlagTrue: {
                command: "echo internal class ValidTestClass { } > ..\\Loyalty.Customer.Tests\\TestClass.cs"
            },

            checkoutbundles: {
                command: "tf.exe checkout " +
                    path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "common.js " +
                    path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "vertical.js " +
                    path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "common.js.map " +
                    path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "vertical.js.map " +
                    path.resolve("wwwroot/loyalty/css/bundle") + path.sep + "site*.css"
            },

            checkoutJS: {
                command: "tf.exe checkout " +
                    path.resolve("wwwroot/loyalty/Scripts/Spa") + path.sep + "app.bundle*",
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            },

            checkoutCSS: {
                command: "tf.exe checkout " + path.resolve("wwwroot/loyalty/css") + path.sep + "main-loyalty*.css " + path.resolve("wwwroot/loyalty/css") + path.sep + "main-loyalty.css.map",
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            },

            undoCSS: {
                command: "tf.exe undo " + path.resolve("wwwroot/loyalty/css") + path.sep + "main-loyalty*.css " + path.resolve("wwwroot/loyalty/css") + path.sep + "main-loyalty.css.map"
            },

            checkoutCommonJS: {
                command: "tf.exe checkout " + path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "common.js " + path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "common.js.map"
            },

            checkoutVerticalJS: {
                command: "tf.exe checkout " + path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "vertical.js " + path.resolve("wwwroot/loyalty/Scripts/bundle") + path.sep + "vertical.js.map",
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            },

            checkoutCSSbundles: {
                command: "tf.exe checkout " + path.resolve("wwwroot/loyalty/css/bundle") + path.sep + "site*.css",
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            },

            unmod: {
                command: "tf.exe status " + path.resolve() + " /recursive"
            },

            checkoutSharedUI: {
                command: function () {
                    return "tf.exe checkout " + path.resolve(grunt.task.current.args[0].replace(/&/g, "\\")) + " /recursive";
                },
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            },

            addSharedUI: {
                command: function () {
                    return "tf.exe add " + path.resolve(grunt.task.current.args[0].replace(/&/g, "\\")) + " /recursive";
                },
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            },

            deleteSharedUI: {
                command: function () {
                    return "tf.exe delete " + path.resolve(grunt.task.current.args[0].replace(/&/g, "\\")) + " /recursive";
                },
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            },

            reconcileSharedUI: {
                command: "tf.exe reconcile " + path.resolve("wwwroot/loyalty/SharedUI/*.txt") + " " + path.resolve("wwwroot/loyalty/SharedUI/fonts") + " " + path.resolve("wwwroot/loyalty/SharedUI/images") + " " + path.resolve("wwwroot/loyalty/SharedUI/scripts") + " " + path.resolve("wwwroot/loyalty/SharedUI/scss") + " /promote /adds /deletes /diff /recursive",
                options: {
                    execOptions: {
                        cwd: "C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE"
                    }
                }
            }
        },

        csssplit: {
            IEcss: {
                src: ['wwwroot/loyalty/css/main-loyalty.css'],
                dest: 'wwwroot/loyalty/css/main-loyalty.css',
                options: {
                    maxSelectors: 4095,
                    maxPages: 3,
                    suffix: '_'
                }
            },
        },

        // Grunt-sass 
        sass: {
            dist: {
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: 'wwwroot/sass/',      // Src matches are relative to this path.
                        src: ['*.scss'], // Actual pattern(s) to match.
                        dest: 'wwwroot/loyalty/css/',   // Destination path prefix.
                        ext: '.css',   // Dest filepaths will have this extension.
                    },
                ],
            },
            options: {
                sourceMap: true,
                outputStyle: 'expanded',
                includePaths: ["node_modules"]
            }
        },

        sync: {
            sharedUIpckg: {
                files: [{
                    cwd: "../packages/<%= grunt.task.current.args[0] %>/assets",
                    src: ['**'],
                    dest: 'SharedUI_temp'
                }],
                updateAndDelete: true,
                verbose: true,
                compareUsing: "md5" // compares via md5 hash of file contents, instead of file modification time. Default: "mtime" 
            },
        },

        //sync 2 folders but only update what has changed with overriding permissions
        smart_copy: {
            sharedUI: {
                files: [{
                    cwd: "SharedUI_temp",
                    src: ['**'],
                    dest: 'wwwroot/loyalty/SharedUI',
                }],
                writeCode: 666, // Overrite code 
            },
        },


        //check if files are different
        diff: {
            doCSS: {
                src: ['wwwroot/sass/**/*.{scss,sass}'],
                tasks: ['doCSS', 'doCSSBundle']
            },
            JS: {
                files: [{
                    expand: true,
                    cwd: "wwwroot/loyalty/Scripts",
                    src: ['**/*.js'],
                }],
                tasks: ['doVerticalJSBundle']
            }

        },

        browserify: {
            app: {
                src: ['wwwroot/loyalty/Scripts/Spa/app.js'],
                dest: 'wwwroot/loyalty/Scripts/Spa/app.bundle.raw.js',
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        },

        exorcise: { //extract inline source map to separate source map file, to prepare for uglify task
            bundle: {
                options: {
                    bundleDest: 'wwwroot/loyalty/Scripts/Spa/app.bundle.js'
                },
                files: {
                    'wwwroot/loyalty/Scripts/Spa/app.bundle.js.map': ['wwwroot/loyalty/Scripts/Spa/app.bundle.raw.js']
                }
            }
        },

        //All task that are under watch
        watch: {
            commonSPAjs: {
                files: ['wwwroot/loyalty/Scripts/vendors/kendo/widgets/*.js'],
                tasks: ['uglify:commonSPA'],
                options: {
                    event: ['added', 'changed', 'saved']
                }
            },

            verticalSPAjs: {
                files: ['wwwroot/loyalty/Scripts/Spa/**/*.js', 
                    '!wwwroot/loyalty/Scripts/Spa/app.bundle.js', 
                    '!wwwroot/loyalty/Scripts/Spa/app.bundle.raw.js'],
                tasks: ['doJS'],
                options: {
                    event: ['added', 'changed', 'saved']
                }
            },

            sass: {
                files: ['wwwroot/sass/**/*.{scss,sass}'],
                tasks: ['diff:doCSS'],
                options: {
                    event: ['added', 'changed'],
                }
            },

            //JS: {
            //    files: [
            //        'wwwroot/Scripts/**/*',
            //    ],
            //    tasks: ['diff:JS'],
            //    options: {
            //        event: ['added', 'changed'],
            //    }
            //},
            options: {
                // Sets livereload to true for livereload to work 
                // (livereload is not covered in this article)
                spawn: false
            }
        }
    });

    // load node modules
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-force-task');
    grunt.loadNpmTasks("grunt-csssplit");
    grunt.loadNpmTasks('grunt-hash');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-diff');
    grunt.loadNpmTasks('grunt-chmod');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-exorcise');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks('grunt-smart_copy');

    // register tasks
    grunt.registerTask('doJS', ['shell:updateJsCompileFlagFalse', 'jshint', 'force:shell:checkoutJS', 'browserify', 'exorcise', 'shell:updateJsCompileFlagTrue']);

    grunt.registerTask('enableBundle', 'enable bundle', function () {
        activeCSSBundle = true;
        console.log("enabling activeCSSBundle set to: " + activeCSSBundle);
    });

    grunt.registerTask('checkCSS', 'remove unused CSS if needed', function () {
        console.log("value activeCSSBundle: " + activeCSSBundle);
        if (!activeCSSBundle) {
            grunt.task.run('force:shell:undoCSS');
        }
        activeCSSBundle = false;
        console.log("enabling activeCSSBundle set to: " + activeCSSBundle);
    });

    // Compiles Sass into CSS and make the IE split
    grunt.registerTask('doCSS', ['force:shell:checkoutCSS', 'sass', 'csssplit']);

    // Do all bundles
    grunt.registerTask('doBundles', ['force:shell:checkoutbundles', 'clean:all', 'cssmin:sitecss', 'cssmin:IEcss', 'uglify:Common', 'uglify:Vertical']);

    // Do the vertical.js bundle
    grunt.registerTask('doVerticalJSBundle', ['force:shell:checkoutVerticalJS', 'clean:verticalJS', 'uglify:Vertical']);

    // Do all CSS bundles
    grunt.registerTask('doCSSBundle', ['enableBundle', 'force:shell:checkoutCSSbundles', 'clean:css', 'cssmin:sitecss', 'cssmin:IEcss']);

    // Get Shared Ui updated
    grunt.registerTask('updateSharedUI', function () {
        var SharedUiFolder = "";
        grunt.file.expand({
            filter: 'isDirectory',
            cwd: '../packages/'
        }, "SharedUi*").forEach(function (spath) {
            SharedUiFolder = spath;
        });
        grunt.log.write("Path: " + SharedUiFolder);
        //grunt.task.run('sync:sharedUIpckg:' + SharedUiFolder);//, 'diff:doCSS', 'diff:sharedJS');
        grunt.task.run('sync:sharedUIpckg:' + SharedUiFolder, 'smart_copy:sharedUI', "shell:reconcileSharedUI");//, 'diff:doCSS', 'diff:sharedJS');
    });

    // Run before deploy
    grunt.registerTask('CopyResources', ['smart_copy:css', 'smart_copy:scripts_bundle', 'smart_copy:scripts_vendors', 'smart_copy:scripts_spa', 'smart_copy:sharedui']);
};