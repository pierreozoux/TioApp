Router.route('/resources', function() {
  this.render('resources');
});

var groupOrders = new ReactiveArray();

Tracker.autorun(function() {
  if (Session.get('clean') === 'true') {
    groupOrders.clear();
    Session.set('clean', '');
  }
});

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
        }, {
          key: 'order',
          label: 'Year',
          fn: function(value, resource) {
            return resource.year();
          }
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
            return resource.orders();
          },
          sort: 'descending'
        }, {
          key: 'order',
          label: 'Group Orders',
          fn: function(value, resource) {
            return resource.groupOrders();
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
    var inputsIds = [];
    $('input.form-control').parent().parent().each(function(){
      var id = $(this).attr('id');
      if (id) {
        inputsIds.push(id);
      }
    });
    
    _.each(inputsIds, function(id, index) {
      if (inputsIds.length - 1 === index){
        AutoForm.addHooks(id, {
          onSuccess: function() {
            Meteor.call('markCompleted');
          }
        });
      }

      $('#' + id).submit();
    });
  }
});

Template.resourceQuantity.helpers({
  isConfirm: function() {
    groupOrders.depend();
    return (groupOrders.length > 0)?true:false;
  }
});

