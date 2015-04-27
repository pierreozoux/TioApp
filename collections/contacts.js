Contacts = new Mongo.Collection('contacts');

Contacts.allow({
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

Schemas.Contact = new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    max: 200
  },
  phone: {
    type: Number,
    label: 'Phone',
    regEx: /[0-9]{9}/
  },
  note: {
    type: String,
    label: 'Note',
    optional: true
  },
  email: {
    type: String,
    label: 'Email',
    unique: true,
    max: 200,
    regEx: SimpleSchema.RegEx.Email
  },
  stateSupport: {
    type: Boolean,
    label: 'State Support'
  }
});

Contacts.attachSchema(Schemas.Contact);

if (Meteor.isServer) {
  Meteor.publish('contacts', function () {
    if (this.userId) {
      return Contacts.find({});
    }
  });
} else {
  Template.contactSelection.helpers({
   contacts: function() {
     return Contacts.find().fetch().map(function(it){ return it.email; }).concat(Contacts.find().fetch().map(function(it){ return it.phone; }));
   }
  });

  Template.contactSelection.onRendered(function () {
    Meteor.typeahead.inject();
  });
}

