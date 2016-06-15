# build-transform

This package is currently in **BETA**

## Overview
This is a command line tool that transforms ES6/ES7 code into ES5 code.
The [typescript](https://www.npmjs.com/package/typescript) package is used for transformations.

## Guide

To install this package execute the following command in the console from within your project.

```
npm install --save build-transform
```

Once the package is installed you can run the tool from a terminal using the `build-transform` command.  Normally you will
do this within an npm script element.  Take the following excerpt from an example package.json file:

```JSON
{
  "scripts": {
    "transform": "build-transform \"src/**/*.js\"",
    "transform-watch": "build-transform \"src/**/*.js\" -w",
  }
}
```

In the example above the `transform` script will perform transformations on files with an extension of `.js` within the `src` folder.
The `transform-watch` script will perform transformations on the same files whenever one of them is updated or added.

Also notice that the glob patterns are surrounded by double quotes.  This is necessary in order to prevent the terminal from expanding
the glob patterns into actual file paths.

## API

Usage:
```
build-transform <files> [<files>] [-i <dir>] [-w] [-k]
```
Options:

| Option | Description |
| ---    | ---         |
| `<files>` | A glob pattern that identifies files to tranform.  Multiple glob patterns can be specified. |
| -i     | The base directory used when creating folder paths in the output directory.  Defaults to the current working directory. |
| -k     | When this option is specified the output folder will not be deleted before files are emitted. |
| -w     | When present the files specified in the files glob pattern(s) will be watched for changes and transformed when they do change. |
