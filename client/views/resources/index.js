Router.route('/resources', function() {
  this.subscribe('resources').wait();
  if (this.ready()) {
    this.render('resources');
  } else {
    this.render('Loading');
  }
});

var groupOrders = new ReactiveArray();

Tracker.autorun(function() {
  if (Session.get('clean') === 'true') {
    groupOrders.clear();
    if (typeof Filter !== 'undefined') {
      Filter.set('');
    }
    Session.set('clean', '');
  }
});

Template.resources.helpers({
  settings: function() {
    return {
      collection: 'resources',
      showFilter: true,
      filters: ['group'],
      fields: [
        {
          key: 'order',
          label: 'Order',
          fn: function(value, object) {
            return (_.contains(groupOrders.array(), object._id))?true:false;
          },
          tmpl: Template.orderResource
        }, {
          key: 'reference',
          label: 'Reference'
        }, {
          key: 'year',
          label: 'Year'
        },
        'subject',
        'title', {
          key: 'quantity',
          label: 'Quantity',
          tmpl: Template.resourceQuantity
        }, {
          key: 'computedOrders',
          sortOrder: 0,
          sortDirection: 'descending',
          label: 'Orders'
        }, {
          key: 'computedGroupOrders',
          label: 'Group Orders'
        },
        'editor',
        'group'
      ]
    }; 
  },
  isConfirm: function() {
    groupOrders.depend();
    return (groupOrders.length > 0)?true:false;
  }
});

Template.resources.onCreated(function () {
  Filter = new ReactiveTable.Filter('group', ['group']);
});

Template.resources.events({
  'click .reactive-table tr': function(event, template) {
    if (event.target.className === 'checkbox') {
      var resource = this;
      if (_.contains(groupOrders.array(), resource._id)) {
        var index = groupOrders.indexOf(resource._id);
        groupOrders.splice(index, 1);
      } else {
        groupOrders.push(resource._id);
      }

      if (groupOrders.length > 0) {
        if (Filter.get() === '') {
          Filter.set(resource.group);
        }
      } else {
        Filter.set('');
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

Template.confirmGroupOrder.helpers({
  methodArgs: function() {
    return [Filter.get(), groupOrders.array()]
  },
  onSuccess: function() {
    return function(result) {
      Router.go('/grouporder/' + result);
    }
  }
});

Template.resources.events({
  'click #update': function(event) {
    $(event.target)
      .data('working-text', 'Working...')
      .button('working')
      .prop('disabled', true);
     
    var inputsIds = [];
    $('input.form-control').parent().parent().each(function(){
      var id = $(this).attr('id');
      if (id) {
        inputsIds.push(id);
      }
    });
    
    _.each(inputsIds, function(id, index) {
      $('#' + id).submit();
    });
    $(event.target).button('reset').prop('disabled', false);;
  }
});

Template.resourceQuantity.helpers({
  isConfirm: function() {
    groupOrders.depend();
    return (groupOrders.length > 0)?true:false;
  }
});
