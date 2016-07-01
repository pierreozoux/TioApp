Template.Settings.helpers({
  settings: function() {
    return Settings.find();
  },
  makeUniqueID: function () {
    return 'update-' + this._id;
  }
});

Template.sendSMS.events({
  'keyup #sms': function (event) {
    if(event.target.value) {
      Session.set('smstext', 'yes')
    } else {
      Session.set('smstext', '')
    }
  }
});

Meteor.call('priceSMSs', function(error, result){
  Session.set('price', result);
});
