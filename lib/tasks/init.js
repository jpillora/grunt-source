var path = require('path');

var copyDefaults = function(grunt, src, dest) {

  if(!grunt.file.isDir(src)) return;

  grunt.file.recurse(src, function(abs, root, sub, file) {
    var srcFile = abs;

    var destFile = path.join(dest,sub||'',file);

    if (!grunt.file.exists(destFile)) {
      grunt.file.copy(srcFile, destFile);
      grunt.log.writeln("Added file '" + path.relative(".",destFile) + "'");
    }
  });
};

module.exports = function(grunt) {
  var sourceDir = process.cwd();
  var desc = 'Initialises a project with using a set of defaults';
  
  grunt.registerTask('init', desc, function() {
    var dest = process.cwd();
    //copy src-[args] -> dest
    for(var i = 0; i < arguments.length; i++)
      copyDefaults(grunt, path.join(sourceDir, 'init-'+arguments[i]), dest);
    //copy src -> dest
    copyDefaults(grunt, path.join(sourceDir, 'init'), dest);
  });
};


