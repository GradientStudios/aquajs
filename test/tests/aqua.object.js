module('object');

test('component add/destroy events', 10, function() {
  function TestComponent() {}
  TestComponent.prototype = aqua.extend(
    aqua.component(),
    {
      onadd: function() {
        ok(true, 'onadd');
      },
      ondestroy: function() {
        ok(true, 'ondestroy');
      },
      ongameadd: function() {
        ok(true, 'ongameadd');
      },
      ongamedestroy: function() {
        ok(true, 'ongamedestroy');
      }
    }
  );

  var game = aqua.game(),
      gameObject = aqua.gameObject(),
      testComponent = new TestComponent();

  gameObject.add(testComponent);
  testComponent.destroy();

  game.add(gameObject);
  gameObject.add(testComponent);
  gameObject.destroy();
  game.step();
  testComponent.destroy();

  gameObject.add(testComponent);
  game.add(gameObject);
  testComponent.destroy();
  game.step();
});

test('component method calls', 2, function() {
  function TestComponent() {}
  TestComponent.prototype = aqua.extend(
    aqua.component(),
    {
      update: function() {
        ok(true, 'update');
      },
      lateUpdate: function() {
        ok(true, 'lateUpdate');
      }
    });

  var game = aqua.game(),
      gameObject = aqua.gameObject(),
      testComponent = new TestComponent();

  gameObject.add(testComponent);
  game.add(gameObject);
  game.step();
});
