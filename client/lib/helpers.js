Template.registerHelper('getSession',function(key){
  return Session.get(key) || null;
});

Tracker.autorun(function () {
  Meteor.call('isAdmin', Meteor.userId(), function(error, result){
    Session.set('isAdmin', result);
  });
});

