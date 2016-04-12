'strict';

const transform = require('../../../index');

transform.registerTasks({
  glob: '**/*.[tj]s',
  inputDir: __dirname + '/chat/',
  outputDir: __dirname + '/../../../../testOutput/simpleTS/lib/',
  tasksPrefix: 'simpleTS'
});
