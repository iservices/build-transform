/* eslint no-console:0,object-shorthand:0 */
'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const through = require('through2');
const del = require('del');
const path = require('path');
const fs = require('fs');

/**
  * Adjust the base for globs so we can specify exact files
  * and still have them show up in the right place after transformation.
  *
  * @param {string} base - The base to apply to each vinyl object in a stream.
  * @returns {stream} A stream that adjusts the base property on vinyl objects.
  */
function adjustVinylBase(base) {
  return through({ objectMode: true }, function throughStream(data, encoding, done) {
    data.base = base;
    this.push(data);
    done();
  });
}

/**
 * Transform the given files into ES5 compliant code.
 *
 * @param {object} opts - The options object.
 * @param {object} opts.input - The configuration input.
 * @param {function} opts.errorHandler - Optional error handler that gets called when an error occurs.
 * @returns {stream} A stream that transforms the files.
 */
function transform(opts) {
  return gulp.src(opts.glob)
    .pipe(adjustVinylBase(opts.input.codeBaseDir))
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .on('error', function transformError(err) {
      if (opts.errorHandler) {
        opts.errorHandler(err);
      } else {
        throw err;
      }
    })
    .pipe(gulp.dest(opts.input.outputDir));
}

/**
  * This function is used to notify developers of an error that occured
  * as a result of a changed file.
  *
  * @param {Error} err - The error to notify the user about.
  * @param {string} title - The title for the notification window.
  * @param {string} message - The message to display in the notification window.
  * @returns {void}
  */
function notify(err, title, message) {
  require('node-notifier').notify({
    title: title,
    message: message
  });

  if (err) {
    if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
}

/**
 * Register transform tasks.
 *
 * @param {object} opts - Configuration options.
 * @param {stirng|string[]} opts.glob - A glob that identifies files to transform.
 * @param {string} opts.codeBaseDir - The base directory that contains all code being transformed.
 * @param {string} opts.outputDir - The directory to output files to.
 * @param {string} [opts.tasksPrefix] - Optional prefix for task names.
 * @returns {function} - The function to register tasks.
 */
module.exports = function registerTasks(opts) {
  const input = {
    glob: opts.glob,
    codeBaseDir: opts.codeBaseDir,
    outputDir: opts.outputDir
  };

  if (opts.tasksPrefix) {
    input.tasksPrefix = opts.tasksPrefix + '-';
  } else {
    input.tasksPrefix = '';
  }

  /*
   * A task that transforms all of the server code.
   */
  gulp.task('transform', function transformTask() {
    del.sync(input.outputDir);
    return transform({ input: input });
  });

  /*
   * Watches for changes to files and transforms the when they have changed.
   */
  gulp.task('watchTransform', function watchTransformTask() {
    watch(input.glob, function watchTransform(file) {
      console.log('watch transform: ' + file.path + ' event: ' + file.event);
      if (file.event === 'unlink') {
        fs.unlinkSync(path.normalize(input.outputDir + file.path.slice(input.codeBaseDir.length)));
      } else {
        transform({
          glob: file.path,
          errorHandler: function transformError(err) {
            notify(err, 'Transform Error', 'See console for details.');
          }
        });
      }
    });
  });
};
