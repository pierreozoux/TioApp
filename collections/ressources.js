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
      state: {$in: ['completed', 'contacted']},
      orderedResources: {$elemMatch: {
        resourceId: resource._id,
        state: 'ordered'
      }}
    }).count();
  },
  orders: function() {
    var resource = this;
    return Orders.find({
      state: {$in: ['created','completed', 'contacted']},
      orderedResources: {
        $elemMatch: {
          state: 'ordered',
          resourceId: resource._id
        }
      }
    }).count();
  },
  groupOrders: function() {
    var resource = this;
    return _.reduce(GroupOrderedResources.find({
      state: 'ordered',
      resourceId: resource._id
    }).fetch(), function(memo, groupOrderedResource){
      return memo + groupOrderedResource.quantity - groupOrderedResource.received;
    }, 0);
  },
  year: function() {
    var resource = this;
    var course = Courses.findOne({resources: resource._id});
    if(course) {
      return course.year;
    }
  }
});

Resources.allow({
  update: function(userId) {
    return userId?true:false;
  }
});

