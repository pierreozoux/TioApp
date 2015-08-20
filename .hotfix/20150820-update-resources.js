Meteor.subscribe('resources')
Resources.find().count()
Resources.find().forEach(function(resource){resource.updateOrders()})
Resources.find().forEach(function(resource){resource.updateGroupOrders()})

