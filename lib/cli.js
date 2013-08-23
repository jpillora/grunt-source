var colors = { red:'\u001b[31m', blue:'\u001b[34m', reset: '\u001b[0m' },
    _ = require('lodash'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    loadGruntTasks = require('load-grunt-tasks'),
    semver = require('semver'),
    mkdirp = require('mkdirp'),
    child = require('child_process'),
    defaultFileName = "Gruntsource.json",
    srcPkg = require("../package.json"),
    ONE_DAY = 1000 * 60 * 60 * 24,
    projectDir = process.cwd(),
    home = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH;

var config = null;
//get config and run
if(fs.existsSync(defaultFileName)) {
  try {
    config = JSON.parse(fs.readFileSync(defaultFileName));
  } catch(e) {
    exit("Configuration file '%s' has an error: %s", defaultFileName, e);
  }
} else if(fs.existsSync("package.json")) {
  try {
    var pkg = JSON.parse(fs.readFileSync("package.json"));
    config = pkg.gruntSource;
  } catch(e) {
    exit("package.json file has an error: %s", e);
  }
}

if(!config)
  exit("Configuration file '%s' not found.", defaultFileName);

if(!config.source)
  exit("Configuration is missing the 'source' property");

if(config.repository)
  config.repo = config.repository;

if(/^~/.test(config.source))
  config.source = path.join(home, config.source.replace(/^~/,''));

config.source = path.resolve(config.source);

if(fs.existsSync(config.source))
  pull();
else if(config.repo)
  clone();
else
  exit("Source directory '%s' not found." +
    " To auto-install, add a 'repository' field to your configuration.", config.source);

// =======================


function clone() {
  log("Creating Source... (git clone)");
  
  mkdirp.sync(path.dirname(config.source));
  spawn("git", ['clone', config.repo, config.source], function (err) {
    if(err) exit("Git clone error");

    //new directory - queue up init task
    process.argv.splice(2, 0, 'init');
    if(process.argv.length === 3)
      process.argv.splice(3, 0, 'default');

    update();
  });
}

function pull() {
  //grab pull file
  var fetchHead = path.join(config.source,'.git','FETCH_HEAD');
  //check last access time so we only pull once per day
  if(fs.existsSync(fetchHead) &&
     Date.now() - fs.statSync(fetchHead).atime.getTime() > ONE_DAY) {
    log("Updating Source... (git pull)", config.source);
    spawn("git", ['pull'], {
      cwd: config.source
    }, function (err) {
      if(err) exit("Git pull error");
      update();
    });
  } else {
    validateSource();
  }
}

function update() {
  log("Updating Source Modules... (npm install)");

  if(!fs.existsSync(path.join(config.source,'package.json')))
    exit("Source directory has no 'package.json'");

  spawn("npm", ["install"], { cwd: config.source }, function(err) {
    if(err) exit("Error npm updating");
    validateSource();
  });
}


function validateSource() {
  //TODO
  //git remote -v show === config.repo

  //if dependency exists, check that its satisfied 
  if(config.dependency &&
     !semver.satisfies(srcPkg.version, config.dependency))
    exit("Source (%s) requires 'grunt-source' v%s and you have v%s installed.",
         config.source, config.dependency, srcPkg.version);

  run();
}

function run() {
  var gruntpath = path.join(config.source, 'node_modules', 'grunt');
  var gruntfile = path.join(config.source, 'Gruntfile.coffee');

  if(!fs.existsSync(gruntpath))
    exit("grunt module not found: '" +gruntpath + "'");

  var grunt = require(path.resolve(gruntpath));

  grunt.source = {};

  //grunt.source API
  _.extend(grunt.source, {
    init: function() {
      process.chdir(projectDir);
    },
    //change to project dir and load tasks
    loadAllTasks: function() {
      process.chdir(config.source);
      loadGruntTasks(grunt);
      if(grunt.file.isDir("./tasks"))
        grunt.loadTasks("./tasks");
      grunt.source.init();
      if(grunt.file.isDir("./tasks"))
        grunt.loadTasks("./tasks");
    },
    dir: config.source
  }, config);

  //remove dup
  delete grunt.source.source;

  //patch config.init to merge "config" (if it exists)
  if(config.config) {
    var initConfig = grunt.config.init;
    grunt.config.init = grunt.initConfig = function(obj) {
      return initConfig.call(grunt, _.merge(obj, config.config));
    };
  }

  //use "source" dir for initialisation
  process.chdir(config.source);

  //load inbuilt grunt-source in the context of "source" dir
  grunt.loadTasks(path.join(__dirname, "tasks"));

  grunt.cli();
}

function log() {
  console.log(colors.blue + util.format.apply(util, arguments) + colors.reset);
}

function exit() {
  console.log(colors.red + util.format.apply(util, arguments) + colors.reset);
  process.exit(1);
}

function spawn() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var proc = child.spawn.apply(child, args);
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
  proc.on('close', function (code) {
    callback(code === 0 ? null : "error");
  });
  return proc;
}

