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

  if (args.w || args.W) {
    input.push('-w');
  }

  return cp.spawn('tsc', input, { stdio: 'inherit' });
}

if (!argsv.g) {
  //
  // print help info if args are missing
  //
  console.log('Usage: build-transform -g <glob pattern> [-g <glob pattern>] [-w]');
  console.log('');
  console.log('Options:');
  console.log('-g\t A glob pattern that identifies files to transform.');
  console.log('-w\t When present the files specified in the -g glob pattern(s) will be watched for changes and transformed when they do change.');
  process.exitCode = 1;
} else {
  //
  // transform the files
  //
  del.sync(argsv.o || 'lib/');
  globby(argsv.g).then(files => {
    transform(files, argsv)
      .on('exit', code => {
        process.exitCode = code;
      });
  });
}
