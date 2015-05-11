Meteor.subscribe('orders');
Meteor.subscribe('schools');
Meteor.subscribe('courses');
Meteor.subscribe('contacts');

Tracker.autorun(function () {
  Meteor.subscribe('resources', Session.get('courseName'));
});


