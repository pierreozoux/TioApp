Template.Grouporders.helpers({
  settings: function () {
    return {
      collection: GroupOrders.find(),
      fields: [
        'group',
        {
          key:'createdAt',
          label: 'Created',
          fn: function(value) {
            if (value instanceof Date) {
              return moment(value).calendar();
            } else {
              return 'Never';
            }
          }
        },
        'state'
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
