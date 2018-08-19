Router.route('/resources', function() {
  // console.log('before this.render(\'resources\');');
  this.render('resources');
  // this.subscribe('resources').wait();
  // if (this.ready()) {
  //   this.render('resources');
  // } else {
  //   this.render('Loading');
  // }
});

var groupOrders = new ReactiveArray();

Tracker.autorun(function() {
  if (Session.get('clean') === 'true') {
    groupOrders.clear();
    if (typeof Filter !== 'undefined') {
      Filter.set('');
    }
    Session.set('clean', '');
  }
});

Template.resources.onCreated(function() {
/*  this.autorun(() => {
    this.subscribe('resources', null, 'orders');
  });*/
});

Template.resources.helpers({
  settings: function() {
    return {
      collection: 'resourcestable',
      showFilter: true,
      filters: ['group'],
      fields: [
        {
          key: 'order',
          label: TAPi18n.__('Order'),
          fn: function(value, object) {
            return (_.contains(groupOrders.array(), object._id))?true:false;
          },
          tmpl: Template.orderResource
        }, {
          key: 'reference',
          label:TAPi18n.__('Reference')
        }, {
          key: 'year',
          label:TAPi18n.__('Year')
        }, {
          key: 'subject',
          label:TAPi18n.__('Subject')
        }, {
          key: 'title',
          label:TAPi18n.__('Title')
        }, {
          key: 'quantity',
          label: TAPi18n.__('Quantity'),
          tmpl: Template.resourceQuantity
        }, {
          key: 'price',
          label: TAPi18n.__('Price')
        }, {
          key: 'computedOrders',
          sortOrder: 0,
          sortDirection: 'descending',
          fn: function(value, object) {
            return new Spacebars.SafeString("<a href=/orders?resourceId="+object._id+"&reference="+object.reference+">"+value+"</a>");
          },
          label:TAPi18n.__('Orders')
        }, {
          key: 'computedGroupOrders',
          label:TAPi18n.__('Group orders')
        }, {
          key: 'editor',
          label:TAPi18n.__('Editor')
        }, {
          key: 'group',
          label:TAPi18n.__('Group')
        }
      ]
    }; 
  },
  isConfirm: function() {
    groupOrders.depend();
    return (groupOrders.length > 0)?true:false;
  },
  totalLivros: function() {
    // Calcul value of products in stock
    var total = 0;
    // Resources.find({quantity:{$gte:0}}).map(function(doc) {
    //   total += doc.quantity * doc.price;
    // });
    return total.toFixed(2);
  }
});

Template.resources.onCreated(function () {
  Filter = new ReactiveTable.Filter('group', ['group']);
});

Template.resources.events({
  'click .reactive-table tr': function(event, template) {
    if (event.target.className === 'checkbox') {
      var resource = this;
      if (_.contains(groupOrders.array(), resource._id)) {
        var index = groupOrders.indexOf(resource._id);
        groupOrders.splice(index, 1);
      } else {
        groupOrders.push(resource._id);
      }

      if (groupOrders.length > 0) {
        if (Filter.get() === '') {
          Filter.set(resource.group);
        }
      } else {
        Filter.set('');
      }
    }
  }
});

Template.orderResource.helpers({
  isSelected: function() {
    var resource = this;
    groupOrders.depend();
    return (_.contains(groupOrders.array(), resource._id))?true:false;
  }
});

Template.confirmGroupOrder.helpers({
  methodArgs: function() {
    return [Filter.get(), groupOrders.array()]
  },
  onSuccess: function() {
    return function(result) {
      Router.go('/grouporder/' + result);
    }
  }
});

Template.resources.events({
  'click #update': function(event) {
    $(event.target)
      .data('working-text', TAPi18n.__('Working...'))
      .button('working')
      .prop('disabled', true);
     
    var inputsIds = [];
    $('input.form-control').parent().parent().each(function(){
      var id = $(this).attr('id');
      if (id) {
        inputsIds.push(id);
      }
    });
    
    _.each(inputsIds, function(id, index) {
      $('#' + id).submit();
    });
    $(event.target).button('reset').prop('disabled', false);;
  },

  'click #updateAllResources': function(event) {
    Meteor.call('updateResources');
  },

});

Template.resourceQuantity.helpers({
  isConfirm: function() {
    groupOrders.depend();
    return (groupOrders.length > 0)?true:false;
  }
});
