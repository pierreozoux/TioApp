function resources() {
  console.log('function resources() - courseId = ' + Session.get('courseId') + 'Nb ressources = ' + Resources.find().count());
  return Resources.find({}, {sort: {'subject': 1}});
}

Template.resourcesSelection.onCreated(function() {
  console.log('onCreated');
  this.autorun(() => {
    this.subscribe('resources-home', Session.get('courseId'));
  });
});

Template.resourcesSelection.helpers({
  resources: function() {
    console.log('helpers.resources');
    return resources();
  },
  isSellable: function() {
    console.log('helpers.isSellable');
    Template.resourcesSelection.__helpers.get('setNeedContact')();
    if (this.computedAvailability > 0 || this.quantity > 2) {
      return true
    } else {
      return false
    }
  },
  setNeedContact: function() {
    console.log('helpers.setNeedContact');
    var needContact = false;
    resources().forEach( function(resource) {
      var inCart = $('#' + resource._id).attr('class') !== 'disabled';
      var sold = $('#' + resource._id).find(':checkbox').prop('checked');
      if (inCart && !sold) { 
        needContact = true;
      }
    });
    Session.set('needContact', needContact);
  },
  printResources: function() {
    return (Session.get('courseId'))?true:false;
  }
});

Template.resourcesSelection.events({
  'click .fa-trash': function(event) {
    event.currentTarget.closest('tr').className = 'disabled';
    event.currentTarget.className = 'fa fa-cart-plus';
    $(event.currentTarget).parent().closest('td').next().find(':checkbox').prop('disabled', true);
    Template.resourcesSelection.__helpers.get('setNeedContact')();
  },
  'click .fa-cart-plus': function(event) {
    event.currentTarget.closest('tr').className = '';
    event.currentTarget.className = 'fa fa-trash';
    $(event.currentTarget).parent().closest('td').next().find(':checkbox').removeAttr('disabled');
    Template.resourcesSelection.__helpers.get('setNeedContact')();
  },
  'click input:checkbox': function() {
    Template.resourcesSelection.__helpers.get('setNeedContact')();
  },
  'click #unselectAll': function() {
    $('input:checkbox').removeAttr('checked');
    Template.resourcesSelection.__helpers.get('setNeedContact')();
  }
});

Template.confirmation.events({
  'click #confirm': function () {
    var state;
    var orderedResources = [];
    var contactId = Session.get('contactId');
    var humanId = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for( var i=0; i < 5; i+=1 ) {
      humanId += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    resources().forEach( function(resource) {
      var inCart = $('#' + resource._id).attr('class') !== 'disabled';
      var sold = $('#' + resource._id).find(':checkbox').prop('checked');
      if (inCart) { 
        if (sold) {
          state = 'sold';
          Resources.update(resource._id, {$inc: {quantity: -1}});
        } else {
          state = 'ordered';
        }
        orderedResources.push({
          state: state,
          resourceId: resource._id
        });
      }
    });

    if (orderedResources.length) {
      var orderId = Orders.insert({
        contactId: contactId,
        orderedResources: orderedResources,
        humanId: humanId,
        courseId: Session.get('courseId')
      });
      Session.set('schoolId', '');
      Router.go('/order/' + orderId);
    }

    // Update Ressources Orders

    Session.set('schoolId', '');
  }
});

Template.contactSelection.onRendered(function() {
  Template.resourcesSelection.__helpers.get('setNeedContact')();
})
