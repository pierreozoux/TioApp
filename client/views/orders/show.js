Router.route('/order/:_id', function () {
  this.subscribe('orders', this.params._id).wait();
  this.subscribe('courses').wait();
  this.subscribe('contacts').wait();
  if (this.ready()) {
    this.render('Order', {
      data: function() {
        return Orders.findOne();
      }
    });
  } else {
    this.render('Loading');
  }
});

Template.Order.onCreated(function() {
  Meteor.subscribe('groupOrderedResources');
});


Template.Order.helpers({
  settings: function() {
    var order = this;
    return {
      collection: order.resources(),
      showFilter: false,
      showNavigation: 'never',
      rowsPerPage: 100,
      rowClass: function(resource) {
        return order.cssClass(resource);
      },
      fields: [
        {
          key: 'subject',
          label: TAPi18n.__('Subject')
        }, {
          key: 'title',
          label: TAPi18n.__('Title')
        }, {
          key: 'editor',
          label: TAPi18n.__('Editor')
        }, {
          key: 'price',
          label: TAPi18n.__('Price')
        },{
          key: 'availability',
          label: TAPi18n.__('Availability'),
          fn: function(value, resource) {
            return resource.computedAvailability + ' (' + resource.quantity + ' ' + TAPi18n.__('in stock') + ')';
          }
        },
        //   {
        //   key: 'subject',
        //   label: TAPi18n.__('Received (total)'),
        //   fn: function(value, resource) {
        //     var totalReceived = 0;
        //     var orderGroupResources = GroupOrderedResources.find({resourceId: resource._id});
        //     orderGroupResources.forEach(function (el) {
        //       totalReceived = totalReceived + el.received;
        //     });
        //     console.log('number of Group orders: ' + orderGroupResources.count() + ' for resourceID '+ resource._id);
        //     return totalReceived;
        //   }
        // }, {
        //   key: 'subject',
        //   label: TAPi18n.__('Ordered (total)'),
        //   fn: function(value, resource) {
        //     var totalReceived = 0;
        //     var orderGroupResources = GroupOrderedResources.find({resourceId: resource._id});
        //     orderGroupResources.forEach(function (el) {
        //       totalReceived = totalReceived + el.quantity;
        //     });
        //     console.log('number of Group orders: ' + orderGroupResources.count() + ' for resourceID '+ resource._id);
        //     return totalReceived;
        //   }
        // },
          {
          key: 'action',
          label: TAPi18n.__('Action'),
          tmpl: Template.orderResourceAction
        }, {
          key: 'sold',
          label: TAPi18n.__('Sold'),
          tmpl: Template.orderResourceSold
        }
      ]
    }; 
  }
});

Template.Order.events({
  'click .reactive-table tr': function (event) {
    event.preventDefault();
    var resource = this;
    var order = Template.currentData();
    // checks if the actual clicked element has the class `delete`
    switch (event.target.className) {
      case 'fa fa-trash': order.remove(resource); break;
      case 'fa fa-cart-plus': order.add(resource); break;
      case 'sold checkbox': order.sell(resource); break;
    }
  }
});

Template.Order.onRendered(function(){
  var self = this;
  self.autorun(function () {
    var data = Template.currentData(self.view);
    if (data) {
      Session.set('courseId', data.getCourse()._id);
    }
  });
});

Template.orderResourceSold.onRendered(function() {
  if (!this.rendered){
    // Disable the already sold resources
    $('input.sold:checked').attr('disabled', true);
    this.rendered = true;
  }
});

Template.orderResourceAction.helpers({
  icon: function () {
    var resource = this;
    var order = Template.parentData(5);
    if(order.ordered(resource)) {
      if (order.isSold(resource) || order.definitiveState()) {
        return '';
      } else {
        return 'fa-trash';
      }
    } else {
      return 'fa-cart-plus';
    }
  }
});
 
Template.orderResourceSold.helpers({
  isSold: function () {
    var resource = this;
    var order = Template.parentData(5);
    return order.isSold(resource); 
  },
  disabled: function () {
    var resource = this;
    var order = Template.parentData(5);
    return order.cssClass(resource);
  }
});

Template.orderAction.helpers({
  action: function() {
    switch (this.state) {
      case 'created': return TAPi18n.__('Print');
      case 'completed': return TAPi18n.__('Contact');
      // case 'contacted': return TAPi18n.__('Print');
    }
  }
});
Template.orderAction.events({
  'click .btn': function (event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.className.contains('Contact')) {
      Meteor.call('contact',this);
    } else if (event.target.className.contains('Print')) {
      Router.go('/print/order/' + this._id);
    }
  }
});

Template.orderActionBar.events({
  'click #cancel': function() {
    Session.set('intent', 'cancel');
    $('#confirmAction').modal();
  }
});

Template.sellOrder.events({
  'click #sell': function () {
    var order = this;
    order.sellAll();
  }
});

Template.confirmAction.events({
  'click #confirm': function () {
    var intent = Session.get('intent');
    var order = this;
    if (intent === 'cancel') {
      Orders.update(order._id, {
        $set: {
          state: 'canceled'
        }
      });
    } else if (intent === 'sellLastResource') {
      order.sell(Resources.findOne(Session.get('lastResourceId')), true);
    } else if (intent === 'sellAll') {
      order.sellAll(true);
    } else {
      order.remove(Resources.findOne(Session.get('lastResourceId')), true);
    }
    $('#confirmAction').modal('hide');
  }
});

Template.confirmAction.helpers({
  content: function() {
    var intent = Session.get('intent');
    if (intent === 'cancel') {
      return TAPi18n.__('You are about to cancel this order.');
    } else {
      return TAPi18n.__('You are about to finalize this order.');
    }
  }
});
