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
