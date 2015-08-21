Template.callButton.events({
  'click .call-button': function (event, template) {
    $(event.target)
      .data('working-text', 'Working...')
      .button('working')
      .prop('disabled', true);
    Meteor.apply(template.data.buttonMethod, template.data.buttonMethodArgs, function(error, result) {
      $(event.target).button('reset').prop('disabled', false);;
      if (error) {
        $('#error-modal').modal();
        console.log(error)
        Session.set('call-button-error', error.message)
      } else {
        if (typeof template.data.buttonOnSuccess === "function") {
          template.data.buttonOnSuccess(result);
        }
      }
    });
  }
});

Template.callButton.helpers({
  style: function() {
    return this.buttonStyle?this.buttonStyle:'success'
  }
});

