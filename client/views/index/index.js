var clean = function () {
  Session.set('schoolName', '');
  Session.set('courseName', '');
  Session.set('contactId', '');
  Session.set('needContact', false);

  $('#school-selector').val('');
  $('#course-selector').val('');
}

clean();

Template.index.helpers({
  schools: function() {
    return Schools.find().fetch().map(function(it){ return it.name; });
  }
});

Template.index.onRendered(function() {
  Meteor.typeahead.inject();
  $('#school-selector').focus();
});

Template.index.events({
  'keyup #school-selector, click': function (event) {
     var schoolName= $('#school-selector').val();
     Session.set('schoolName', schoolName);
     if (!Schools.findOne({name: schoolName})) {
       Session.set('courseName', '');
     } 
  },
  'click #confirm': function () {
    var state;
    var orderedResources = [];
    var contactId = Session.get('contactId');
    var humanId = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for( var i=0; i < 5; i+=1 ) {
      humanId += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    Resources.find().forEach( function(resource) {
      var inCart = $('#' + resource._id).attr('class') !== 'disabled';
      var sold = $('#' + resource._id).find(':checkbox').prop('checked');
      if (inCart) { 
        if (sold) {
          state = 'sold';
          Resources.update(resource._id, {$inc: {quantity: -1}});
        } else {
          state = 'ordered';
        }
        orderedResources.push({
          state: state,
          resourceId: resource._id
        });
      }
   });

   if (orderedResources.length) {
     var orderId = Orders.insert({
       contactId: contactId,
       orderedResources: orderedResources,
       humanId: humanId,
       courseId: Courses.findOne({name: Session.get('courseName')})._id
     });
     clean();
     Router.go('/order/' + orderId);
   }
   clean();

  }
});

