GroupOrders = new Mongo.Collection('groupOrders');

GroupOrders.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    label: 'Date',
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    }
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
    return userId?true:false;
  },
  update: function(userId) {
    return userId?true:false;
  }
});

