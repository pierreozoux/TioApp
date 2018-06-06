Meteor.publish('contacts', function () {
  if (this.userId) {
    return Contacts.find();
  }
});

Meteor.publish('courses', function () {
  if (this.userId) {
    return Courses.find();
  }
});

Meteor.publish('groupOrders', function () {
  if (this.userId) {
    return GroupOrders.find({state: {$ne: 'received'}});
  }
});

Meteor.publish('groupOrderedResources', function () {
  if (this.userId) {
    return GroupOrderedResources.find();
  }
});

Meteor.publish('orders', function (id) {
  if (this.userId) {
    return Orders.find({_id: id});
  }
});

Meteor.publish('completed-orders', function () {
  if (this.userId) {
    return Orders.find({state: 'completed'});
  }
});

Meteor.publish('resources-home', function (objectId) {
  if (this.userId && objectId) {
    var resources = Courses.findOne(objectId).resources;
    if (resources !== 'undefined' && resources !== null) {
      console.log('resources-home - resources : ' + resources);
      return cursor = Resources.find({_id: { $in:  resources}});
    } else {
      return this.ready();
    }
  }
  return this.ready();
});

Meteor.publish('resources-grouporder', function (objectId) {
  if (this.userId && objectId) {
    var resources = GroupOrders.findOne(objectId).resources()
    return cursor = Resources.find({_id: { $in:  resources}});
  }
  return this.ready();
});

Meteor.publish('resources', function (objectId, type) {
  if (this.userId) {
    // if (type === 'course') {
    //   var resources = Courses.findOne(objectId).resources;
    // } else if (type === 'groupOrder') {
    //   var resources = GroupOrders.findOne(objectId).resources()
    // }
    // if (type) {
    //   return cursor = Resources.find({_id: { $in:  resources}});
    // } else {
    //   return cursor = Resources.find();
    // }
    return cursor = Resources.find();
  }
  return this.ready();
});

Meteor.publish('settings', function () {
  if (Houston._user_is_admin(this.userId)) {
    return Settings.find();
  }
});

Meteor.publish('schools', function () {
  if (this.userId) {
    return Schools.find();
  }
});
