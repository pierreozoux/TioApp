Contacts = new Mongo.Collection('contacts');

Contacts.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    max: 200
  },
  phone: {
    type: String,
    label: 'Phone',
    unique: true,
    regEx: /^[0-9]{9}$/
  },
  note: {
    type: String,
    label: 'Note',
    optional: true
  },
  email: {
    type: String,
    label: 'Email',
    max: 200,
    optional: true,
    regEx: SimpleSchema.RegEx.Email,
    custom: function() {
      if(_.isString(this.value) && Contacts.find({email: this.value}).count() > 0) {
        return 'uniqueEmail';
      } else {
        return true;
      }
    }
  },
  stateSupport: {
    type: Boolean,
    label: 'State Support'
  }
}));

Contacts.allow({
  insert: function(userId) {
    return userId?true:false;
  },
  update: function(userId) {
    return userId?true:false;
  }
});


