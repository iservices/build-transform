#!/usr/bin/env node

'use strict';

const globby = require('globby');
const del = require('del');
const chokidar = require('chokidar');
const cp = require('child_process');
const path = require('path');
const argsv = require('minimist')(process.argv.slice(2));

/**
 * Determine the output files for the given input file and arguments.
 *
 * @param {String} file - The file to determine the output files for.
 * @param {Object} args - The arguments provided from the command line.
 * @return {String[]} The output files for the file.
 */
function getOutputFiles(file, args) {
  const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);

  let root = args.i || process.cwd();
  if (!path.isAbsolute(root)) {
    root = path.join(process.cwd(), root);
  }
  let outDir = args.o || 'lib';
  if (!path.isAbsolute(outDir)) {
    outDir = path.join(process.cwd(), outDir);
  }
  outDir = path.join(outDir, path.dirname(filePath).slice(root.length));

  const filename = path.basename(path.basename(filePath, '.ts'), '.js');
  return [
    path.join(outDir, filename + '.js'),
    path.join(outDir, filename + '.js.map')
  ];
}

/**
 * Transform the given files.
 *
 * @ignore
 * @param {String[]} files - The files to transform.
 * @param {Object} args - The arguments provided by the command line.
 * @return {Child_Process} The process that performs the transform.
*/
function transform(files, args) {
  const input = files.concat([
    '-m', 'commonjs',
    '-t', 'ES5',
    '--outDir', (args.o || 'lib/'),
    '--allowJs',
    '--noResolve',
    '--sourceMap',
    '--experimentalDecorators'
  ]);

  if (args.i) {
    input.push('--rootDir');
    input.push(args.i);
  }

  return cp.spawn('tsc', input, { stdio: 'inherit' });
}

/**
 * Watch for changes to the given files and transform them when they do change.
 *
 * @ignore
 * @param {Object} args - The arguments passed into the command line.
 * @return {void}
 */
function transformWatch(args) {
  if (args._.length) {
    const watcher = chokidar.watch(args._, {
      ignored: /[\/\\]\./,
      persistent: true
    });
    watcher.on('ready', () => {
      watcher.on('add', file => { transform([file], args); });
      watcher.on('change', file => { transform([file], args); });
      watcher.on('unlink', file => {
        del(getOutputFiles(file, args));
      });
    });
  }
}

if (!argsv._.length) {
  //
  // print help info if args are missing
  //
  console.log('Usage: build-transform <files> [<files>] [-i <dir>] [-w] [-k]');
  console.log('');
  console.log('Options:');
  console.log('<files>\t A glob pattern that identifies files to transform.');
  console.log('-i\t The base directory used when creating folder paths in the output directory.  Defaults to the current working directory.');
  console.log('-k\t When this option is specified the output folder will not be deleted before files are emitted.');
  console.log('-w\t When present the files specified in the -g glob pattern(s) will be watched for changes and transformed when they do change.');
  process.exitCode = 1;
} else if (argsv.w) {
  // watch for file changes
  transformWatch(argsv);
} else {
  //
  // transform the files
  //
  if (!argsv.k) {
    del.sync(argsv.o || 'lib/');
  }
  globby(argsv._).then(files => {
    transform(files, argsv)
      .on('exit', code => {
        process.exitCode = code;
      });
  });
}
