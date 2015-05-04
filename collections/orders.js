Orders = new Mongo.Collection('orders');


Orders.helpers({
  getContact: function() {
    return Contacts.findOne(this.contactId);
  },
  action: function() {
    switch (this.state) {
      case 'created': return 'Print';
      case 'completed': return 'Contact';
    }
  },
  contact: function() {
    Orders.update(this._id, {$set: {state: 'contacted'}});
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
      if (this.localState(resource) === 'sold') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  ordered: function(resource) {
    if (this.localResource(resource)) {
      return true;
    } else {
      return false;
    }
  },
  remove: function(resource) {
    var order = this;
    Orders.update(
      order._id,
      {
        $pull: {
          orderedResources: {
            state: 'ordered',
            resourceId: resource._id
          }
        }
      }
    );
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
  sell: function(resource) {
    var order = this;
    var newState;
    if (order.isSold(resource)) {
      newState = 'ordered';
      Resources.update(resource._id, {$inc: {quantity: 1}});

    } else {
      newState = 'sold';
      Resources.update(resource._id, {$inc: {quantity: -1}});
    }
    Meteor.call('updateOrderedResourceState', order, resource, newState);
 },
  cssClass: function(resource) {
    if (!this.ordered(resource)) {
      return 'disabled';
    }
  }
});

Meteor.methods({
  updateOrderedResourceState: function(order, resource, state) {
    Orders.update({
      _id: order._id,
      'orderedResources.resourceId': resource._id
    }, {
      $set : {
        'orderedResources.$.state': state
      }
    });
  }
});

Orders.allow({
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


var Schemas = {};

var OrderedResource = new SimpleSchema({
  state: {
    type: String,
    regEx: /(ordered|sold)/,
    optional: true
  },
  resourceId: {
    type: String
  }
});

Schemas.Order = new SimpleSchema({
  createdAt: {
    type: Date,
    label: 'Date',
    autoValue: function() {
      return new Date();
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
    label: 'Phone',
    optional: true
  },
  humanId: {
    type: String,
    label: 'Number'
  },
  courseId: {
    type: String
  }
});

Orders.attachSchema(Schemas.Order);

if (Meteor.isServer) {
  Meteor.publish('orders', function () {
    if (this.userId) {
      return Orders.find({});
    }
  });
} else {
  Meteor.subscribe('orders');
  Template.orders.helpers({
    settings: function () {
      return {
        collection: Orders.find(),
        fields: [
          {key: 'humanId', label: 'Number'},
          'state',
          {
            key:'createdAt',
            label: 'Created',
            fn: function(value) {
              if (value instanceof Date) {
                return moment(value).calendar();
              } else {
                return 'Never';
              }
            }
          },
          {
            key:'contactedAt',
            label: 'Contacted',
            fn: function(value) {
              if (value instanceof Date) {
                return moment(value).calendar();
              } else {
                return 'Never';
              }
            }
          },
          'phone',
          {
            key: 'contactId',
            label: 'note',
            fn: function(value, object) {
              return object.getContact() && object.getContact().note;
            }
          },
          {
            key: 'contactId',
            label: 'name',
            fn: function(value, object) {
              return object.getContact() && object.getContact().name;
            }
          },
          {
            key: '_id',
            label: 'action',
            tmpl: Template.ordersAction
          }
        ]
      };
    }
  });

  Template.orders.events({
    'click .btn': function (event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.target.className.indexOf('Contact') > 0) {
        this.contact();
      }
    },
    'click .reactive-table tr': function (event) {
      Router.go('/order/' + this._id);
    }
  });
}

