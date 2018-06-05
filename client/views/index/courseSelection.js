Template.courseSelection.helpers({
  courses: function() {
    var school = Schools.findOne(Session.get('schoolId'));
    if (school) {
      return Courses.find({schoolId: school._id});
    }
  }
});

Template.courseSelection.events({
  'change #course-selector': function(event) {
    var value = $(event.target).val();
    console.log('courseId selected: ' + value);
    Session.set('courseId', value);
  }
});

