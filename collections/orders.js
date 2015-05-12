Orders = new Mongo.Collection('orders');

var OrderedResource = new SimpleSchema({
  state: {
    type: String,
    regEx: /(ordered|sold)/,
    optional: true
  },
  resourceId: {
    type: String
  }
});

Orders.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    label: 'Date',
    autoValue: function() {
      return new Date();
    }
  },
  contactedAt: {
    type: Date,
    label: 'Contact Date',
    optional: true
  },
  state: {
    type: String,
    defaultValue: 'created',
    regEx: /(created|completed|contacted|canceled|sold)/
  },
  orderedResources: {
    type: [OrderedResource]
  },
  contactId: {
    type: String,
    optional: true
  },
  phone: {
    type: String,
    optional: true,
    label: 'Phone',
    autoValue: function() {
      if (this.isInsert) {
        var contact = Contacts.findOne(this.field('contactId').value);
        return contact && contact.phone;
      }
    }
  },
  name: {
    type: String,
    optional: true,
    label: 'Name',
    autoValue: function() {
      if (this.isInsert) {
        var contact = Contacts.findOne(this.field('contactId').value);
        return contact && contact.name;
      }
    }
  },
  humanId: {
    type: String,
    label: 'Number'
  },
  courseId: {
    type: String
  },
  courseName: {
    type: String,
    label: 'Course Name',
    autoValue: function() {
      if (this.isInsert) {
        var course = Courses.findOne(this.field('courseId').value);
        return course.name;
      }
    }
  }
}));

Orders.allow({
  insert: function(userId) {
    if (userId) {
      return true;
    }
  },
  update: function(userId) {
    if (userId) {
      return true;
    }
  }
});

Orders.helpers({
  getContact: function() {
    return Contacts.findOne(this.contactId);
  },
  action: function() {
    switch (this.state) {
      case 'created': return 'Print';
      case 'completed': return 'Contact';
    }
  },
  contact: function() {
    Orders.update(this._id, {$set: {state: 'contacted'}});
  },
  getCourse: function() {
    return Courses.findOne(this.courseId);
  },
  localResource: function(resource) {
    return _.findWhere(this.orderedResources, {resourceId: resource._id});
  },
  localState: function(resource) {
    return this.localResource(resource) && this.localResource(resource).state;
  },
  isSold: function(resource) {
    if (this.localResource(resource)) {
      if (this.localState(resource) === 'sold') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  ordered: function(resource) {
    if (this.localResource(resource)) {
      return true;
    } else {
      return false;
    }
  },
  remove: function(resource, force) {
    var order = this;
    var newState = order.state
    if (force || order.containsOrdered() > 1) {
      if (force) {
        newState = 'sold';
      }
      Orders.update(
        order._id,
        {
          $pull: {
            orderedResources: {
              state: 'ordered',
              resourceId: resource._id
            }
          }
        }, {
          $et: {
            state: newState
          }
        }
      );
    } else {
      Session.set('intent', 'removeLastResource');
      Session.set('lastResourceId', resource._id);
      $('#confirmAction').modal();
    }
  },
  add: function(resource) {
    var order = this;
    Orders.update(
      order._id,
      {
        $addToSet: {
          orderedResources: {
            resourceId: resource._id,
            state: 'ordered'
          }
        }
      }
    );
  },
  sell: function(resource, force) {
    var order = this;
    if (force || order.containsOrdered() > 1) {
      Meteor.call('updateOrderedResourceState', order, resource, force);
    } else {
      Session.set('intent', 'sellLastResource');
      Session.set('lastResourceId', resource._id);
      $('#confirmAction').modal();
    }
  },
  cssClass: function(resource) {
    var order = this;
    if (!order.ordered(resource) || order.definitiveState()) {
      return 'disabled';
    }
  },
  containsOrdered: function() {
    var order = this;

    return _.reduce(
      order.orderedResources,
      function(memo, orderedResource) {
        if (orderedResource.state === 'ordered') {
          return memo + 1;
        } else {
          return memo;
        }
      },
      0
    );
  },
  definitiveState: function() {
    var order = this;
    if (order.state === 'sold' || order.state === 'canceled') {
      return true;
    } else {
      return false;
    }
  }
});

Orders.after.insert(function() {
  var orderId = this._id;
  if (!Orders.findOne(orderId).containsOrdered()) {
    Orders.update(orderId, {
      $set: {
        state: 'sold'
      }
    });
  }
});

Meteor.methods({
  updateOrderedResourceState: function(order, resource, force) {
    var order = Orders.findOne(order._id);
    var newState = order.state;
    if (force) {
      newState = 'sold'
    }
    if (order.isSold(resource)) {
      resourceState = 'ordered';
      quantityDirection = 1;
    } else {
      resourceState = 'sold';
      quantityDirection = -1;
    }
    Resources.update(resource._id, {
      $inc: {quantity: quantityDirection}
    });
    Orders.update({
      _id: order._id,
      'orderedResources.resourceId': resource._id
    }, {
      $set : {
        'orderedResources.$.state': resourceState,
        state: newState
      }
    });
  }
});

