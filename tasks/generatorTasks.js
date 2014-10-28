
var curVersion = 'v45';

var request = require('request');

module.exports = function(grunt) {

  var firebaseUrl = 'webhook';
  var firebaseUri = null;
  if(firebaseUrl) {
    firebaseUri = 'https://' + firebaseUrl +  '.firebaseio.com/generator_version.json';
  }

  var checkVersion = function(callback) {
    if(firebaseUri === null) {
      callback();
    } else {
      request({ url: firebaseUri, json: true }, function(e, r, body) {
        if(body) {
          if(body !== curVersion) {
            console.log('========================================================'.red);
            console.log('# This site is using old Webhook code.     #'.red);
            console.log('========================================================'.red);
            console.log('#'.red + ' To update, run "wh update" in this folder.')
            console.log('# ---------------------------------------------------- #'.red)
          }

          callback();
        } else {
          callback();
        }
      });
    }
  };

  var npmBin = grunt.option('npmbin');
  var nodeBin = grunt.option('nodebin');
  var gruntBin = grunt.option('gruntbin');
  var token = grunt.option('token');
  var email = grunt.option('token');

  var generator = require('../libs/generator').generator(grunt.config, { npm: npmBin, node: nodeBin, grunt: gruntBin, token: token, email: email }, grunt.log, grunt.file, root);

  grunt.registerTask('buildTemplates', 'Generate static files from templates directory', function() {
    var done = this.async();
    generator.renderTemplates(done, generator.reloadFiles);
  });

  grunt.registerTask('buildPages', 'Generate static files from pages directory', function() {
    var done = this.async();
    generator.renderPages(done, generator.reloadFiles);
  });

  grunt.registerTask('scaffolding', 'Generate scaffolding for a new object', function(name) {
    var done = this.async();

    var force = grunt.option('force');


    var result = generator.makeScaffolding(name, done, force);
  });

  grunt.registerTask('watch', 'Watch for changes in templates and regenerate site', function() {
    generator.startLiveReload();
    grunt.task.run('simple-watch');
  });

  grunt.registerTask('webListener', 'Listens for commands from CMS through websocket', function() {
    var done = this.async();
    generator.webListener(6557, done);
  });

  grunt.registerTask('clean', 'Clean build files', function() {
    var done = this.async();
    generator.cleanFiles(done);
  });

  // Build Task.
  grunt.registerTask('build', 'Clean files and then generate static site into build', function() {
    var done = this.async();

    var strict = grunt.option('strict');

    if(strict === true) {
      generator.enableStrictMode();
    }

    checkVersion(function() {
      generator.buildBoth(done, generator.reloadFiles);
    })
  });

  // Change this to optionally prompt instead of requiring a sitename
  grunt.registerTask('assets', 'Initialize the firebase configuration file (installer should do this as well)', function() {
    generator.assets(grunt);
  });

  grunt.registerTask('assetsMiddle', 'Initialize the firebase configuration file (installer should do this as well)', function() {
    generator.assetsMiddle(grunt);
  });

  grunt.registerTask('assetsAfter', 'Initialize the firebase configuration file (installer should do this as well)', function() {
    generator.assetsAfter(grunt);
  });

  // Change this to optionally prompt instead of requiring a sitename
  grunt.registerTask('init', 'Initialize the firebase configuration file (installer should do this as well)', function() {
    var done = this.async();

    var sitename = grunt.option('sitename');
    var secretkey = grunt.option('secretkey');
    var copyCms = grunt.option('copycms');
    var firebase = grunt.option('firebase');

    generator.init(sitename, secretkey, copyCms, firebase, done);
  });

  // Check if initialized properly before running all these tasks
  grunt.registerTask('default',  'Clean, Build, Start Local Server, and Watch', function() {
    grunt.task.run('build');
    grunt.task.run('configureProxies:wh-server');
    grunt.task.run('connect:wh-server');
    grunt.task.run('concurrent:wh-concurrent');
  });

};

module.exports.version = curVersion;
