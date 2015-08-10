Template.Settings.helpers({
  settings: function() {
    return Settings.find();
  },
  makeUniqueID: function () {
    return 'update-' + this._id;
  }
});

Template.settingsActionBar.events({
  'click #markCompleted': function () {
    Meteor.call('markCompleted');
  }
});
 
