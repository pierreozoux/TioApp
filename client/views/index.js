Session.setDefault('courseName', '');
Session.setDefault('schoolName', '');
Session.setDefault('needContact', false);
Meteor.subscribe('schools');
Meteor.subscribe('courses');
Meteor.subscribe('contacts');

Template.index.onRendered(function() {
    Meteor.typeahead.inject();
});

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
  },
  'click .btn': function () {
    var orderId = new Mongo.ObjectID()._str;
    var state;
    var orderedResources = [];
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

      if (orderedResources.length) {
        Orders.insert({
          _id: orderId,
          orderedResources: orderedResources
        });
      }
    });

    if(needParent) {
      Router.go('/orders/new/' + orderId);
    } else {
      Session.set('schoolName', '');
      $('#school-selector').val('');
      Session.set('courseName', '');
      $('#course-selector').val('');
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

Template.resourcesSelection.events({
  'click .fa-trash': function(event) {
    event.currentTarget.closest('tr').className = 'disabled';
    event.currentTarget.className = 'fa fa-cart-plus';
    $(event.currentTarget).parent().closest('td').next().find(':checkbox').prop('disabled', true);
    Template.resourcesSelection.__helpers.get('setNeedContact')();
  },
  'click .fa-cart-plus': function(event) {
    event.currentTarget.closest('tr').className = '';
    event.currentTarget.className = 'fa fa-trash';
    $(event.currentTarget).parent().closest('td').next().find(':checkbox').removeAttr('disabled');
    Template.resourcesSelection.__helpers.get('setNeedContact')();
  }

});

