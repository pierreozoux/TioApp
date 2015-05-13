GroupOrders = new Mongo.Collection('groupOrders');

GroupOrders.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    label: 'Date',
    autoValue: function() {
      return new Date();
    }
  },
  receivedAt: {
    type: Date,
    label: 'Received Date',
    optional: true
  },
  state: {
    type: String,
    defaultValue: 'created',
    regEx: /(created|received)/
  },
  group: {
    type: String
  }
}));

GroupOrders.allow({
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

