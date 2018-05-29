Template.orders.helpers({
  settings: function () {
    return {
      showFilter: true,
      collection: 'orders',
      fields: [
        {
          key: 'humanId',
          label: TAPi18n.__('Number')
        }, {
          key: 'state',
          label: TAPi18n.__('State')
        }, {
          key:'createdAt',
          label: TAPi18n.__('Created'),
          fn: function(value) {
            if (value instanceof Date) {
              return moment(value).calendar();
            } else {
              return TAPi18n.__('Never');
            }
          }
        }, {
          key:'contactedAt',
          label: TAPi18n.__('Contacted'),
          fn: function(value) {
            if (value instanceof Date) {
              return moment(value).calendar();
            } else {
              return TAPi18n.__('Never');
            }
          }
        }, {
          key: 'courseName',
          label: TAPi18n.__('courseName')
        }, {
          key: 'phone',
          label: TAPi18n.__('Phone')
        }, {
          key: 'name',
          label: TAPi18n.__('Name')
        }, {
          key: 'orderedResources',
          label: TAPi18n.__('Price'),
          fn: function(value) {
            var totalAmount = 0;
            value.forEach(function (res) {
              var currResource = Resources.findOne(res.resourceId);
              if (currResource) {
                if (!isNaN(currResource.price) && res.state !== 'sold') {
                  totalAmount = totalAmount + Number(currResource.price);
                }
              }
            })
            return Math.round(totalAmount * 100) / 100;
          }
        }, {
          key: '_id',
          label: TAPi18n.__('Action'),
          tmpl: Template.orderAction
        }
      ],
      filters: ['resource']
    };
  }
});

Template.orders.onCreated(function() {
  Meteor.subscribe('resources');
  var resourceId = this.data.resourceId;
  if (resourceId) {
    this.filter = new ReactiveTable.Filter('resource', ['orderedResources']);
    this.filter.set({ $elemMatch: { resourceId: resourceId } });
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
      .data('working-text', TAPi18n.__('Working...'))
      .button('working')
      .prop('disabled', true);
    template.subscribe('completed-orders', function() {
      console.log(TAPi18n.__('csv export beginning...'));
      var data = [];
      var emailCount = 0;
      var modalText = '';
      var orders = Orders.find();
      var emailText = 'Bom dia\n\n' +
        'Informamos que a sua encomenda se encontra pronta para ser levantada na nossa Livraria.\n\n' +
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
              'Encomenda Escolar Completa!',
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
          modalText += emailCount + ' ' + TAPi18n.__('emails sent.');
        } else {
          modalText += TAPi18n.__('No emails sent.');
        }

        var blob = new Blob([CSV.unparse(data)], {type: 'text/csv;charset=utf-8'});
        saveAs(blob, 'orders_to_contact.csv');
      } else {
        modalText = TAPi18n.__('Nobody to contact!');
      }

      Session.set('modalText', modalText);
      $('#contactAndPrintModal').modal();
    });
    $(event.target).button('reset').prop('disabled', false);;
  }
});
