Schools = new Mongo.Collection('schools');

var Schemas = {};

Schemas.School = new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    unique: true,
    max: 200
  }
});

Schools.attachSchema(Schemas.School);

