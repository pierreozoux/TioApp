Router.route('/contacts/download', function() {
  var user = '';
  log.info(this.request.cookies.meteor_login_token);
  if(this.request.cookies.meteor_login_token)
      user = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": Accounts._hashLoginToken(this.request.cookies.meteor_login_token)});
  if (user && Houston._user_is_admin(user._id)) {
    log.info(user);
    var data = [];
    var stateSupport;
    var contact;
    Orders.find().forEach(function(order) {
      contact = order.getContact();
      if (contact) {
        stateSupport = contact.stateSupport.toString();
      } else {
        stateSupport = '';
      }
      data.push({
        name: order.name,
        phone: order.phone,
        course: order.courseName,
        stateSupport: stateSupport
      });
    });
    this.response.writeHead(200, {
      'Content-type': 'text/csv',
      'Content-Disposition': "attachment; filename=contacts.csv"
    });
    this.response.end(CSV.unparse(data));
  }
}, {where: 'server'});

Router.route('/orders/download', function() {
  var user = '';
  log.info(this.request.cookies.meteor_login_token);
  if(this.request.cookies.meteor_login_token)
      user = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": Accounts._hashLoginToken(this.request.cookies.meteor_login_token)});
  if (user && Houston._user_is_admin(user._id)) {
    var startYear = moment().startOf('year').toDate();
    var startLastYear = moment().subtract(1, 'year').startOf('year').toDate();
    var pipeline = [
      { $match: { createdAt: { $lt: startYear, $gt: startLastYear } } },
      { $group: { _id: "$courseName", count:{ $sum:1 } } }
    ];
    var data = Orders.aggregate(pipeline);
    this.response.writeHead(200, {
      'Content-type': 'text/csv',
      'Content-Disposition': "attachment; filename=orders.csv"
    });
    this.response.end(CSV.unparse(data));
  }
}, {where: 'server'});

// Download name and phone from order list
Router.route('/phoneList/download', function() {
  var user = '';
  log.info(this.request.cookies.meteor_login_token);
  if(this.request.cookies.meteor_login_token)
    user = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": Accounts._hashLoginToken(this.request.cookies.meteor_login_token)});
  if (user && Houston._user_is_admin(user._id)) {
    var data = [];
    _.each(Meteor.call('phonesNameToContact'), function(m) {
      data.push({phone: m.phone, name: m.name});
    });
    this.response.writeHead(200, {
      'Content-type': 'text/csv',
      'Content-Disposition': "attachment; filename=phoneList.csv"
    });
    this.response.end(CSV.unparse(data));
  }
}, {where: 'server'});
