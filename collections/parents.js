Parents = new Mongo.Collection('parents');

var Schemas = {};

Schemas.Parent = new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    max: 200
  },
  phone: {
    type: Number,
    label: 'Phone',
    max: 9,
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

Parents.attachSchema(Schemas.Parent);

