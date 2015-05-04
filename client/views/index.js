Session.setDefault('courseName', '');
Session.setDefault('schoolName', '');
Session.setDefault('needContact', false);
Session.set('contactIdentifier', '');
Meteor.subscribe('schools');
Meteor.subscribe('courses');
Meteor.subscribe('contacts');

Template.index.onRendered(function() {
  Meteor.typeahead.inject();
  $('#school-selector').focus();
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
  'click #confirm': function () {
    var state;
    var orderedResources = [];
    var contactId = Session.get('contactId');
    var phone = contactId && Contacts.findOne(contactId).phone;
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
       phone: phone,
       courseId: Courses.findOne({name: Session.get('courseName')})._id
     });
     Router.go('/order/' + orderId);
   }

    Session.set('schoolName', '');
    $('#school-selector').val('');
    Session.set('courseName', '');
    $('#course-selector').val('');
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
  },
  'click input:checkbox': function() {
    Template.resourcesSelection.__helpers.get('setNeedContact')();
  }

});

Template.contactSelection.events({
  'keyup #contact-selector': function (event) {
     var value = $(event.target).val();
     var contact;
     if (/[0-9]{9}/.test(value)) {
       contact = Contacts.findOne({phone: value});
     } else {
       contact = Contacts.findOne({email: value});
     }
     if (contact) {
       Session.set('contactId', contact._id);
     }
  }
});

Template.registerHelper('getSession',function(key){
  return Session.get(key) || null;
});

AutoForm.hooks({
  insertContactForm: {
    onSuccess: function() {
      $('#newContact').modal('toggle');
      Session.set('contactId', this.docId);
      $('#contact-selector').val(Contacts.findOne(this.docId).phone);

    }
  }
});

