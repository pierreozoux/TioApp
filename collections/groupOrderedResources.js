GroupOrderedResources = new Mongo.Collection('groupOrderedResources');

GroupOrderedResources.attachSchema(new SimpleSchema({
  groupOrderId: {
    type: String
  },
  state: {
    type: String,
    defaultValue: 'ordered',
    regEx: /(ordered|received)/
  },
  quantity: {
    type: Number,
    defaultValue: 10
  },
  received: {
    type: Number,
    defaultValue: 0
  },
  resourceId: {
    type: String
  }
}));

GroupOrderedResources.allow({
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

