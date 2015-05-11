Meteor.methods({
  updateOrderedResourceState: function(order, resource, state) {
    var orderState = order.state;
    if (!order.containsOrdered()) {
      orderState = 'sold';
    }

    Orders.update({
      _id: order._id,
      'orderedResources.resourceId': resource._id
    }, {
      $set : {
        'orderedResources.$.state': state,
        state: orderState
      }
    });
  }
});

