Router.route('/order/:_id', function () {
  this.render('Order', {
    data: function () {
      return Orders.findOne({_id: this.params._id});
    }
  });
});

Template.Order.helpers({
  settings: function() {
    var order = this;
    return {
      collection: Resources.find(),
      showFilter: false,
      showNavigation: 'never',
      rowsPerPage: 100,
      rowClass: function(resource) {
        return order.cssClass(resource);
      },
      fields: [
        'subject',
        'title',
        {
          key: 'quantity',
          label: 'Quantity',
          fn: function(value, resource) {
            return resource.availability() + ' (' + resource.quantity + ' in stock)';
          }
        },
        {
          key: 'action',
          label: 'Action',
          tmpl: Template.orderResourceAction
        },
        {
          key: 'sold',
          label: 'Sold',
          tmpl: Template.orderResourceSold
        }
      ]
    }; 
  },
  resources: function () {
    return Resources.find();
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

Template.orderAction.events({
  'click .btn': function (event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.className.contains('Contact')) {
      this.contact();
    }
  }
});

Template.orderActionBar.events({
  'click #cancel': function() {
    Session.set('intent', 'cancel');
    $('#confirmAction').modal();
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
      return 'You are about to cancel this order.';
    } else {
      return 'You are about to finalize this order.';
    }
  }
});
