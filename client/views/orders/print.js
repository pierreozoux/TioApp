Router.route('/print/order/:_id', function () {
  this.render('printOrder', {
    data: function () {
      return Orders.findOne({_id: this.params._id});
    }
  });
});

Template.printOrder.helpers({
  library: function() {
    return Settings.findOne({key: 'library'}).value;
  }
});

