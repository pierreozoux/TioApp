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
    defaultValue: 'draft',
    regEx: /(draft|created|completed|contacted|canceled|sold)/
  },
  orderedResources: {
    type: [OrderedResource]
  },
  contactId: {
    type: String,
    optional: true
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
          'state',
          'createdAt',
          'contactedAt',
          {
            key: 'contactId',
            label: 'phone',
            fn: function(value, object) {
              if (value) {
                var contact = Contacts.findOne(value);
                if (contact) { return Contacts.findOne(value).phone; }
              }
            }
          },
          {
            key: 'contactId',
            label: 'note',
            fn: function(value, object) {
              if (value) {
                var contact = Contacts.findOne(value);
                if (contact) { return Contacts.findOne(value).note; }
              }
            }
          },
          {
            key: 'contactId',
            label: 'name',
            fn: function(value, object) {
              if (value) {
                var contact = Contacts.findOne(value);
                if (contact) { return Contacts.findOne(value).name; }
              }
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

