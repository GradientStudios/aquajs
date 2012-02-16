config.init({
  concat: {
    'dist/aqua.js': ['src/base.js', 'src/object.js']
  },
  min: {
    'dist/aqua.min.js': ['dist/aqua.js']
  },
  qunit: {
    index: ['test/index.html']
  },
  lint: {
    files: ['src/aqua.base.js', 'src/aqua.object.js']
  }
});

// Default task.
task.registerTask('default', 'lint qunit concat min');
