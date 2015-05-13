Meteor.subscribe('orders');
Meteor.subscribe('schools');
Meteor.subscribe('courses');
Meteor.subscribe('contacts');
Meteor.subscribe('groupOrders');

Tracker.autorun(function () {
  Meteor.subscribe('resources', Session.get('courseId'));
});


