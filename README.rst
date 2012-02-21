======
AquaJS
======

Aqua wants to provide rudimentary code for developing games in JavaScript. It isn't an engine but it provides work to help produce one.

Requires
========

For building::

  - grunt
  - uglifyjs

Examples
========

A Game
------

.. sourcecode :: javascript

  var myGame = aqua.game(),
      myGameObject = aqua.gameObject();

  // setup rendering, physics, etc services
  myGame.addService(someService());
  ...

  // its a good idea to have a component type for storing position, rotation, and other location in world state
  var transformComponent = function() {
    aqua.base(this).constructor.call(this);

    this.position = vector(0, 0);
  };
  transformComponent = aqua.extend(
    aqua.component(),
    {
      // transform methods
    });

  myGameObject.add(transformComponent());
  myGameObject.add(renderingComponent());
  myGameObject.add(...);
  myGame.add(myGameObject);

  myGame.main();

GameService
-----------

This is an example service that replicates the tasks Game objects has by default.

.. sourcecode :: javascript

  var UpdateService = function() {
    aqua.base(this).constructor.call(this);
  };

  UpdateService.prototype = aqua.extend(
    aqua.gameService(),
    {
      ongameadd: function(game) {
        this.tasks.push(
          game.task({callback: game.call.bind(game, 'update')}));
        this.tasks.push(
          game.task({
            callback: game.call.bind(game, 'lateUpdate'),
            priority: 'LATE_UPDATE'}));
      }
    }
  );
