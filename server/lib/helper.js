log = new Logger('server');

schoolNames = function (csvLine) {
  var keys = Object.keys(csvLine);
  var index = keys.indexOf('Title');
  keys.splice(index, 1);
  index = keys.indexOf('Reference');
  keys.splice(index, 1);
  index = keys.indexOf('Editor');
  keys.splice(index, 1);
  index = keys.indexOf('Subject');
  keys.splice(index, 1);
  index = keys.indexOf('Year');
  keys.splice(index, 1);
  index = keys.indexOf('Group');
  keys.splice(index, 1);

  return keys;
};

Meteor.methods({
  sendEmail: function (to, subject, text) {
    check([to, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: Settings.findOne({key: 'from-email'}).value,
      replyTo: Settings.findOne({key: 'reply-to-email'}).value,
      subject: subject,
      text: text
    });
  },
  isAdmin: function(userId) {
    return Houston._user_is_admin(userId)?true:false;
  }
});

Meteor.startup(function() {
  if (Settings.find().count() === 0) {
    Settings.insert({
      key: 'allow-sign-in',
      value: 'true'
    });

    Settings.insert({
      key: 'from-email',
      value: 'noreply@example.org'
    });

    Settings.insert({
      key: 'reply-to-email',
      value: 'noreply@example.org'
    });
  }
});

