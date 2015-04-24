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
  },
  'click .btn': function () {
    var orderId = new Mongo.ObjectID();
    Resources.find().forEach( function(resource) {
      var sold = $('#' + resource._id).find(':checkbox').prop('checked');
      var inCart = $('#' + resource._id).attr('class') !== 'disabled';
      if (sold) {
        console.log(resource + 'sold');
        Orders.upsert({_id: orderId},{
          $addToSet: {
            orderedResources: {
              state: 'sold',
              resourceId: resource._id
            }
          }
        });
        Resources.update({_id: resource._id}, {$inc: {quantity: -1}});
      }
      if (inCart && !sold) {
        console.log(resource + 'inCart and not sold');
        Orders.upsert({_id: orderId},{
          $addToSet: {
            orderedResources: {
              state: 'ordered',
              resourceId: resource._id
            }
          }
        });
      }
    });
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
  },
  'click .fa-cart-plus': function(event) {
    event.currentTarget.closest('tr').className = '';
    event.currentTarget.className = 'fa fa-trash';
    $(event.currentTarget).parent().closest('td').next().find(':checkbox').removeAttr('disabled');
  }

});

