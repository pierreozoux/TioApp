Template.contactSelection.helpers({
  contacts: function() {
    return Contacts.find().fetch().map(function(it){ return it.email; }).concat(Contacts.find().fetch().map(function(it){ return it.phone; }));
  },
  contact: function() {
    var contactId = Session.get('contactId');
    if (contactId) {
      return Contacts.findOne(contactId);
    }
  },
  selected: function(event, suggestion) {
    var contact;
    if (/[0-9]{9}/.test(suggestion.value)) {
      contact = Contacts.findOne({phone: suggestion.value});
    } else {
      contact = Contacts.findOne({email: suggestion.value});
    }
    if (contact) {
      Session.set('contactId', contact._id);
    }
  }
});

Template.contactSelection.onRendered(function () {
  Meteor.typeahead.inject();
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

