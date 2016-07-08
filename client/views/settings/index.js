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
    var remaining = 160 - event.target.value.length;
    $('#char_count').text(remaining + TAPi18n.__(' chars remaining.'));
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
