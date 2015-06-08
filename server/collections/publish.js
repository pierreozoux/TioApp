Meteor.publish('contacts', function () {
  if (this.userId) {
    return Contacts.find();
  }
});

Meteor.publish('courses', function () {
  if (this.userId) {
    return Courses.find();
  }
});

Meteor.publish('groupOrders', function () {
  if (this.userId) {
    return GroupOrders.find({state: {$ne: 'received'}});
  }
});

Meteor.publish('groupOrderedResources', function () {
  if (this.userId) {
    return GroupOrderedResources.find();
  }
});

Meteor.publish('orders', function () {
  if (this.userId) {
    return Orders.find({state: {$nin: ['canceled', 'sold']}});
  }
});

Meteor.publish('resources', function (courseId) {
  if (this.userId) {
    if (courseId) {
      check(courseId, String);
      var course = Courses.findOne(courseId);
      if (course) {
        return Resources.find({_id: {$in: course.resources}});
      }
    } else {
      return Resources.find();
    }
  }
});

Meteor.publish('settings', function () {
  if (Houston._user_is_admin(this.userId)) {
    return Settings.find();
  }
});

Meteor.publish('schools', function () {
  if (this.userId) {
    return Schools.find();
  }
});

