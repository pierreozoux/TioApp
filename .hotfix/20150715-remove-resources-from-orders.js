hotfix

id = 'y4EmXXu3NTpzyEiL3'
id = 'bLTDyPz8geLYow74v'
id = 'NWa2wARXKXinEAxYB'

order = Orders.findOne(id)
rightResources = order.resources().map(function(resource){return resource._id})
orderedResources = order.orderedResources

newOrderedResources = _.filter(orderedResources, function(resource) {
  return _.contains(rightResources, resource.resourceId)
})

Orders.update({
    _id: order._id
  }, {
    $set: {
      orderedResources: newOrderedResources
    }
  }
)

