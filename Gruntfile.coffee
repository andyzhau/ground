# Author: andyzhau@nodeswork.com (Andy Zhau)

module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    coffee:
      dev:
        options:
          bare: true
        files: [{
          expand: true
          cwd: 'src'
          src: ['**/*.coffee']
          dest: '.'
          ext: '.js'
        }]

  grunt.loadNpmTasks 'grunt-contrib-coffee'

  grunt.registerTask 'default', ['coffee:dev']
