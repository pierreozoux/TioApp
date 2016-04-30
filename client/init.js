if (Meteor.isClient) {
  Meteor.call('backgroundColor', function(e, color) {
    $('body').css('background-color', color);
  });
}
