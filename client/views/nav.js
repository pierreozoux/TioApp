Template.nav.helpers({
  activeIfTemplateIs: function (template) {
    var currentRoute = Router.current();
    return currentRoute &&
      template === currentRoute.lookupTemplate() ? 'active' : '';
  }
});

Template.nav.events({
  'click .nav': function() {
    Session.set('schoolId', '');
    Session.set('courseId', '');
    Session.set('contactId', '');
    Session.set('needContact', false);
    Session.set('groupOrderId', '');
    Session.set('intent', '');
    Session.set('clean', 'true');
    Session.set('ready', false);
    Session.set('errorResult', '');
  }
});

