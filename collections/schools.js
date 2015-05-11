Schools = new Mongo.Collection('schools');

Schools.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    unique: true,
    max: 200
  }
}));

