Template.index.rendered = function() {
    Meteor.typeahead.inject();
};

Meteor.subscribe("schools");
Meteor.subscribe("courses");

Template.index.events({
  'keyup #school-selector': function (event) {
     var value = $(event.target).val();
     Session.set('schoolName', value);
  }
});

