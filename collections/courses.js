Courses = new Mongo.Collection('courses');

Courses.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    unique: true,
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
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
}));
