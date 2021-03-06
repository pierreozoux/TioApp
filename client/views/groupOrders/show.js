Router.route('/grouporder/:_id', function () {
  this.subscribe('groupOrders').wait();
  this.subscribe('groupOrderedResources').wait();
  this.subscribe('courses').wait();
  if (this.ready()) {
    this.render('GroupOrder', {
      data: function () {
        return GroupOrders.findOne({_id: this.params._id});
      }
    });
  } else {
    this.render('Loading');
  }
});

Template.GroupOrder.onCreated(function() {
  this.autorun(() => {
    this.subscribe('resources', Session.get('groupOrderId'), 'groupOrder');
  });
});

Template.GroupOrder.helpers({
  settings: function () {
    var groupOrder = this;
    return {
      collection: GroupOrderedResources.find({groupOrderId: groupOrder._id, state: 'ordered'}),
      showFilter: false,
      showNavigation: 'never',
      rowsPerPage: 1000,
      fields: [{
        key: 'resourceId',
        label: TAPi18n.__('Title'),
        fn: function(value) {
          return Resources.findOne(value).title;
        }
      }, {
        key: 'resourceId',
        label: TAPi18n.__('Reference'),
        fn: function(value) {
          return Resources.findOne(value).reference;
        }
      }, {
        key: 'quantity',
        label: TAPi18n.__('Quantity'),
        sortByValue: true,
        tmpl: Template.quantity
      }, {
        key: 'resourceId',
        label: TAPi18n.__('Year'),
        fn: function(value) {
          return parseInt(Resources.findOne(value).year);
        }
      }, {
        key: 'received',
        label: TAPi18n.__('Received'),
        sortByValue: true,
        tmpl: Template.received
      }]
    };
  },
  received: function() {
    return (this.state === 'received')?true:false;
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

Template.GroupOrder.events({
  'click #update': function(event) {
    $(event.target)
      .data('working-text', TAPi18n.__('Working...'))
      .button('working')
      .prop('disabled', true);
    Session.set('errorResult', '');
    
    var groupOrder = this;
    var valid = true;
    // valid?
    GroupOrderedResources.find({groupOrderId: groupOrder._id}).forEach(function(groupOrderedResource){
      if(groupOrderedResource.state === 'ordered') {
        var quantity = parseInt($('#quantity' + groupOrderedResource.resourceId).val(), 10);
        var received = parseInt($('#received' + groupOrderedResource.resourceId).val(), 10);
        if (quantity < received) {
          valid = false;
        }
      }
    });

    if (valid) {
      var isReceived = true;
      GroupOrderedResources.find({groupOrderId: groupOrder._id}).forEach(function(groupOrderedResource){
        var state = groupOrderedResource.state;
        if (state === 'ordered') {
          var quantity = parseInt($('#quantity' + groupOrderedResource.resourceId).val(), 10);
          var received = parseInt($('#received' + groupOrderedResource.resourceId).val(), 10);
          if (quantity === received) {
            state = 'received';
          } else {
            isReceived = false;
          }
          GroupOrderedResources.update(groupOrderedResource._id, {$set: {
            state: state,
            quantity: quantity,
            received: received
          }}, function(error){
            if (error) {
              isReceived = false;
              console.log(error);
              Session.set('errorResult', error.message);
            }
          });
        }
      });
      if (isReceived) {
        GroupOrders.update(groupOrder._id, {$set: {
          state: 'received'
        }}, function(error){
            if(error) {
              console.log(error);
              Session.set('errorResult', error.message);
            }
        });
      }
    } else {
      Session.set('errorResult', TAPi18n.__('Quantity must be superior or equal to received.'));
    }
    $(event.target).button('reset').prop('disabled', false);;
  }
});
