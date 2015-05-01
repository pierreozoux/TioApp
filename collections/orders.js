Orders = new Mongo.Collection('orders');

Orders.helpers({
  contact: function() {
    return Contacts.findOne(this.contactId);
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
              return object.contact()?.note;
            }
          },
          {
            key: 'contactId',
            label: 'name',
            fn: function(value, object) {
              return object.contact()?.name;
            }
          },
          {
            key: '_id',
            label: 'action',
            fn: function(value) {
              return new Spacebars.SafeString('<a class="btn btn-success" href="#" role="button">Call</a>');
            }
          }
        ]
      };
    }
  });
}

