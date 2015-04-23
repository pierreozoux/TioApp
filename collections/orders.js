Orders = new Mongo.Collection('orders');

var Schemas = {};

OrderedResource = new SimpleSchema({
  state: {
    type: String,
    regEx: /(ordered|sold)/,
    optional: true

  }
  resources: {
    type: [String]
  }
});

Schemas.Order = new SimpleSchema({
  date: {
    type: Date,
    label: 'Date'
  },
  contactDate: {
    type: Date,
    label: 'Contact Date'
  },
  state: {
    type: String,
    regEx: /(created|completed|contacted|canceled|sold)/
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

