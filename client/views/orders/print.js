Router.route('/print/order/:_id', function () {
  this.render('printOrder', {
    data: function () {
      return Orders.findOne({_id: this.params._id});
    }
  });
});

