Template.grouporders.helpers({
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

Template.grouporders.events({
  'click .reactive-table tr': function (event) {
    Router.go('/grouporder/' + this._id);
  }
});

