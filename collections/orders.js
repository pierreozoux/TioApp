Orders = new Mongo.Collection('orders');

var OrderedResource = new SimpleSchema({
  state: {
    type: String,
    regEx: /(ordered|sold)/
  },
  resourceId: {
    type: String
  }
});

Orders.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    label: 'Date',
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  contactedAt: {
    type: Date,
    label: 'Contact Date',
    optional: true
  },
  state: {
    type: String,
    defaultValue: 'created',
    regEx: /(created|completed|contacted|canceled|sold)/
  },
  orderedResources: {
    type: [OrderedResource]
  },
  contactId: {
    type: String,
    optional: true
  },
  phone: {
    type: String,
    optional: true,
    label: 'Phone',
    autoValue: function() {
      if (this.isInsert) {
        var contact = Contacts.findOne(this.field('contactId').value);
        return contact && contact.phone;
      }
    }
  },
  name: {
    type: String,
    optional: true,
    label: 'Name',
    autoValue: function() {
      if (this.isInsert) {
        var contact = Contacts.findOne(this.field('contactId').value);
        return contact && contact.name;
      }
    }
  },
  humanId: {
    type: String,
    label: 'Number'
  },
  courseId: {
    type: String
  },
  courseName: {
    type: String,
    label: 'Course Name',
    autoValue: function() {
      if (this.isInsert) {
        var course = Courses.findOne(this.field('courseId').value);
        return course.name;
      }
    }
  },
  stateSupport: {
    type: Boolean,
    label: 'State Support',
    autoValue: function() {
      if (this.isInsert) {
        var contact = Contacts.findOne(this.field('contactId').value);
        return contact && contact.stateSupport;
      }
    }
  },
}));

Orders.allow({
  insert: function(userId) {
    return userId?true:false;
  },
  update: function(userId) {
    return userId?true:false;
  }
});

Orders.helpers({
  getContact: function() {
    return Contacts.findOne(this.contactId);
  },
  print: function() {
    return (this.action() === 'Print')?true:false;
  },
  contact: function() {
    Meteor.call('contact', this);
  },
  getCourse: function() {
    return Courses.findOne(this.courseId);
  },
  localResource: function(resource) {
    return _.findWhere(this.orderedResources, {resourceId: resource._id});
  },
  localState: function(resource) {
    return this.localResource(resource) && this.localResource(resource).state;
  },
  isSold: function(resource) {
    if (this.localResource(resource)) {
      return (this.localState(resource) === 'sold')?true:false;
    } else {
      return false;
    }
  },
  ordered: function(resource) {
    return (this.localResource(resource))?true:false;
  },
  remove: function(resource, force) {
    var order = this;
    var newState = order.state;
    if (force || order.containsOrdered() > 1) {
      if (force) {
        newState = 'sold';
      }
      Orders.update(
        order._id,
        {
          $pull: {
            orderedResources: {
              state: 'ordered',
              resourceId: resource._id
            }
          }
        }, {
          $et: {
            state: newState
          }
        }
      );
    } else {
      Session.set('intent', 'removeLastResource');
      Session.set('lastResourceId', resource._id);
      $('#confirmAction').modal();
    }
  },
  add: function(resource) {
    var order = this;
    Orders.update(
      order._id,
      {
        $addToSet: {
          orderedResources: {
            resourceId: resource._id,
            state: 'ordered'
          }
        }
      }
    );
  },
  sell: function(resource, force) {
    var order = this;
    if (force || order.containsOrdered() > 1) {
      Meteor.call('updateOrderedResourceState', order, resource, force);
    } else {
      Session.set('intent', 'sellLastResource');
      Session.set('lastResourceId', resource._id);
      $('#confirmAction').modal();
    }
  },
  cssClass: function(resource) {
    var order = this;
    if (!order.ordered(resource) || order.definitiveState()) {
      return 'disabled';
    }
  },
  containsOrdered: function() {
    var order = this;

    return _.reduce(
      order.orderedResources,
      function(memo, orderedResource) {
        if (orderedResource.state === 'ordered') {
          return memo + 1;
        } else {
          return memo;
        }
      },
      0
    );
  },
  definitiveState: function() {
    return (this.state === 'sold' || this.state === 'canceled')?true:false;
  },
  resources: function () {
    var course = this.getCourse();
    if (course) {
      return Resources.find({_id: {$in: course.resources}});
    }
  },
  justOrderedResources: function () {
    var ids = _.compact(_.map(
      this.orderedResources,
      function(orderedResource) {
        if (orderedResource.state === 'ordered') {
          return orderedResource.resourceId;
        }
      })
    );
    return Resources.find({_id: {$in: ids}});
  },
  sellAll: function (force) {
    var order = this;
    if (force) {
      console.log(order)
      console.log(order.justOrderedResources())
      order.justOrderedResources().forEach(function (resource){
        Meteor.call('updateOrderedResourceState', order, resource, force);
      })
    } else {
      Session.set('intent', 'sellAll');
      $('#confirmAction').modal();
    }
  }
});

if (Meteor.isServer) {
  Orders.after.insert(function(orderId, order) {
    console.log('Order after insert :' + orderId);
    // var order = Orders.findOne(orderId);
    if(order !== undefined) {
      // see containsOrdered: We have to redefine this method because Order object do not have method helper declared
      if (! _.reduce(
        order.orderedResources,
        function(memo, orderedResource) {
          if (orderedResource.state === 'ordered') {
            return memo + 1;
          } else {
            return memo;
          }
        },
        0
      )) {
        Orders.update(orderId, {
          $set: {
            state: 'sold'
          }
        });
      }
      // Update orders quantity
      var course = Courses.findOne(order.courseId);
      if (course) {
        Resources.find({_id: {$in: course.resources}}).forEach(function(resource) {
          console.log('Order after insert - resources:' + resource._id);
          console.log(orderId);
          resource.updateOrders();
        });
      }
    }
  });

  Orders.after.update(function() {
    if(this.status === 'contacted' && this.previous.status !== 'contacted') {
      var contactedAt = new Date;
      Orders.update(this._id, {
        $set: {
          contactedAt: contactedAt
        }
      });
    }
    this.transform().resources().forEach(function(resource) {
      resource.updateOrders();
    });
  });
  
  ReactiveTable.publish('orders', function() {
    if (this.userId) {
      return Orders;
    }
  }, {
    state: {$nin: ['canceled', 'sold']}
  });
  
  Meteor.methods({
    contact: function(order) {
      Orders.update(order._id, {$set: {state: 'contacted', contactedAt: Date.now()}});
    },
    updateOrderedResourceState: function(tempOrder, resource, force) {
      var resourceState;
      var quantityDirection;
      var order = Orders.findOne(tempOrder._id);
      var newState = order.state;
      if (force) {
        newState = 'sold';
      }
      if (order.isSold(resource)) {
        resourceState = 'ordered';
        quantityDirection = 1;
      } else {
        resourceState = 'sold';
        quantityDirection = -1;
      }
      Resources.update(resource._id, {
        $inc: {quantity: quantityDirection}
      });
      Orders.update({
        _id: order._id,
        'orderedResources.resourceId': resource._id
      }, {
        $set : {
          'orderedResources.$.state': resourceState,
          state: newState
        }
      });
    },
    markCompleted: function() {
      var onlyOrdered;

      Orders.find({state: 'created'}).forEach(function(order) {
        onlyOrdered = _.filter(order.orderedResources, function(resource){
          return resource.state === 'ordered';
        });
        if(onlyOrdered.length > 0) {
          var completedOrdered = _.every(onlyOrdered, function(ordered) {
            var resource = Resources.findOne(ordered.resourceId);
            if (resource) {
              return resource.availability() > 0;
            } else {
              return false;
            }
          });
          if (completedOrdered){
            console.log('Order completed: ' + order._id)
            Orders.update(order._id, {
              $set: {state: 'completed'}
            } , function(error) {
              if (error) {
                throw new Meteor.Error('Collection-Update-Error', 'error updating during a mark as completed id: ' + order._id);
              }
            });
          }
        }
      });
      Resources.find().forEach(function(resource){
        resource.updateOrders();
      })
    },

    cleanOrders: function() {

      // Clear orders
      // var oldOrders = Orders.find({ 'createdAt' : { $lte: new Date("Jan 10, 2018")}, $or: [{state: 'sold'},{state: 'canceled'}]});
      var oldOrders = Orders.find({ $or: [{state: 'sold'},{state: 'canceled'}]});
      oldOrders.forEach(function(order) {
        log.info('Order to delete: ' + order.createdAt + ', state: ' + order.state);
      });
      // Really remove
      Orders.remove({ $or: [{state: 'sold'},{state: 'canceled'}]});

      // Clear GroupOrder
      var grouOrder = GroupOrders.find({ 'state' : 'received'});
      grouOrder.forEach(function(go) {
        log.info('GroupOrder to delete: ' + go.createdAt + ', state: ' + go.state);
        GroupOrderedResources.remove({ 'groupOrderId' : go._id});
      });

      GroupOrders.remove({ 'state' : 'received'});
    }
  });
}