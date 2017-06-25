import twilio from 'twilio';

var smsJobs = JobCollection('smsJobQueue');

Meteor.startup(function () {
  smsJobs.startJobServer();
  smsJobs.processJobs(
    'sms',
    {
      pollInterval: 60000
    },
    function (job, callback) {
      if (job.data.phone.substring(0,1) != '2') {
        // Create a client:
        var client = new twilio.RestClient(Settings.findOne({key: 'SMS-ACCOUNT-SID'}).value, Settings.findOne({key: 'SMS-AUTH-TOKEN'}).value );
        console.log('myTwilio.RestClient initialized');
        var to = '+351' + job.data.phone;

        client.sendMessage({
          to: to, // Any number Twilio can deliver to
          from: Settings.findOne({key: 'sms-from'}).value, // +15005550006 : A number you bought from Twilio and can use for outbound communication
          body: job.data.text // body of the SMS message
        }, Meteor.bindEnvironment((err,res) => {
          if (!err) {
            console.log('myTwilio.RestClient resp to ' + res.to + ' from : ' + res.from); // outputs "+14506667788"
            console.log('myTwilio.RestClient resp body: ' + res.body); // outputs "word to your mother."
            job.done('sms sent!');
            job.remove();
          } else {
            pretty_error = JSON.stringify(err, null, 2)
            console.log('err: ' + pretty_error);
            job.fail(pretty_error);
          }
        }));
      } else {
        job.done('not a mobile!');
        job.remove();
      }
      Meteor.setTimeout(callback,30000);
    });
});

Meteor.methods({
  phonesToContact: function(params) {
    var isStateSupport = params.isStateSupport;
    var startYear = moment().startOf('year').toDate();
    if(isStateSupport) {
      $criteria = {
        courseName: {$regex: /^((?!-12).)*$/m},
        createdAt: {$lt: startYear},
        stateSupport:isStateSupport,
      };
    } else {
      $criteria = {
        courseName: {$regex: /^((?!-12).)*$/m},
        createdAt: {$lt: startYear},
      };
    }
    var previousYearsPhones = _.uniq(Orders.find($criteria, {
      fields: {phone: 1}
    }).map(function(e){return e.phone}));

    if(isStateSupport) {
      $criteria = {
        courseName: {$regex: /^((?!-12).)*$/m},
        createdAt: {$gt: startYear},
        stateSupport:isStateSupport,
      };
    } else {
      $criteria = {
        courseName: {$regex: /^((?!-12).)*$/m},
        createdAt: {$gt: startYear},
      };
    }

    var thisYearPhones = _.uniq(Orders.find($criteria, {
      fields: {phone: 1}
    }).map(function(e){return e.phone}));

    return _.compact(_.difference(previousYearsPhones, thisYearPhones));
  },

  sendSMSAll: function (params) {
    var text = params.txtSms;
    var isStateSupport = params.stateSupport;
    check([text], [String]);
    _.each(Meteor.call('phonesToContact', {isStateSupport: isStateSupport}), function(phone) {
      if (phone && phone.substring(0,1) != '2') {
        var job = new Job(smsJobs, 'sms', {
          phone: phone,
          text: text
        });

        job.priority('normal')
        .retry({
          retries: 5,
          wait: 60000
        }).save();
      }
    });
  },

  targetPeopleSms: function(params) {
    if (params.isStateSupport) {
      return Meteor.call('phonesToContact', {isStateSupport: true}).length;
    } else {
      return Meteor.call('phonesToContact', {isStateSupport: false}).length;
    }
  }
});
