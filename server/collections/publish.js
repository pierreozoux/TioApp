Meteor.publish('contacts', function () {
  if (this.userId) {
    return Contacts.find();
  }
});

Meteor.publish('courses', function () {
  if (this.userId) {
    return Courses.find();
  }
});

Meteor.publish('groupOrders', function () {
  if (this.userId) {
    return GroupOrders.find({state: {$ne: 'received'}});
  }
});

Meteor.publish('groupOrderedResources', function () {
  if (this.userId) {
    return GroupOrderedResources.find();
  }
});

Meteor.publish('orders', function () {
  if (this.userId) {
    return Orders.find({state: {$nin: ['canceled', 'sold']}});
  }
});

Meteor.publish('resources', function () {
  if (this.userId) {
    //Transform function
    var transform = function(resource) {
      resource.computedYear = resource.year();
      resource.computedOrders = resource.orders();
      resource.computedGroupOrders = resource.groupOrders();
      return resource;
    }

    var self = this;

    var handle = Resources.find().observe({
      added: function (document) {
        self.added('resources', document._id, transform(document));
      },
      changed: function (newDocument, oldDocument) {
        self.changed('resources', newDocument._id, transform(newDocument));
      },
      removed: function (oldDocument) {
        self.removed('resources', oldDocument._id);
      }
    });

    self.onStop(function () {
      handle.stop();
    });

    self.ready();
  }
});

Meteor.publish('settings', function () {
  if (Houston._user_is_admin(this.userId)) {
    return Settings.find();
  }
});

Meteor.publish('schools', function () {
  if (this.userId) {
    return Schools.find();
  }
});

