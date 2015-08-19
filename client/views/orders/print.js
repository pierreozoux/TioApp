Router.route('/print/order/:_id', function () {
  this.subscribe('orders', this.params._id).wait();
  this.subscribe('settings').wait();
  if (this.ready()) {
    this.render('printOrder', {
      data: function () {
        return Orders.findOne({_id: this.params._id});
      }
    });
  } else {
    this.render('Loading');
  }
});


Template.printOrder.helpers({
  library: function() {
    return Settings.findOne({key: 'library'}).value;
  }
});

