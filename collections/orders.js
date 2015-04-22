Orders = new Mongo.Collection('orders');

var Schemas = {};

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
  }
});

Orders.attachSchema(Schemas.Order);

