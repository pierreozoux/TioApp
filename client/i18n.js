if (Meteor.isClient) {
  Meteor.startup(function () {
    Session.set('showLoadingIndicator', true);

    TAPi18n.setLanguage('pt')
      .done(function () {
        Session.set('showLoadingIndicator', false);
      })
      .fail(function (error_message) {
        console.log(error_message);
      });
  });
}
