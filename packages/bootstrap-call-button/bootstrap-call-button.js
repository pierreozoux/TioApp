Template.callButton.events({
  'click .call-button': function (event, template) {
    $(event.target)
      .data('working-text', 'Working...')
      .button('working')
      .prop('disabled', true);
    if (typeof template.data.buttonMethodArgs === 'string' || template.data.buttonMethodArgs instanceof String) {
      if(template.data.buttonMethodArgs.match(/\(\)$/)) {
        args = [eval(template.data.buttonMethodArgs)];
      } else {
        args = template.data.buttonMethodArgs;
      }
    } else {
      args = template.data.buttonMethodArgs;
    }

    Meteor.apply(template.data.buttonMethod, args, function(error, result) {
      $(event.target).button('reset').prop('disabled', false);
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
