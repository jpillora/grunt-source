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


//=========================
//  version handler

if(process.argv.indexOf("--version") > 0)
  log("Grunt Source version " + srcPkg.version);


//=========================
//  load config

var config = null;

if(fs.existsSync(defaultFileName)) {
  try {
    config = JSON.parse(fs.readFileSync(defaultFileName));
  } catch(e) {
    exit("Configuration file '%s' has an error: %s", defaultFileName, e);
  }
} else if(fs.existsSync("package.json")) {
  try {
    config = JSON.parse(fs.readFileSync("package.json")).gruntSource;
  } catch(e) {
    exit("package.json file has an error: %s", e);
  }
}

//=========================
//  check config

if(!config)
  exit("Configuration file '%s' not found.", defaultFileName);

if(!config.source)
  exit("Configuration is missing the 'source' property");

if(/^~/.test(config.source))
  config.source = path.join(home, config.source.replace(/^~/,''));

config.source = path.resolve(config.source);

//=========================
//  check repo

if(config.repository)
  config.repo = config.repository;

var repoRefs = {};
var repoRef = null;
var repoUpdated = false;



//=========================
//  executable checks and start

if(config.repo) {

  config.repo = config.repo.replace(/@(.+)$/, function(all, ref) {
    repoRef = ref;
    return '';
  });

  exec("git --version", function(nogit, out) {
    if(nogit)
      exit("Install 'git' to use the repo field");

    if(fs.existsSync(config.source))
      pull();
    else
      clone();
  });

} else {

  if(fs.existsSync(config.source))
    update();
  else
    exit("Source directory '%s' not found." +
      " To auto-install, add a 'repository' field to your configuration.", config.source);
}

// =======================

function clone() {
  log("Creating Source... (git clone)");

  mkdirp.sync(path.dirname(config.source));
  exec(["git","clone",config.repo,config.source].join(" "), function (err) {
    if(err) exit("Git clone error");

    //new directory - queue up init task
    process.argv.splice(2, 0, 'init');
    if(process.argv.length === 3)
      process.argv.splice(3, 0, 'default');

    repoUpdated = true;
    gitrefs();
  });
}

function pull() {
  //grab pull file
  var fetchHead = path.join(config.source,'.git','FETCH_HEAD');
  //check last access time so we only pull once per day
  if(wasModified(fetchHead)) {
    log("Updating Source... (git pull)", config.source);
    exec("git pull", { cwd: config.source }, function (err) {
      if(err) exit("Git pull error");
      repoUpdated = true;
      gitrefs();
    });
  } else {
    gitrefs();
  }
}

function gitrefs() {

  if(!fs.existsSync(path.join(config.source,'.git')))
    return update();

  exec("git show-ref --head --dereference", { cwd: config.source }, function(err, out) {
    if(err) exit("Error listing git references");

    var HEAD = null;
    var TARGET = null;
    var LOCALS = {};
    var REMOTES = {};
    var TAGS = {};

    var refs = out.split(/\n/);

    for(var i = 0; i < refs.length; ++i) {
      var ref = refs[i];
      if(!/^([a-f0-9]{40}) (.+)$/.test(ref)) continue;
      var hash = RegExp.$1;
      var name = RegExp.$2;

      //extract local head
      if(name === 'HEAD') {
        HEAD = hash;
      //extract locals
      } else if(/^refs\/heads\/([^\/]+)$/.test(name)) {
        LOCALS[RegExp.$1] = hash;
      //extract remotes
      } else if(/^refs\/remotes\/[^\/]+\/([^\/]+)$/.test(name)) {
        REMOTES[RegExp.$1] = hash;
      //extract tags
      } else if(/^refs\/tags\/.*?([^\/]+)\^\{\}$/.test(name)) {
        TAGS[RegExp.$1] = hash;
      }

      //resolve partial hash
      if(repoRef && hash.indexOf(repoRef) === 0)
        TARGET = hash;
    }

    //if set, attempt to find tag
    if(repoRef && TAGS[repoRef]) {
      TARGET = TAGS[repoRef];
    }
    //if unset, use the first remote's HEAD
    if(!repoRef) {
      repoRef = TARGET = REMOTES.HEAD;
    }
    //if able, checkout by local branch name over commit hash
    for(var branch in LOCALS)
      if(LOCALS[branch] === TARGET){
        repoRef = branch;
        break;
      }

    repoUpdated = HEAD !== TARGET;

    // console.log('tags',TAGS);
    // console.log('locals',LOCALS);
    // console.log('ref',repoRef);
    // console.log('head',HEAD);
    // console.log('target',TARGET);
    // process.exit(1);

    checkout();
  });
}

function checkout() {
  if(!repoUpdated || !repoRef)
    return update();
  log("Loading '%s'... (git checkout)", repoRef);
  exec("git checkout "+repoRef, { cwd: config.source }, function(err) {
    if(err) exit("Error checking out git reference: %s", repoRef);
    update();
  });
}

function update() {

  //=========================
  //  check package.json

  var pkg = null;
  var pkgPath = path.join(config.source, 'package.json');

  if(fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath));
      //move 'grunt*' modules into devDeps
      var fixed = false;
      if(pkg.dependencies)
        for(var key in pkg.dependencies)
          if(/^grunt/.test(key)) {
            if(!pkg.devDependencies)
              pkg.devDependencies = {};
            pkg.devDependencies[key] = pkg.dependencies[key];
            delete pkg.dependencies[key];
            log("Moved '%s' into the 'devDependencies' field", key);
            fixed = true;
          }

      //write changes back
      if(fixed)
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    } catch(e) {
      exit('Source directory package.json is invalid (%s)', pkgPath);
    }
  } else {
    exit('Source directory has no package.json (%s)', pkgPath);
  }

  if(!repoUpdated && fs.existsSync(path.join(config.source,'node_modules')))
    return validateSource();

  log("Updating Source Modules... (npm install)");
  
  exec("npm install", { cwd: config.source }, function(err) {
    if(err) exit("Error npm updating");
    validateSource();
  });
}

function validateSource() {

  //if dependency exists, check that its satisfied 
  if(config.dependency &&
     !semver.satisfies(srcPkg.version, config.dependency))
    exit("Source (%s) requires 'grunt-source' v%s and you have v%s installed.",
         config.source, config.dependency, srcPkg.version);

  if(!config.repo)
    return run();

  //check that repositories match
  exec("git remote -v show", {
    cwd: config.source
  }, function (err, stdout, stderr) {

    var out = stdout.toString();
    var curr = /origin\s+(.*)\s+\(fetch\)/.test(out) ? RegExp.$1 : null;
    if(curr !== config.repo)
      exit("Source (%s)\ncurrently has the repository (%s),\n"+
           "which is different from the "+
           "repository defined in your configuration (%s).\n"+
           "Please change your source directory.",
           config.source, curr, config.repo);

    run();
  });
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

  log("Running: grunt %s", process.argv.slice(2).join(' '));
  //start grunt!
  grunt.cli();
}


//=========================
//  start

function wasModified(path, since) {
  if(!since) since = ONE_DAY;
  return fs.existsSync(path) && (Date.now() - fs.statSync(path).atime.getTime() > since);
}

function log() {
  console.log(colors.blue + util.format.apply(util, arguments) + colors.reset);
}

function exit() {
  console.log(colors.red + util.format.apply(util, arguments) + colors.reset);
  process.exit(1);
}

function exec() {
  var args = Array.prototype.slice.call(arguments);
  
  var callback = args.pop();

  args.push(function (err, stdout, stderr) {
    callback(err && err.code, stdout, stderr);
  });

  var proc = child.exec.apply(child, args);

  proc.stdout.on('data',function(buff) {
    if(callback.length <= 1)
      process.stdout.write(buff);
  });

  proc.stderr.on('data',function(buff) {
    if(callback.length <= 2)
      process.stderr.write(buff);
  });

  return proc;
}

