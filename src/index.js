#!/usr/bin/env node

'use strict';

const globby = require('globby');
const del = require('del');
const cp = require('child_process');
const argsv = require('minimist')(process.argv.slice(2));

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

  if (args.w || args.W) {
    input.push('-w');
  }

  return cp.spawn('tsc', input, { stdio: 'inherit' });
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
