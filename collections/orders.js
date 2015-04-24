Orders = new Mongo.Collection('orders');

Resources.allow({
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
  date: {
    type: Date,
    label: 'Date'
  },
  contactDate: {
    type: Date,
    label: 'Contact Date',
    optional: true
  },
  state: {
    type: String,
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

