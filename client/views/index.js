Session.setDefault('courseName', '');
Session.setDefault('schoolName', '');


Template.index.rendered = function() {
    Meteor.typeahead.inject();
};

Meteor.subscribe('schools');
Meteor.subscribe('courses');

Tracker.autorun(function () {
  Meteor.subscribe('resources', Session.get('courseName'));
});

Template.index.events({
  'keyup #school-selector': function (event) {
     var value = $(event.target).val();
     Session.set('schoolName', value);
     if (!value) {
       Session.set('courseName', '');
     } 
  }
});

Template.courseSelection.events({
  'change #course-selector': function(event) {
    if (Session.get('schoolName')) {
      var value = $(event.target).val();
      Session.set('courseName', value);
    }
  }
});

