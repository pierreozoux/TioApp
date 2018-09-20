Template.Grouporders.helpers({
  settings: function () {
    return {
      collection: GroupOrders.find(),
      fields: [
        'name',
        'group',
        {
          key:'createdAt',
          label: TAPi18n.__('Created'),
          fn: function(value) {
            if (value instanceof Date) {
              return moment(value).calendar();
            } else {
              return TAPi18n.__('Never');
            }
          }
        },
        'state',

      ]
    };
  }
});

Template.Grouporders.events({
  'click .reactive-table tr': function (event) {
    if (! $(event.target).hasClass('sortable')) {
      Router.go('/grouporder/' + this._id);
    }
  }
});
