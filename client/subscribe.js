Tracker.autorun(function () {
  courseId = Session.get('courseId');
  groupOrderId = Session.get('groupOrderId');
  if (courseId) {
    Meteor.subscribe('resources', courseId, 'course');
  } else if (groupOrderId) {
    Meteor.subscribe('resources', groupOrderId, 'groupOrder', function() {
      Session.set('ready', true);
    });
  }
});
