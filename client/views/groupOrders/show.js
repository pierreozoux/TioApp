Router.route('/grouporder/:_id', function () {
  this.render('GroupOrder', {
    data: function () {
      return GroupOrders.findOne({_id: this.params._id});
    }
  });
});

Template.GroupOrder.helpers({
  settings: function () {
    var groupOrder = this;
    return {
      collection: GroupOrderedResources.find(),
      showFilter: false,
      showNavigation: 'never',
      rowsPerPage: 100,
      fields: [{
        key: 'resourceId',
        label: 'Title',
        fn: function(value) {
          return Resources.findOne(value).title;
        }
      }, {
        key: 'resourceId',
        label: 'Reference',
        fn: function(value) {
          return Resources.findOne(value).reference;
        }
      }, {
        key: 'quantity',
        label: 'Quantity',
        sortByValue: true,
        tmpl: Template.quantity
      }, {
        key: 'received',
        label: 'Received',
        sortByValue: true,
        tmpl: Template.received
      }]
    };
  }
});

Template.GroupOrder.onRendered(function(){
  var self = this;
  self.autorun(function () {
    var data = Template.currentData(self.view);
    if (data) {
      Session.set('groupOrderId', data._id);
    }
  });
});

Template.quantity.helpers({
  idGenerated: function() {
    return "updateQuantity" + this._id;
  }
});

Template.GroupOrder.events({
  'input input': function(event) {
    $(event.target).submit();
  }
})

Template.received.helpers({
  idGenerated: function() {
    return "updateQuantity" + this._id;
  }
});

