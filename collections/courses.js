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

