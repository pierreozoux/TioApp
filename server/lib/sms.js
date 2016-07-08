import twilio from 'twilio';

var phonesToContact = function() {
  var startYear = moment().startOf('year').toDate();
  var previousYearsPhones = _.uniq(Orders.find({
    courseName: {$regex: /^((?!-12).)*$/m},
    createdAt: {$lt: startYear}
  }, {
    fields: {phone: 1}
  }).map(function(e){return e.phone}));

  var thisYearPhones = _.uniq(Orders.find({
    courseName: {$regex: /^((?!-12).)*$/m},
    createdAt: {$gt: startYear}
  }, {
    fields: {phone: 1}
  }).map(function(e){return e.phone}));

  return _.compact(_.difference(previousYearsPhones, thisYearPhones));
};

var smsJobs = JobCollection('smsJobQueue');

Meteor.startup(function () {
  smsJobs.startJobServer();
  smsJobs.processJobs(
    'sms',
    {
      concurrency: 4,
      pollInterval: 1000
    },
    function (job, callback) {
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
          console.log('myTwilio.RestClient resp from : ' + res.from); // outputs "+14506667788"
          console.log('myTwilio.RestClient resp body: ' + res.body); // outputs "word to your mother."
          job.done('sms sent!');
          job.remove();
        } else {
          pretty_error = JSON.stringify(err, null, 2)
          console.log('err: ' + pretty_error);
          job.fail(pretty_error);
        }
        callback()
      }));
    }
  );
});

Meteor.methods({
  sendSMSAll: function (text) {
    check([text], [String]);
    _.each(phonesToContact(), function(phone) {
      var job = new Job(smsJobs, 'sms', {
        phone: phone,
        text: text
      });

      job.priority('normal')
      .retry({
        retries: 5,
        wait: 60
      }).save();
    });
  },
  priceSMSs: function() {
    return phonesToContact().length * 0.05;
  }
});
