Resources = new Mongo.Collection('resources');

Resources.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  reference: {
    type: String,
    label: 'Reference',
    max: 200,
    unique: true,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  group: {
    type: String,
    label: 'Editor',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  year: {
    type: String,
    label: 'Year',
    max: 200,
    optional: true
  },
  price: {
    type: Number,
    label: 'Price',
    decimal: true,
    optional: true
  },
  editor: {
    type: String,
    label: 'Editor',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  quantity: {
    type: Number,
    label: 'Quantity',
    defaultValue: 0
  },
  computedOrders: {
    type: Number,
    label: 'Orders',
    optional: true
  },
  computedGroupOrders: {
    type: Number,
    label: 'GroupOrders',
    optional: true
  },
  computedAvailability: {
    type: Number,
    label: 'Availability',
    optional: true
  },
  subject: {
    type: String,
    label: 'Subject',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  }
}));

Resources.helpers({
  // quantity - completed orders
  availability: function() {
    var resource = this;
    return resource.quantity - Orders.find({
      state: {$in: ['completed', 'contacted']},
      orderedResources: {$elemMatch: {
        resourceId: resource._id,
        state: 'ordered'
      }}
    }).count();
  },
  orders: function() {
    var resource = this;
    return Orders.find({
      state: {$in: ['created','completed', 'contacted']},
      orderedResources: {
        $elemMatch: {
          state: 'ordered',
          resourceId: resource._id
        }
      }
    }).count();
  },
  updateOrders: function () {
    var resource = this;
    Resources.update(resource._id, {
      $set: {
        computedOrders: this.orders(),
        computedAvailability: this.availability()
      }
    });
  },
  groupOrders: function() {
    var resource = this;
    return _.reduce(GroupOrderedResources.find({
      state: 'ordered',
      resourceId: resource._id
    }).fetch(), function(memo, groupOrderedResource){
      return memo + groupOrderedResource.quantity - groupOrderedResource.received;
    }, 0);
  },
  updateGroupOrders: function () {
    var resource = this;
    Resources.update(resource._id, {
      $set: {computedGroupOrders: this.groupOrders()}
    });
  },
});

Resources.allow({
  update: function(userId) {
    return userId?true:false;
  }
});

if (Meteor.isServer) {
  ReactiveTable.publish('resources', function() {
    if (this.userId) {
      return Resources;
    }
  });
  
  Meteor.methods({
    updateResources: function() {
      Resources.find().forEach(function(resource){
        resource.updateGroupOrders();
        resource.updateOrders();
      })
    }
  });
}
