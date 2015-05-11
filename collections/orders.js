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
      var contact = Contacts.findOne(this.field('contactId').value);
      return contact && contact.phone;
    }
  },
  name: {
    type: String,
    optional: true,
    label: 'Name',
    autoValue: function() {
      var contact = Contacts.findOne(this.field('contactId').value);
      return contact && contact.name;
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
    autoValue: function() {
      var course = Courses.findOne(this.field('courseId').value);
      return course.name;
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
  remove: function(resource) {
    var order = this;
    Orders.update(
      order._id,
      {
        $pull: {
          orderedResources: {
            state: 'ordered',
            resourceId: resource._id
          }
        }
      }
    );
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
  sell: function(resource) {
    var order = this;
    var newState;
    if (order.isSold(resource)) {
      newState = 'ordered';
      Resources.update(resource._id, {$inc: {quantity: 1}});

    } else {
      newState = 'sold';
      Resources.update(resource._id, {$inc: {quantity: -1}});
    }
    Meteor.call('updateOrderedResourceState', order, resource, newState);
 },
  cssClass: function(resource) {
    if (!this.ordered(resource)) {
      return 'disabled';
    }
  },
  containsOrdered: function() {
    var order = this;

    return _.reduce(
      order.orderedResources,
      function(memo, orderedResource) {
        return memo || (orderedResource.state === 'ordered');
      },
      false
    );
  }
});

