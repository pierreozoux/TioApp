var clean = function () {
  Session.set('courseId', '');
  Session.set('contactId', '');
  Session.set('needContact', false);

  $('#school-selector').val('');
  $('#course-selector').val('');
};

Session.set('schoolId', '');

Tracker.autorun(function () {
  if (Session.get('schoolId') === '') {
    clean();
  }
});

Template.schoolSelection.helpers({
  schoolsName: function() {
    return Schools.find().fetch().map(function(school){ return {id: school._id, value: school.name}; });
  },
  selected: function(event, suggestion) {
    Session.set('schoolId', suggestion.id);
  }
});

Template.schoolSelection.onRendered(function() {
  Meteor.typeahead.inject();
  $('#school-selector').focus();
});

