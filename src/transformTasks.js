/* eslint no-console:0,object-shorthand:0 */
'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const maps = require('gulp-sourcemaps');
const watch = require('gulp-watch');
const through = require('through2');
const del = require('del');
const path = require('path');
const fs = require('fs');

// holds watch streams that have been created.
const watchStreams = {};

/**
  * Adjust the base for globs so we can specify exact files
  * and still have them show up in the right place after transformation.
  *
  * @param {string} base - The base to apply to each vinyl object in a stream.
  * @returns {stream} A stream that adjusts the base property on vinyl objects.
  */
function adjustVinylBase(base) {
  return through({ objectMode: true }, function (data, encoding, done) {
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
  return gulp.src(opts.input.glob)
    .pipe(adjustVinylBase(opts.input.inputDir))
    .pipe(maps.init())
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .on('error', function (err) {
      if (opts.errorHandler) {
        opts.errorHandler(err);
      } else {
        throw err;
      }
    })
    .pipe(maps.write('.'))
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
 * @param {string} opts.inputDir - The base directory that contains all code being transformed.
 * @param {stirng|string[]} opts.glob - A glob relative to the inputDir that identifies files to transform.
 * @param {string} opts.outputDir - The directory to output files to.
 * @param {string} [opts.tasksPrefix] - Optional prefix for task names.
 * @param {string[]} [opts.tasksDependencies] - Optional array of tasks names that must be completed before these registered tasks runs.
 * @returns {function} - The function to register tasks.
 */
module.exports = function (opts) {
  let globParam = null;
  if (Array.isArray(opts.glob)) {
    globParam = opts.glob.map(function (value) {
      if (value[0] === '!') {
        return '!' + path.normalize(opts.inputDir + '/' + value.slice(1));
      }
      return path.normalize(opts.inputDir + '/' + value);
    });
  } else {
    if (opts.glob[0] === '!') {
      globParam = '!' + path.normalize(opts.inputDir + '/' + opts.glob.slice(1));
    } else {
      globParam = path.normalize(opts.inputDir + '/' + opts.glob);
    }
  }

  const input = {
    glob: globParam,
    inputDir: opts.inputDir,
    outputDir: opts.outputDir,
    tasksDependencies: opts.tasksDependencies || []
  };

  if (opts.tasksPrefix) {
    input.tasksPrefix = opts.tasksPrefix + '-';
  } else {
    input.tasksPrefix = '';
  }

  /*
   * A task that transforms all of the server code.
   */
  gulp.task(input.tasksPrefix + 'transform', input.tasksDependencies, function () {
    del.sync(input.outputDir);
    return transform({ input: input });
  });

  /*
   * Watches for changes to files and transforms the when they have changed.
   */
  gulp.task(input.tasksPrefix + 'watch-transform', function () {
    watchStreams[input.tasksPrefix + 'watch-transform'] = watch(input.glob, function (file) {
      console.log('watch transform: ' + file.path + ' event: ' + file.event);
      if (file.event === 'unlink') {
        fs.unlinkSync(path.normalize(input.outputDir + file.path.slice(input.inputDir.length)));
      } else {
        transform({
          input: {
            glob: file.path,
            inputDir: input.inputDir,
            outputDir: input.outputDir
          },
          errorHandler: function (err) {
            notify(err, 'Transform Error', 'See console for details.');
          }
        });
      }
    });
  });
};
