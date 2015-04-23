Courses = new Mongo.Collection('courses');

var Schemas = {};

Schemas.Course = new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    unique: true,
    max: 200
  },
  year: {
    type: String,
    label: 'Year',
    max: 200
  },
  schoolId: {
    type: String,
    label: 'SchoolId'
  },
  resources: {
    type: [String],
    label: 'resources'
  }
});

Courses.attachSchema(Schemas.Course);

if (Meteor.isServer) {
  Meteor.publish('courses', function () {
    if (this.userId) {
      return Courses.find({});
    }
  });
} else {
  Template.courseSelection.helpers({
    courses: function() {
      var schoolId;
      var schoolName = Session.get('schoolName');
      var school = Schools.findOne({name: schoolName});
      if (school) {
        schoolId = school._id;
        return Courses.find({schoolId: schoolId});
      }
    }
  });
}

