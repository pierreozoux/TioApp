Meteor.publish('contacts', function () {
  if (this.userId) {
    return Contacts.find({});
  }
});

Meteor.publish('courses', function () {
  if (this.userId) {
    return Courses.find({});
  }
});

Meteor.publish('orders', function () {
  if (this.userId) {
    return Orders.find({});
  }
});

Meteor.publish('resources', function (courseName) {
  if (this.userId) {
    check(courseName, String);
    var course = Courses.findOne({name: courseName});
    if (course) {
      return Resources.find({_id: {$in: course.resources}});
    }
  }
});

Meteor.publish('schools', function () {
  if (this.userId) {
    return Schools.find({});
  }
});

