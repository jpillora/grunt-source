# Grunt Source

> Reuse multiple Grunt environments across multiple projects

## Intro

**The Problem** - Grunt environments can quickly become quite complicated and whenever we need to reuse a Grunt environment, it requires us to copy the current project and remove the source leaving just the Grunt related files.

**A solution** - The Grunt team has made [grunt-init](https://github.com/gruntjs/grunt-init) which gives you a *static* copy of a predefined template. Note, grunt-init does provides a way to template in new values for each copy however, this is can still be improved.

**A better solution** - Enter *Grunt Source*, instead of making numerous copies of a given Grunt environment, you can actually use one Grunt environment for multiple projects. Also, having a directory separation between the Grunt environment and the actual source will help to reduce the complexity of your project.

When using Grunt Source, projects will now contain only a `GruntSource.json`, thereby abstracting the magic of Grunt outside of the project. This will help those who don't need to know the complexities of the build, yet still want to modify the source.

## Install

``` shell
npm install -g grunt-source
```

## Usage

Create a `GruntSource.json` file in your project's root:

```
{
  "source": "../grunt-source-jquery",
  "repo": "https://github.com/jpillora/grunt-source-jquery.git"
}
```

Then run:

```
grunt-source
```

*Note: If the `source` directory doesn't exist, the `repo` will be cloned into `source`, then `npm install` will be run inside `source`. Finally, `grunt` will be executed.*

## Configuration

The `GruntSource.json` file

* `source` - the directory where the *source* Grunt environment resides
* `repo` - the Git repository which

## CLI

The `grunt-source` executable will proxy all arguments to the `grunt` executable. So something like `grunt-source task2:target4 task3:target1` will work.

## Examples

See [grunt-source-jquery](https://github.com/jpillora/grunt-source-jquery) for an example grunt source

See [jquery-navigator](https://github.com/jpillora/jquery.navigator) for an example project using `grunt-source-jquery`

See [grunt-source-ghpages](https://github.com/jpillora/grunt-source-ghpages) for another example grunt source

See [verify-com](https://github.com/jpillora/verify-com) for an example project using `grunt-source-ghpages`


## Todo

* Allow configuration from `GruntSource.json` to augment the `grunt.initConfig(...)` configuration

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
