Template.orders.helpers({
  settings: function () {
    return {
      collection: Orders.find(),
      fields: [
        {key: 'humanId', label: 'Number'},
        'state',
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
        {
          key:'contactedAt',
          label: 'Contacted',
          fn: function(value) {
            if (value instanceof Date) {
              return moment(value).calendar();
            } else {
              return 'Never';
            }
          }
        },
        'courseName',
        'phone',
        {
          key: 'contactId',
          label: 'note',
          fn: function(value, object) {
            return object.getContact() && object.getContact().note;
          }
        },
        'name',
        {
          key: '_id',
          label: 'action',
          tmpl: Template.orderAction
        }
      ]
    };
  }
});

Template.orders.events({
  'click .reactive-table tr': function (event) {
    Router.go('/order/' + this._id);
  }
});


