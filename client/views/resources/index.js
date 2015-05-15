Router.route('/resources', function() {
  this.render('resources');
});

groupOrders = new ReactiveArray();

Template.resources.helpers({
  settings: function() {
    var order = this;
    return {
      collection: Resources.find(),
      fields: [
        {
          key: 'order',
          label: 'Order',
          fn: function(value, object) {
            if (_.contains(groupOrders.array(), object._id)) {
              return true;
            } else {
              return false;
            }
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
          fn: function(value, object) {
            return Orders.find({
              state: 'created',
              orderedResources: {
                $elemMatch: {
                  state: "ordered",
                  resourceId: object._id
                }
              }
            }).count();
          }
        },
        {
          key: 'order',
          label: 'Group Orders',
          fn: function() {
            return 5;
          }
        },
        'group'
      ]
    }; 
  },
  isConfirm: function() {
    groupOrders.depend();
    if (groupOrders.length > 0) {
      return true;
    } else {
      return false;
    }
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
        $(".reactive-table-input").val(resource.group).keyup();
      } else {
        $(".reactive-table-input").val('').keyup();
      }
    }
  }
});

Template.orderResource.helpers({
  isSelected: function() {
    var resource = this;
    groupOrders.depend();
    if (_.contains(groupOrders.array(), resource._id)) {
      return true;
    } else {
      return false;
    }
  }
});

Template.confirmGroupOrder.events({
  'click #confirm': function(event) {
    event.preventDefault();
    var group = Resources.findOne(groupOrders.array()[0]).group;
    var groupOrderId = GroupOrders.insert({
      group: group
    });

    var groupOrderedResources = [];
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
  'input input': function(event) {
    $(event.target).submit();
  }
})

