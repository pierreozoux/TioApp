Router.configure({
  layoutTemplate: 'applicationLayout'
});

Router.route('/', function () {
  this.render('index');
});

Router.route('/orders', function() {
  this.render('orders');
})
