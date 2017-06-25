Template.Settings.helpers({
  settings: function() {
    return Settings.find();
  },
  makeUniqueID: function () {
    return 'update-' + this._id;
  }
});

Template.sendSMS.events({
  'keyup #sms': function (event, template) {
    // Count remaining characters
    var remaining = 160 - event.target.value.length;
    $('#char_count').text(remaining + TAPi18n.__(' chars remaining.'));

    // Save sms content to be able to send it as argument
    template.currentMsg = event.target.value;

    // Display or not send button
    if(event.target.value) {
      Session.set('smstext', 'yes')
    } else {
      Session.set('smstext', '')
    }
  },
  'click input': function(event, template) {
    if ($(event.target).attr('id') == 'smsStateSupport') {
      var isStateSupport = $(event.target).is(":checked");
      Meteor.call('targetPeopleSms', { isStateSupport: isStateSupport}, function (err, asyncValue) {
        if (err)
          console.log(err);
        else
          template.targetedPeople.set(asyncValue);
          template.priceTotal.set(asyncValue * 0.05);
      });
    }
  },
  'click .sendSms': function (event, template) {
    $(event.target)
      .data('working-text', 'Working...')
      .button('working')
      .prop('disabled', true);


    Meteor.call('sendSMSAll', {txtSms: $('#sms').val(), stateSupport: $('#smsStateSupport').is(":checked")}, function(error, result) {
      $(event.target).button('reset').prop('disabled', false);
      if (error) {
        $('#error-modal').modal();
        console.log(error)
        Session.set('call-button-error', error.message)
      } else {
        $('.result-msg').html('Sms added to sending queue !');
      }
    });
  }

});

Template.sendSMS.helpers({
  targetedPeople:function() {
    return Template.instance().targetedPeople.get();
  },
  priceTotal:function() {
    return Template.instance().priceTotal.get();
  },
  currentMsg:function() {
    return Template.instance().currentMsg.get();
  },
})
Template.sendSMS.created = function (){
  var self = this;
  self.targetedPeople = new ReactiveVar("Waiting for response from server...");
  self.priceTotal = new ReactiveVar("Waiting for response from server...");
  self.currentMsg = new ReactiveVar("Waiting for response from server...");
  Meteor.call('targetPeopleSms', { isStateSupport: false} ,function (err, asyncValue) {
    if (err)
      console.log(err);
    else
      self.targetedPeople.set(asyncValue);
      self.priceTotal.set(asyncValue * 0.05);
  });
}

