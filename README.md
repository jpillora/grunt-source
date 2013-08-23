# Grunt Source

> Reuse multiple Grunt environments across multiple projects

## Intro

**The Problem** - Grunt environments can quickly become quite complicated and whenever we need to reuse a Grunt environment, it requires us to copy the current project and remove the source leaving just the Grunt related files.

**A static solution** - The Grunt team has made [grunt-init](https://github.com/gruntjs/grunt-init) which gives you a *static* copy of a predefined template. Note, grunt-init does provides a way to template in new values for each copy however, this is can still be improved.

**A dynamic solution** - Enter *Grunt Source*, instead of making numerous **static** copies of a given Grunt environment, you can actually use one Grunt environment for multiple projects. Also, having a directory separation between the Grunt environment and the actual source will help to reduce the complexity of your project.

When using Grunt Source, projects will now contain only a `Gruntsource.json`, thereby abstracting the magic of Grunt outside of the project. This will help those who don't need to know the complexities of the build, yet still want to modify the source.

## Usage

* Install Grunt Source
  
  ``` sh
  npm install -g grunt-source
  ```

* Create a `Gruntsource.json` configuration in your project's root

  ``` json
  {
    "source": "~/.grunt-sources/ghpages",
    "repo": "https://github.com/jpillora/grunt-source-ghpages.git"
  }
  ```
  *Note: The "source" path represents the source Grunt environment, if it's missing it'll clone "repo" there.*

* Then simply run `grunt-source`

  ``` sh
  grunt-source
  ```
  *Note: On first run, it will also run the `init` task - registered by Grunt Source - which copies the **missing** files from `"source"/init` directory into the current directory, essentially initialising your project.*

  *You can use `grunt-source` just as you would normally use `grunt`, command line arguments and options work all function*

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

### Grunt Source Configuration object

* `source` - **required** - the directory where the *source* Grunt environment resides
* `repo` - the Git repository which
* `config` - an object which will get merged when you call `grunt.initConfig()`, allowing you to override the source Gruntfile.

### Grunt Source Methods

In your Gruntfile wrapper function, a `source` object is added to the `grunt` object 

#### `grunt.source.loadAllTasks()` (function)

This function is **very** important, first it loads all of the tasks (npm tasks and local tasks) in the "source" directory (or the Grunt project directory), then it changes the working directory *back* to the current directory and loads all local tasks there.

#### `grunt.source.dir` (string)

The absolute path to the source directory

#### `grunt.source.<config-prop>`

All properties defined in your configuration object will also be set on the `grunt.source` object

## CLI

The `grunt-source` runs in the same was as `grunt-clie`, so commands like `grunt-source task2:target4 task3:target1` will work as you expect.

## Examples

See [grunt-source-ghpages](https://github.com/jpillora/grunt-source-ghpages) for another example grunt source

See [notifyjs-com](https://github.com/jpillora/notifyjs-com) for an example project using `grunt-source-ghpages`

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
