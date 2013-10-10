
## Grunt Source Example

The following demonstrates the simplest way to use Grunt Source.

Here, we're using `grunt-source-example` to minify `project-1` and `project-2`:

``` sh
$ npm install -g grunt-source
$ git clone https://github.com/jpillora/grunt-source.git
$ cd grunt-source/example/project-1
$ grunt-source
Updating Source Modules... (npm install)
npm http G...
npm http 3...
grunt@0.4....
grunt-cont...
├── grunt-...
└── uglify...
Running: grunt
Running "uglify:target1" (uglify) task
File "build/foo.js" created.
Done, without errors.

$ cd ../project-2
$ grunt-source
Running: grunt
Running "uglify:target1" (uglify) task
File "build/bar.js" created.
Done, without errors.
```

Note: Grunt source noticed that there was no `node_modules` folder in the source directory, so for the first execute, it performed an `npm install`. 

Tip: By including a `repo` field in your `Gruntsource.json`, `grunt-source` will automatically grab that url and place it in `source` (`git clone <repo> <source>`).
