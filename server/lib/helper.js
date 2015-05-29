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
      from: 'test@example.org',
      subject: subject,
      text: text
    });
  },
  isAdmin: function(userId) {
    return Houston._user_is_admin(userId)?true:false;
  }
});

