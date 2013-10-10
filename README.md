# Grunt Source

> Reuse multiple Grunt environments across multiple projects

<a href="https://twitter.com/intent/tweet?hashtags=gruntjs&original_referer=http%3A%2F%2Fgithub.com%2F&text=Grunt+Source+-+Reuse+multiple+Grunt+environments+across+multiple+projects&tw_p=tweetbutton&url=https%3A%2F%2Fgithub.com%2Fjpillora%2Fgrunt-source" target="_blank">
  <img src="http://jpillora.com/github-twitter-button/img/tweet.png"></img>
</a>

## Intro

**The Problem** - Grunt environments can quickly become quite complicated and whenever we need to
reuse a Grunt environment, it requires us to copy the current project and remove the source leaving
just the Grunt related files.

**A static solution** - The Grunt team has made [grunt-init](https://github.com/gruntjs/grunt-init)
which gives you a *static* copy of a predefined template. Although `grunt-init` does provide a way to
template in new values for each copy, this is can still be improved.

**A dynamic solution** - Enter *Grunt Source*, instead of making numerous **static** copies of a given
Grunt environment, you can actually use one Grunt environment for multiple projects. Also, having a
directory separation between the Grunt environment and the actual source will help to reduce the
complexity of your project. We can still have `grunt-init` like behaviour with `grunt-source`
(e.g. initial placeholder source files) by using the in-built [init task](https://github.com/jpillora/grunt-source#init).

When using Grunt Source, projects will now contain only a `Gruntsource.json`, thereby abstracting
the magic of Grunt outside of the project. This will help those who don't need to know the
complexities of the build, yet still want to modify the source.

So with Grunt Source, we'll have **one** Grunt Source project which looks like:
```
├── Gruntfile.coffee
├── README.md
├── init
│   └── ...
├── node_modules
│   └── ...
└── package.json
```

And then **multiple** projects using this Grunt Source might look like:
```
├── Gruntsource.json
├── css
│   └── app.css
├── index.html
├── js
│   └── app.js
└── src
    ├── scripts
    ├── styles
    └── views
```

This directory structure is for [grunt-source-web](https://github.com/jpillora/grunt-source-web)
to build optimised static websites, ready to be hosted.

## Example

For a simple example, please see:

### [grunt-source-example](./example)

## Usage

* Install Grunt Source
  
  ``` sh
  npm install -g grunt-source
  ```

* Create a `Gruntsource.json` configuration in your project's root

  ``` json
  {
      "source": "~/.grunt-sources/web",
      "repo": "https://github.com/jpillora/grunt-source-web.git"
  }
  ```
  *The "source" path represents the source Grunt environment*

* Then simply run `grunt-source`

  ``` sh
  grunt-source
  ```
  
   *If the "source" path doesn't exist, `grunt-source` will
   clone "repo" into "source", followed by an "npm install" inside the "source"
   directory and then finally, it will run the [init task](#init).*

  *You can use `grunt-source` just as you would normally use `grunt`,
   command line arguments and options work all function*

## Alternative Configuration

Instead of creating a `Gruntsource.json`, you can add a `gruntSource` field to your `package.json` file:

``` json
{
  "name": "my-module",
  "version": "0.1.3",
  "gruntSource": {
    "source": "~/.grunt-sources/node",
    "repo": "https://github.com/jpillora/grunt-source-node.git"
  }
}
```

## API

### Grunt Source Configuration

* `source` - **required** - the directory where the *source* Grunt environment resides.
* `repo` - the Git repository which will be used to initialise and update the `source`.
  * `url[@ref]` where `ref` is a [Git Reference](http://git-scm.com/book/en/Git-Internals-Git-References) (tag or commit hash)
* `config` - an object which will get merged when you call `grunt.initConfig()`, allowing you to override the source Gruntfile configuration.

### Grunt Source Object

In your Gruntfile wrapper function, a `source` object is added to the `grunt` object.

#### `grunt.source.loadAllTasks()` (function)

This function is **very** important, first it loads all of the tasks (npm tasks and
local tasks) in the "source" directory (or the Grunt project directory), then it
changes the working directory *back* to the current directory and loads all local tasks
there. So before the function is called, the current working directory is the `source`
directory. Therefore, in the majority of cases, we'll want to call this function
**at the top** of our Grunt Source `Gruntfile.js`s.

Essentially, the above description is the following:

``` js
//cwd is initially set the source directory!

//automatically `grunt.loadNpmTasks` all tasks inside the source directory's package.json's 'devDependencies' field
loadGruntTasks(grunt);

//load all user defined tasks inside the source directory
grunt.loadTasks("./tasks");

//set cwd to project directory (the directory you execute 'grunt-source' from)
process.chdir(PROJECT_DIR);

//load all user defined tasks inside the project directory
grunt.loadTasks("./tasks");
```

`loadGruntTasks` is provided by [load-grunt-tasks](https://github.com/sindresorhus/load-grunt-tasks)

#### `grunt.source.dir` (string)

The absolute path to the source directory

#### `grunt.source.<config-prop>`

All properties defined in your configuration object will also be set on the `grunt.source` object

For example, the `Gruntfile.coffee` in [grunt-source-web](https://github.com/jpillora/grunt-source-web.git), places
the `grunt.source` object in the Jade data option object, so in our `index.jade` file, we can do things like:

``` json
{
  "source": "~/.grunt-sources/web",
  "repo": "https://github.com/jpillora/grunt-source-web.git",
  "title": "Hello Grunt Source"
}
```

``` jade
!!!5
html
  head
    title #{source.title}
  body
    h5 #{source.title}
```

## In-built tasks

Before `grunt` is started, the following tasks are registered (`grunt.registerTask`).
Therefore, all Grunt Sources will have the following tasks avaiable (just `init` for now).

#### `init`

Although we no longer need to copy and paste our Grunt environments across various projects. It can
still be useful to generate an initial set of source files.

`grunt-source init` will copy all files from the source directory's init folder into the current
working directory, however, it will only copy those files that are **missing**.

Also, upon clone of the `repo` property, this task will automatically be run.

## CLI

The `grunt-source` runs in a similar way to `grunt-cli`, so commands like `grunt-source task2:target4 task3:target1` will work as you expect.

## Examples

See [grunt-source-web](https://github.com/jpillora/grunt-source-web) for 
an example Grunt Source, and then see [notifyjs-com](https://github.com/jpillora/notifyjs-com)
for an example project using `grunt-source-web`. Or [grunt-source-node](https://github.com/jpillora/grunt-source-node). 

#### MIT License

Copyright © 2013 Jaime Pillora &lt;dev@jpillora.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
