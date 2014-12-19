'use strict';

module.exports = function(grunt) {



  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-apidoc');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        '.'
      ],
      options: {
        jshintrc: '.jshintrc',
        jshintignore: '.jshintignore'
      }
    },

    clean: {
      js: [
        'static/js/*.js'
      ],
      css: [
        'static/css/*.css'
      ]
    },

    concat: {
      options: {
        process: function(src, filepath) {
          if (filepath.substr(filepath.length - 2) === 'js') {
            return '// Source: ' + filepath + '\n' +
              src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
          } else {
            return src;
          }
        }
      },
      vendors: {
        src: [
          'lib/bootstrap/dist/js/bootstrap.min.js',
          'lib/underscore/underscore-min.js',
          'lib/codemirror/lib/codemirror.js'
        ],
        dest: 'static/js/vendors.js'
      },
      angular: {
        src: [
          'lib/angular/angular.js',
          'lib/angular-route/angular-route.min.js',
          'lib/angular-load/angular-load.min.js',
          'lib/angular-ui-codemirror/ui-codemirror.min.js'
        ],
        dest: 'static/js/angularjs-all.js'
      },
      main: {
        src: [
          'static/src/js/app.js',
          'static/src/js/config.js',
          'static/src/js/services/*.js',
          'static/src/js/controllers/*.js',
          'static/src/js/directives/*.js',
          'static/src/js/filters.js',
          'static/src/js/init.js',
        ],
        dest: 'static/js/main.js'
      },
      css: {
        src: [
          'lib/bootstrap/dist/css/bootstrap.min.css',

          'lib/cmtheme/neat.css',
          'static/src/css/**/*.css'
        ],
        dest: 'static/css/main.css'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n',
        mangle: false
      },
      vendors: {
        src: '',
        dest: ''
      },
      angular: {
        src: '',
        dest: ''
      },
      main: {
        src: '',
        dest: ''
      }
    },

    cssmin: {
      css: {
        src: 'static/css/main.css',
        dest: 'static/css/main.min.css'
      }
    },

    // apidoc configuration.
    apidoc: {
      app: {
        src: '.',
        dest: 'static/docs/',
        options: {
          excludeFilters: [
            'node_modules/',
            'obj/'
          ]
        }
      }
    },

    express: {
      options: {
        port: 8000,
        hostname: '*'
      },
      dev: {
        options: {
          script: 'index.js'
        }
      },
      prod: {
        options: {
          script: 'index.js',
          node_env: 'production'
        }
      }
    }
  });

  grunt.registerTask('default', [
    'clean:js',
    'clean:css',
    'concat',
    'cssmin',
    'express:dev'
  ]);

  grunt.registerTask('dev', ['clean', 'concat', 'express:prod']);
  grunt.registerTask('prod', ['clean', 'concat', 'express:prod']);
  grunt.registerTask('doc', ['clean', 'apidoc']);
};