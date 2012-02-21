module('base');

test('functions exist', 5, function() {
  equal(typeof aqua.extend, 'function', 'extend');
  equal(typeof aqua.task, 'function', 'task');
  equal(typeof aqua.taskList, 'function', 'taskList');
  equal(typeof aqua.emitter, 'function', 'emitter');
  equal(typeof aqua.requestAnimFrame, 'function', 'requestAnimFrame');
});

test('extend deep clones', 2, function() {
  var defaults = {
        verytrue: true,
        very0: 1,
        object: {
          deep: [
            undefined, {
              maybe: false
            }
          ]
        }
      },
      obj = aqua.extend({}, defaults);

  deepEqual(obj, defaults);
  defaults.object.deep[1].maybe = true;
  defaults.object.deep.splice(0, 1);
  defaults.very0 = [1, 2, 3];
  notDeepEqual(obj, defaults);
});

test('taskList', 6, function() {
  var taskList = aqua.taskList({priorities: {EARLY: -5}}),
      manualOnceTask,
      callorder = [];
  
  taskList.add(aqua.task({
    callback: function() {
      ok([1, 3, 5].indexOf(callorder.length) != -1, 'task called');
      callorder.push(0);
    }
  }));
  taskList.add((manualOnceTask = aqua.task({
    callback: function() {
      ok(callorder.length === 0, 'manualOnce called');
      callorder.push(1);
    },
    before: true
  })));
  taskList.add(aqua.task({
    callback: function() {
      ok(callorder.length == 2, 'automaticOnce called');
      callorder.push(2)
    },
    once: true
  }));

  taskList.callAll();

  taskList.remove(manualOnceTask);
  taskList.callAll();

  taskList.add(aqua.task({
    callback: function() {
      ok(callorder.length == 4, 'early task called')
      callorder.push(3);
    },
    priority: 'EARLY'
  }));
  taskList.callAll();
});

test('emitter emits', 1, function() {
  var emitter = aqua.emitter(), handler;

  emitter.on('call', (handler = function() {
    ok(true, 'event handler called');
  }));
  emitter.emit('call');

  emitter.off('call', handler);
  emitter.emit('call');
});

test('base gets super proto', 1, function() {
  var base = function(){
    this.x = 1;
  };

  var type = function() {
    aqua.base(this).constructor.call(this);
  };
  type.prototype = new base();

  deepEqual(new type(), new base(), 'equals super type');
});
