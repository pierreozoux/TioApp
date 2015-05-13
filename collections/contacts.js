Contacts = new Mongo.Collection('contacts');

Contacts.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    max: 200
  },
  phone: {
    type: String,
    label: 'Phone',
    unique: true,
    regEx: /^[0-9]{9}$/
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
    optional: true,
    regEx: SimpleSchema.RegEx.Email
  },
  stateSupport: {
    type: Boolean,
    label: 'State Support'
  }
}));

SimpleSchema.messages({
  regEx: [
    {exp: /^[0-9]{9}$/, msg: '[label] must be 9 digits, without any other chars.'}
  ]
});

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


