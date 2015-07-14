Template.registerHelper('getSession',function(key){
  return Session.get(key) || null;
});

Tracker.autorun(function () {
  Meteor.call('isAdmin', Meteor.userId(), function(error, result){
    Session.set('isAdmin', result);
  });
});

if (!('contains' in String.prototype)) String.prototype.contains = function (str, startIndex) {
  return -1 !== String.prototype.indexOf.call(this, str, startIndex);
};

