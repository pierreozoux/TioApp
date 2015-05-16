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

GroupOrderedResources.helpers({
  isReceived: function() {
    return this.state === 'received' ? true : false;
  }
});

GroupOrderedResources.allow({
  insert: function(userId) {
    return userId?true:false;
  },
  update: function(userId) {
    return userId?true:false;
  }
});

if (Meteor.isClient) {
  GroupOrderedResources.after.update(function (userId, doc) {
    var quantityReceived = doc.received - this.previous.received;
    console.log('quantityReceived: ' + quantityReceived);
    Resources.update(
      doc.resourceId,
      {
        $inc: {quantity: quantityReceived}
      }
    );
  });
}

