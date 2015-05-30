Settings = new Mongo.Collection('settings');

Settings.attachSchema(new SimpleSchema({
  key: {
    type: String,
    label: 'Key'
  },
  value: {
    type: String,
    label: 'Value'
  }
}));

Settings.allow({
  insert: function(userId) {
    return Houston._user_is_admin(userId)?true:false;
  },
  update: function(userId) {
    return Houston._user_is_admin(userId)?true:false;
  }
});

