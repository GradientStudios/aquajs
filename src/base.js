(function(window) {

var aqua = window.aqua = {};

// deep extend
var extend = aqua.extend = function extend(a, b) {
  var i, j, key, keys, obj;
  for (i = 1; i < arguments.length; i++) {
    obj = arguments[i];

    if (Array.isArray(obj)) {
      if (!a) {
        a = [];
      }

      for (key = 0; key < obj.length; key++) {
        a[key] = extend(a[key], obj[key]);
      }
    } else if (typeof(obj) == 'object') {
      if (!a) {
        a = {};
      }

      keys = Object.keys(obj);
      for (j = 0; j < keys.length; j++) {
        key = keys[j];
        a[key] = extend(a[key], obj[key]);
      }
    } else {
      a = obj;
    }
  }

  return a;
};

var Task = function(options) {
  options = extend({}, {
    priority: 0,
    before: false,
    once: false
    // rate: 1 / 60
  }, options);

  this.callback = options.callback;
  this.priority = options.priority;
  this.before = options.before;
  this.once = options.once;
  // this.rate = options.rate;

  this.sinceLast = 0;
};
Task.prototype = {
  call: function() {
    this.callback.apply(null, arguments);
  }
};

var TaskList = function(options) {
  this.items = [];
  this.priorities = extend({}, options.priorities);
};
TaskList.prototype = {
  add: function(item) {
    var i = 0, added = false;

    if (typeof item.priority == 'string') {
      item.priority = this.priorities[item.priority];
      if (!item.priority) {
        throw {
          message: 'no such priority defined in task list.'
        };
      }
    }

    for ( ; i < this.items.length; i++ ) {
      if (item.before && this.items[i].priority >= item.priority || 
        !item.before && this.items[i].priority > item.priority) 
      {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(item);
    }
  },
  remove: function(item) {
    var index = this.items.indexOf(item);

    if (index != -1) {
      this.items.splice(index, 1);
    }

    return this;
  },
  callAll: function() {
    var items = this.items, i = 0, item;

    for ( ; i < items.length; i++ ) {
      item = items[i];
      item.call.apply(item, arguments);

      if (item.once) {
        items.splice(i, 1);
        i--;
      }
    }
  }
};

var Emitter = function() {};
Emitter.prototype = {
  on: function(name, f) {
    if (!this._events) {
      this._events = {};
    }
    if (!this._events[name])
      this._events[name] = [];

    if (this._events[name].indexOf(f) == -1)
      this._events[name].push(f);
  },
  off: function(name, f) {
    var index = -1;
    if (!this._events) {
      this._events = {};
    }
    if (this._events[name]) {
      if ((index = this._events[name].indexOf(f)) != -1) {
        this._events[name].splice(index, 1);
      }
    }
  },
  emit: function(name) {
    if (!this._events) {
      this._events = {};
    }
    if (this._events[name]) {
      var args = [], i, events = this._events[name];
      for ( i = 1; i < arguments.length; i++ ) {
        args.push(arguments[i]);
      }

      for ( i = 0; i < events.length; i++ ) {
        events[i].apply(this, args);
      }
    }
  }
};

aqua.task = function(options) {
  return new Task(options);
};
aqua.taskList = function(options) {
  return new TaskList(options);
};
aqua.emitter = function() {
  return new Emitter();
};
aqua.query = function(name, _default) {
  var split = location.search.substring(1).split('&'), i, keyvalue;
  for (i = 0; i < split.length; i++) {
    keyvalue = split[i].split('=');
    if (keyvalue[0] == name) {
      return unescape(keyvalue[1]);
    }
  }
  return _default;
};
aqua.base = function(context) {
  return Object.getPrototypeOf(Object.getPrototypeOf(context));
};
aqua.requestAnimFrame = (function(){
  // thanks paul irish
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function( callback, element ) {
    window.setTimeout( callback, 1000 / 60 );
  };
})();

aqua.types = {
  Task: Task,
  TaskList: TaskList,
  Emitter: Emitter
};

})(this);
