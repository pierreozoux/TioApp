Template.contactSelection.helpers({
  contacts: function() {
    return Contacts.find().fetch().map(function(it){ return it.email; }).concat(Contacts.find().fetch().map(function(it){ return it.phone; }));
  },
  contact: function() {
    var contactId = Session.get('contactId');
    if (contactId) {
      return Contacts.findOne(contactId);
    }
  }
});

Template.contactSelection.onRendered(function () {
  Meteor.typeahead.inject();
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

AutoForm.hooks({
  insertContactForm: {
    onSuccess: function() {
      $('#newContact').modal('toggle');
      Session.set('contactId', this.docId);
      $('#contact-selector').val(Contacts.findOne(this.docId).phone);
    }
  }
});

