Router.configure({
  layoutTemplate: 'applicationLayout'
});

Router.route('/', function () {
  this.render('index');
});

Router.route('/orders/new/:_id', function() {
  this.render('newOrder', {
    data: function () {
      return Orders.findOne(this.params._id);
    }
  });
});
