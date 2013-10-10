module.exports = function(grunt) {

  //this is important! it will:
  // load all grunt plugins in the source package.json
  // set the current directory to the project
  grunt.source.loadAllTasks();

  grunt.initConfig({
    uglify: {
      target1: {
        expand: true,
        cwd: "src/",
        src: "*.js",
        dest: "build"
      }
    }
  });

  grunt.registerTask("default", ["uglify"]);
};