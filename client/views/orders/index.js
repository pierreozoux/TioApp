Template.orders.helpers({
  settings: function () {
    return {
      collection: 'orders',
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
        }, {
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
    if (! $(event.target).hasClass('sortable')) {
      Router.go('/order/' + this._id);
    }
  }
});

Template.ordersActionBar.events({
  'click #contactAndPrint': function (event, template) {
    $(event.target)
      .data('working-text', 'Working...')
      .button('working')
      .prop('disabled', true);
    template.subscribe('completed-orders', function() {
      console.log('CSV export beginning...');
      var data = [];
      var emailCount = 0;
      var modalText = '';
      var orders = Orders.find();
      var emailText = 'Bom dia\n\n' +
        'Informamos que a sua encomenda se encontra pronta para ser levantada na Livraria Tio Papel.\n\n' +
        'Lembramos tambem que podera plastificar os seus livros por apenas 1,25euro ' +
        'cada e que tem ainda direito a 10% de desconto na compra de material escolar.\n\n' +
        'Ficamos a aguardar a sua visita.';

      if (orders.count() > 0) {
        orders.forEach(function(order) {
          var contact = order.getContact();
          if (contact.email) {
            console.log('Email send to: ' + contact.email);
            Meteor.call('sendEmail',
              contact.email,
              'TioPapel encomenda',
              emailText
            );
            emailCount += 1;
          } else {
            data.push({
              reference: order.humanId,
              createdAt: moment(order.createdAt).calendar(),
              courseName: order.courseName,
              name: contact.name,
              note: contact.note,
              phone: contact.phone
            });
          }
          Meteor.call('contact', order);
        });

        if (emailCount > 0) {
          modalText += emailCount + ' emails sent.';
        } else {
          modalText += 'No emails sent.';
        }

        var blob = new Blob([CSV.unparse(data)], {type: 'text/csv;charset=utf-8'});
        saveAs(blob, 'orders_to_contact.csv');
      } else {
        modalText = 'Nobody to contact! ';
      }

      Session.set('modalText', modalText);
      $('#contactAndPrintModal').modal();
    });
    $(event.target).button('reset').prop('disabled', false);;
  }
});
