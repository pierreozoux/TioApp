Router.configure({
  layoutTemplate: 'applicationLayout'
});

Router.route('/', function () {
  this.subscribe('schools').wait();
  this.subscribe('courses').wait();
  this.subscribe('contacts').wait();
  this.subscribe('orders', this.params._id).wait();
  if (this.ready()) {
    this.render('index');
  } else {
    this.render('Loading');
  }
});

Router.route('/orders', function() {
  this.subscribe('contacts').wait();
  if (this.ready()) {
    this.render('orders', {
      data: this.params.query
    });
  } else {
    this.render('Loading');
  }
});

Router.route('/grouporders', function() {
  this.subscribe('groupOrders').wait();
  this.subscribe('groupOrderedResources').wait();
  if (this.ready()) {
    this.render('Grouporders');
  } else {
    this.render('Loading');
  }
});

Router.route('/settings', function() {
  this.subscribe('settings').wait();
  if (this.ready()) {
    this.render('Settings');
  } else {
    this.render('Loading');
  }
});
