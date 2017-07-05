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
      var currentGroupOrder = GroupOrders.findOne({group: group, state: 'created'})
      var currentGroupOrderId;

      // If GroupOrder doesn t exist, we create it
      if (currentGroupOrder == null) {
        currentGroupOrderId = GroupOrders.insert({
          group: group
        });
        // console.log('New GroupOrder ID : ' + currentGroupOrderId);
        _.each(groupOrders, function(resourceId) {
          GroupOrderedResources.insert({
            groupOrderId: currentGroupOrderId,
            resourceId: resourceId
          });
        });
      } else {
        // Else, we update the existing one with resources that doesn t exist
        currentGroupOrderId = currentGroupOrder._id;
        // onsole.log('Existing GroupOrder ID : ' + currentGroupOrderId);
        _.each(groupOrders, function(resourceId) {
          var groupOrderResource = GroupOrderedResources.findOne({groupOrderId: currentGroupOrder._id, resourceId: resourceId});
          // If orderResource doesn t exist, we create it
          if (groupOrderResource == null) {
            // console.log('Inserting groupOrderResource ID ');
            GroupOrderedResources.insert({
              groupOrderId: currentGroupOrderId,
              resourceId: resourceId
            });
          } else {
            // console.log('Existing groupOrderResource ID : ' + groupOrderResource._id);
          }
        });
      }
      return currentGroupOrderId;
    }
  });

  GroupOrderedResources.after.insert(function(userId, doc) {
    var resource = Resources.findOne(doc.resourceId);
    resource.updateGroupOrders();
  });
  GroupOrderedResources.after.update(function (userId, doc) {
    var quantityReceived = doc.received - this.previous.received;
    Resources.update(
      doc.resourceId,
      {
        $inc: {quantity: quantityReceived}
      }
    );
    var resource = Resources.findOne(doc.resourceId);
    resource.updateGroupOrders();
    resource.updateOrders();
  });
}

