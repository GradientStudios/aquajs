var spawn = require('child_process').spawn;

config.init({
  deps: {
    'git.submodule': true
  },
  concat: {
    'dist/aqua.js': '<config:lint.files>'
  },
  min: {
    'dist/aqua.min.js': ['dist/aqua.js']
  },
  qunit: {
    index: ['test/index.html']
  },
  lint: {
    files: ['lib/base.js', 'lib/object.js']
  }
});

task.registerBasicTask('deps', 'download dependencies', function(data, name) {
  var done = this.async();

  spawn('git', ['submodule', 'init']).on('exit', function() {
    spawn('git', ['submodule', 'update']).on('exit', function() {
      log.writeln('git submodule updated.');
      done();
    });
  });
});

// Default task.
task.registerTask('default', 'deps lint qunit concat min');
