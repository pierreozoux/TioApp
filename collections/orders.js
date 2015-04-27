Orders = new Mongo.Collection('orders');

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


var Schemas = {};

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

Schemas.Order = new SimpleSchema({
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
    defaultValue: 'draft',
    regEx: /(draft|created|completed|contacted|canceled|sold)/
  },
  orderedResources: {
    type: [OrderedResource]
  },
  parentId: {
    type: String,
    optional: true
  }
});

Orders.attachSchema(Schemas.Order);

if (Meteor.isServer) {
  Meteor.publish('orders', function () {
    if (this.userId) {
      return Orders.find({});
    }
  });
} else {
  Template.newOrder.helpers({

  });
}

