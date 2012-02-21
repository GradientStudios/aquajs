(function(window, aqua) {

var Game = function() {
  this.objects = [];
  this.services = [];
  this.tasks = aqua.taskList({priorities: Game.Priorities});

  this.task({callback: this.call.bind(this, 'update')});
  this.task({callback: this.call.bind(this, 'lateUpdate'), priority: 'LATE_UPDATE'});
};

// Game Instance Members
Game.prototype = {
  _destroyobject: function(object) {
    this.task({callback: (function() {
      var index = this.objects.indexOf(object);

      if (index != -1) {
        if (object.ongamedestroy)
          object.ongamedestroy(this);
        object.call('ongamedestroy', object, this);

        object.game = null;

        this.objects.splice(index, 1);
      }
    }).bind(this), priority: 'GARBAGE', once: true});
  },

  _destroyservice: function(service) {
    this.task({callback: (function() {
      var index = this.sevices.indexOf(service);

      if (index != -1) {
        if (service.ongamedestroy)
          service.ongamedestroy(this);

        service.game = null;

        this.services.splice(index, 1);
      }
    }).bind(this), priority: 'GARBAGE', once: true});
  },

  // add - add a gameobject to the game
  add: function(object) {
    object.game = this;
    this.objects.push(object);

    if (object.ongameadd)
      object.ongameadd(this);
    object.call('ongameadd', object, this);
  },

  // addService
  addService: function(service) {
    service.game = this;
    this.services.push(service);

    if (service.ongameadd)
      service.ongameadd(this);
  },

  call: function(method) {
    var args = Array.prototype.slice.call(arguments, 1),
        objects = this.objects,
        count = objects.length,
        object,
        i;

    for ( i = 0; i < count; i++ ) {
      object = objects[i];
      object.call.apply(object, arguments);
    }
  },

  task: function(options) {
    var item = aqua.task(options);
    this.tasks.add(item);
    return item;
  },

  step: function() {
    this.tasks.callAll(this);
  },

  main: function() {
    var self = this;

    // put common timing and rAF loop logic in here
    aqua.requestAnimFrame(function loop() {
      aqua.requestAnimFrame(loop);

      self.step();
    });
  },

  pause: function() {
    // un-implemented
  },

  resume: function() {
    // un-implemented
  }
};

// Game Class Members
aqua.extend(Game, {
  Priorities: {
    UPDATE: 0,
    LATE_UPDATE: 5,
    RENDER: 10,
    GARBAGE: 20
  }
});

var GameService = function() {
  this.tasks = [];
};

GameService.prototype = {
  name: "service",

  destroy: function() {
    this.game._destroyservice(this);
  },

  ongameadd: function(game) {
    
  },

  ongamedestroy: function(game) {
    var i = -1;
    while (i++ < this.tasks.length) {
      game.tasks.remove(this.tasks[i]);
    }
  }
};

var GameObject = function() {
  this.components = [];
};

GameObject.prototype = {
  add: function(component) {
    component.gameObject = this;
    this.components.push(component);

    component.onadd(this);
    if (this.game) {
      component.ongameadd(this, this.game);
    }

    return component;
  },
  get: function(typeObject) {
    var components = this.components,
        count = components.length,
        prototype = typeObject.prototype,
        component,
        i;

    for ( i = 0; i < count; i++ ) {
      component = components[i];
      if ( prototype.isPrototypeOf( component ) ) {
        return component;
      }
    }

    // yay, explicit-ness-ness
    return null;
  },
  destroy: function(component) {
    if (component) {
      var removeComponent = function() {
        var index = this.components.indexOf(component);

        if (index != -1) {
          component.ondestroy(this);
          if (this.game) {
            component.ongamedestroy(this, this.game);
          }

          component.gameObject = null;

          this.components.splice(index, 1);
        }
      };

      if (this.game) {
        this.game.task({callback: removeComponent.bind(this), priority: 'GARBAGE', once: true});
      } else {
        removeComponent.call(this);
      }
    } else if (this.game) {
      this.game._destroyobject(this);
    }
  },
  call: function(method) {
    var args = Array.prototype.slice.call(arguments, 1), 
        components = this.components,
        count = components.length,
        component,
        i;

    for ( i = 0; i < count; i++ ) {
      component = components[i];
      if (component[method]) {
        component[method].apply(component, args);
      }
    }
  }
};

// Component
// subclasses Emitter.
var Component = function() {};

Component.prototype = aqua.extend(
  aqua.emitter(),
  {
    // onadd: when added to object
    onadd: function(gameObject){},
    // ongameadd: when added to object to a game object
    ongameadd: function(gameObject, game){},

    ondestroy: function(gameObject){},
    ongamedestroy: function(gameObject, game){},

    destroy: function() {
      if (this.gameObject) {
        this.gameObject.destroy(this);
      }
    }
  });

aqua.game = function() {
  return new Game();
};
aqua.gameService = function() {
  return new GameService();
};
aqua.gameObject = function() {
  return new GameObject();
};
aqua.component = function() {
  return new Component();
};

aqua.extend(aqua.types, {
  Game: Game,
  GameObject: GameObject,
  Component: Component
});

})(this, this.aqua);
