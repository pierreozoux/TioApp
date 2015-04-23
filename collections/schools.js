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

if (Meteor.isServer) {
  Meteor.publish('schools', function () {
    if (this.userId) {
      return Schools.find({});
    }
  });
} else {
  Template.index.helpers({
   schools: function() {
      return Schools.find().fetch().map(function(it){ return it.name; });
    }
  });
}

