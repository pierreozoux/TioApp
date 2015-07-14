function resources() {
  var course = Courses.findOne(Session.get('courseId'));
  if (course) {
    return Resources.find({_id: {$in: course.resources}});
  }
}

Template.resourcesSelection.helpers({
  resources: function() {
    return resources();
  },
  isSellable: function() {
    Template.resourcesSelection.__helpers.get('setNeedContact')();
    return this.availability()>0?true:false;
  },
  setNeedContact: function() {
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
    Session.set('schoolId', '');
  }
});

