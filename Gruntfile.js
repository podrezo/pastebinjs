'use strict';

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-apidoc');

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

    // clear temporary dir.
    clean: {
      test: ["tmp"]
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
    }
  });

  grunt.registerTask('default', ['clean']);
  grunt.registerTask('doc', ['clean', 'apidoc']);
};
