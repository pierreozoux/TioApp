Resources = new Mongo.Collection('resources');

Resources.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  reference: {
    type: String,
    label: 'Reference',
    max: 200,
    unique: true,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  group: {
    type: String,
    label: 'Editor',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  editor: {
    type: String,
    label: 'Editor',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  quantity: {
    type: Number,
    label: 'Quantity',
    defaultValue: 0,
    optional: true
  },
  subject: {
    type: String,
    label: 'Subject',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  }
}));

Resources.helpers({
  // quantity - completed orders
  availability: function() {
    var resource = this;
    return resource.quantity - Orders.find({
      state: 'completed',
      orderedResources: {$elemMatch: {
        resourceId: resource._id,
        state: 'ordered'
      }}
    }).count();
  }
});

Resources.allow({
  update: function(userId) {
    return userId?true:false;
  }
});

