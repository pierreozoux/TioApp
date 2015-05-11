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
        'quantity',
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
      case 'checkbox': order.sell(resource); break;
    }
  }
});


Template.Order.onRendered(function(){
  var self = this;
  self.autorun(function () {
    var data = Template.currentData(self.view);
    if (data) {
      Meteor.subscribe('resources', data.getCourse()._id);
    }
  });
});

Template.orderResourceAction.helpers({
  icon: function () {
    var resource = this;
    var order = Template.parentData(5);
    if(order.ordered(resource)) {
      if (order.isSold(resource)) {
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

