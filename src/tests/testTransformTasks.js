/* eslint-env node, mocha */
'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const fs = require('fs');

/**
 * Unit tests for registerTasks function.
 */
describe('registerTasks', function () {
  gulp.on('stop', function () {
    process.exit(0); // need this call to end long running watch process
  });

  it('simple task setup works as expected.', function (done) {
    del.sync(path.normalize(__dirname + '/../../testOutput/simple/'));
    require(__dirname + '/fixtures/tasksSimple/gulpfile');
    gulp.on('task_stop', function (e) {
      if (e.task === 'simple-transform') {
        fs.statSync(__dirname + '/../../testOutput/simple/lib/logger.js');
        done();
      }
    });
    gulp.start('simple-transform');
  });

  it('simple watch task setup works as expected.', function (done) {
    this.timeout(8000);

    del.sync(path.normalize(__dirname + '/../../testOutput/watch/'));
    require(__dirname + '/fixtures/tasksWatch/gulpfile');
    gulp.on('task_stop', function (e) {
      if (e.task === 'watch-watch-transform') {
        const text = fs.readFileSync(__dirname + '/fixtures/tasksWatch/chat/logger.js', 'utf8');
        fs.writeFileSync(__dirname + '/fixtures/tasksWatch/chat/logger.js', text);
        setTimeout(function (finish) {
          fs.statSync(__dirname + '/../../testOutput/watch/lib/logger.js');
          finish();
        }, 4000, done);
      }
    });
    gulp.start('watch-watch-transform');
  });
});
