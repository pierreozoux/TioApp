Template.courseSelection.helpers({
  courses: function() {
    var schoolId;
    var schoolName = Session.get('schoolName');
    var school = Schools.findOne({name: schoolName});
    if (school) {
      schoolId = school._id;
      return Courses.find({schoolId: schoolId});
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


