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
  index = keys.indexOf('Price');
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
  },
  phonesNameToContact: function() {
	  var startYear = moment().startOf('year').toDate();
	  var distinctPhone = [];
	  var distinctOrders = [];
	  var lastYearOrderList = Orders.find({
	    courseName: {$regex: /^((?!-12).)*$/m},
	  }, {
	    fields: {phone: 1, name: 1},
	    sort: {'name': 1}
	  });
	  lastYearOrderList.forEach (function(order){
		  if (distinctPhone.indexOf(order.phone) == -1 && order.phone && order.phone.substring(0,1) != '2') {
			  distinctPhone.push(order.phone);
			  distinctOrders.push(order);
		  }
	  });
	  return distinctOrders;
  },
});

Meteor.startup(function() {
  if (Settings.find().count() === 0) {
    Settings.insert({
      key: 'allow-sign-up',
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
  process.env.MAIL_URL = 'smtp://tioapp%40lino-design.com:wrYtPAIjNHs8tqmntd9y@smtp.phpnet.org:587';
});

Accounts.validateNewUser(function () {
  if (Settings.findOne({key: 'allow-sign-up'}).value === 'true') {
    return true;
  }
  throw new Meteor.Error(403, 'User sign up is not authorized.');
});
