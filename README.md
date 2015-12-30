# build-transform

## Overview
This is a node package that defines gulp tasks that can be used to perform ES6 and react transformations.
The [babel](https://www.npmjs.com/package/babel) package is used for transformations.

## Guide

To install this package execute the following command in the console from within your project.

```
npm install --save build-transform
```

Once the package is installed you will need to create a `gulpfile.js` file within the root folder of your project if there isn't one already.
Within this file you will register the gulp tasks that are defined within this package using the registerTasks function.  The following is an example of this.

```
'use strict';

const transform = require('build-transform');

transform.registerTasks({
  glob: '**/*.js',
  inputDir: 'src',
  outputDir: 'lib'
});
```

Once you have registered the transform tasks you can transform using gulp.
To transform the code simply execute the following console command from within your project.

```
gulp transform
```

In addition to executing tasks from the console you can also chain the gulp transform tasks together with other gulp tasks to utilize the transform functionality however it's needed.

## API

### build-transform.registerTasks(options)

The registerTasks function will register 2 tasks with gulp which are named as follows:

- 'transform' - This task will transform code specified and output ES5 compliant equivalent code.
- 'watch-transform' - This is a long running task that will listen for changes to files.  When a file is changed that file will be transformed.

#### options

Type: `Object`

This parameter is an object that holds the various options to use when registering the tasks.

#### options.glob

Type: `String` or `Array`

A glob or array of globs relative to the options.inputDir parameter that identify the files in your project that that will be transformed. 
Use [node-glob syntax](https://github.com/isaacs/node-glob) when specifying patterns.

#### options.inputDir

Type: `String`

The directory that contains all of the files that will be transformed.

#### options.outputDir

Type: `String`

The directory that transformed files will be created in.  The folder structure from the options.inputDir folder will be recreated in this folder.

#### options.tasksPrefix

Type: `String`

This is an optional parameter that when set will add a prefix to the names of the tasks that get registered. For example, if tasksPrefix is set to 'hello' then the task that would have been registered with the name 'transform' will be registered with the name 'hello-transform' instead.