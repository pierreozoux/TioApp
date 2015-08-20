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
    autoValue: function() {
      if (this.isInsert){
        var resource = Resources.findOne(this.field('resourceId').value);
        return Math.max(resource.orders() - (resource.groupOrders() + resource.quantity), 0);
      }
    }
  },
  received: {
    type: Number,
    defaultValue: 0,
    custom: function() {
      var received = this.value;
      var quantity = this.field('quantity').value;
      if (quantity >= received) {
        return true;
      } else {
        return 'Quantity must be superior or equal to Received.';
      }
    }
  },
  resourceId: {
    type: String
  }
}));

GroupOrderedResources.helpers({
  isReceived: function() {
    return this.state === 'received' ? true : false;
  },
  year: function() {
    return Resources.findOne(this.resourceId).year();
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

if (Meteor.isServer) {
  Meteor.methods({
    insertGroupOrder: function(group, groupOrders) {
      var groupOrderId = GroupOrders.insert({
        group: group
      });
      _.each(groupOrders, function(resourceId) {
        GroupOrderedResources.insert({
          groupOrderId: groupOrderId,
          resourceId: resourceId
        });
      });
      return groupOrderId;
    }
  });
}
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

