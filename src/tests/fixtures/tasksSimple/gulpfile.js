'strict';

const transform = require('../../../index');

transform.registerTasks({
  glob: '**/*.js',
  inputDir: __dirname + '/chat/',
  outputDir: __dirname + '/../../../../testOutput/simple/lib/',
  tasksPrefix: 'simple'
});
