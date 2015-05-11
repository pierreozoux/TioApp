Resources = new Mongo.Collection('resources');

Resources.allow({
  update: function(userId) {
    if (userId) {
      return true;
    }
  }
});


Resources.importFromCsv = function(csvFile) {
  var resource;
  var resourceId;
  var courseName;
  var lines = [];

  CSV.readCsvFileLineByLine(csvFile, {
    headers: true
  }, function(line) {
    lines.push(line);
  });

  schoolNames(lines[0]).forEach(function(school) {
    log.info('write school: ' + school);
    if (!Schools.findOne({name: school})) {
      Schools.insert({
        name: school
      });
    }
  });

  lines.forEach(function(line) {
    log.info('processing:' + line);
    resource = Resources.findOne({reference: line.Reference});
    if (!resource) {
      resourceId = Resources.insert({
        title:     line.Title,
        reference: line.Reference,
        editor:    line.Editor,
        subject:   line.Subject,
        supplier:  'any'
      });
    } else {
      resourceId = resource._id;
    }

    schoolNames(lines[0]).forEach(function(school) {
      courseName = school + '-' + line.Year;
      if ( line[school] === 'x' ) {
        log.info('school' + school);
        Courses.upsert({
          name: courseName
        }, {
          $setOnInsert: {
            name: courseName,
            year: line.Year,
            schoolId: Schools.findOne({name: school})._id,
            resources: [resourceId]
          }, 
          $addToSet: {
            resources: resourceId
          }
        });
      }
    });
  });
};

var Schemas = {};

Schemas.Resource = new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200
  },
  reference: {
    type: String,
    label: 'Reference',
    max: 200,
    optional: true,
    unique: true
  },
  editor: {
    type: String,
    label: 'Editor',
    max: 200
  },
  supplier: {
    type: String,
    label: 'Supplier',
    max: 200
  },
  quantity: {
    type: Number,
    label: 'Quantity',
    defaultValue: 0,
    optional: true
  },
  subject: {
    type: String,
    label: 'Subject',
    max: 200
  }
});

Resources.attachSchema(Schemas.Resource);

if (Meteor.isServer) {
  Meteor.publish('resources', function (courseName) {
    if (this.userId) {
      check(courseName, String);
      var course = Courses.findOne({name: courseName});
      if (course) {
        return Resources.find({_id: {$in: course.resources}});
      }
    }
  });
} else {
  Template.resourcesSelection.helpers({
    resources: function() {
      if (Session.get('courseName')) {
        return Resources.find({});
      }
    },
    isSellable: function() {
      Template.resourcesSelection.__helpers.get('setNeedContact')();
      return this.quantity>0?true:false;
    },
    setNeedContact: function() {
      var needContact = false;
      Resources.find().forEach( function(resource) {
        var inCart = $('#' + resource._id).attr('class') !== 'disabled';
        var sold = $('#' + resource._id).find(':checkbox').prop('checked');
        if (inCart && !sold) { 
          needContact = true;
        }
      });
      Session.set('needContact', needContact);
    }
  });
}
