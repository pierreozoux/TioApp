Router.route('/resources', function() {
  this.render('resources');
});

var groupOrders = new ReactiveArray();

Template.resources.helpers({
  settings: function() {
    return {
      collection: Resources.find(),
      fields: [
        {
          key: 'order',
          label: 'Order',
          fn: function(value, object) {
            return (_.contains(groupOrders.array(), object._id))?true:false;
          },
          tmpl: Template.orderResource
        },
        {
          key: 'reference',
          label: 'Reference',
          sort: true
        },
        'subject',
        'title', {
          key: 'quantity',
          label: 'Quantity',
          sortByValue: true,
          tmpl: Template.resourceQuantity
        }, {
          key: 'order',
          label: 'Orders',
          fn: function(value, resource) {
            return Orders.find({
              state: {$in: ['created','completed']},
              orderedResources: {
                $elemMatch: {
                  state: 'ordered',
                  resourceId: resource._id
                }
              }
            }).count();
          }
        },
        {
          key: 'order',
          label: 'Group Orders',
          fn: function(value, resource) {
            return _.reduce(GroupOrderedResources.find({
              state: 'ordered',
              resourceId: resource._id
            }).fetch(), function(memo, groupOrderedResource){
              return memo + groupOrderedResource.quantity - groupOrderedResource.received;
            }, 0);
          }
        },
        'group'
      ]
    }; 
  },
  isConfirm: function() {
    groupOrders.depend();
    return (groupOrders.length > 0)?true:false;
  }
});

Template.resources.events({
  'click .reactive-table tr': function(event) {
    if (event.target.className === 'checkbox') {
      var resource = this;
      if (_.contains(groupOrders.array(), resource._id)) {
        var index = groupOrders.indexOf(resource._id);
        groupOrders.splice(index, 1);
      } else {
        groupOrders.push(resource._id);
      }

      if (groupOrders.length > 0) {
        $('.reactive-table-input').val(resource.group).keyup();
      } else {
        $('.reactive-table-input').val('').keyup();
      }
    }
  }
});

Template.orderResource.helpers({
  isSelected: function() {
    var resource = this;
    groupOrders.depend();
    return (_.contains(groupOrders.array(), resource._id))?true:false;
  }
});

Template.confirmGroupOrder.events({
  'click #confirm': function(event) {
    event.preventDefault();
    var group = Resources.findOne(groupOrders.array()[0]).group;
    var groupOrderId = GroupOrders.insert({
      group: group
    });

    _.each(groupOrders.array(), function(resourceId) {
      GroupOrderedResources.insert({
        groupOrderId: groupOrderId,
        resourceId: resourceId
      });
    });
    
    Router.go('/grouporder/' + groupOrderId);
  }
});

Template.resources.events({
  'click #update': function() {
    // if valid
    $('input.form-control').submit();
    Meteor.call('markCompleted');
  }
});

Template.resourceQuantity.helpers({
  isConfirm: function() {
    groupOrders.depend();
    return (groupOrders.length > 0)?true:false;
  }
});

