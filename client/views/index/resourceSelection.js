Template.resourcesSelection.helpers({
  resources: function() {
    if (Session.get('courseName')) {
      return Resources.find({});
    }
  },
  isSellable: function() {
    Template.resourcesSelection.__helpers.get('setNeedContact')();
    return this.quantity>0?true:false;
  },
  setNeedContact: function() {
    var needContact = false;
    Resources.find().forEach( function(resource) {
      var inCart = $('#' + resource._id).attr('class') !== 'disabled';
      var sold = $('#' + resource._id).find(':checkbox').prop('checked');
      if (inCart && !sold) { 
        needContact = true;
      }
    });
    Session.set('needContact', needContact);
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

