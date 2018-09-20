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
  },
  name: {
      type: String,
      label: 'Name',
      optional: true
  },
}));

GroupOrders.helpers({
  resources: function() {
    return GroupOrderedResources.find({groupOrderId: this._id}).map(function(groupOrderedResource){
      return groupOrderedResource.resourceId
    })
  }
});

GroupOrders.allow({
  insert: function(userId) {
    return userId?true:false;
  },
  update: function(userId) {
    return userId?true:false;
  }
});

