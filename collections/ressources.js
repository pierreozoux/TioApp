Resources = new Mongo.Collection('resources');

Resources.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  reference: {
    type: String,
    label: 'Reference',
    max: 200,
    unique: true,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  group: {
    type: String,
    label: 'Editor',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  },
  editor: {
    type: String,
    label: 'Editor',
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
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
    max: 200,
    regEx: /^[a-zA-Z0-9- ]+$/
  }
}));

Resources.helpers({
  // quantity - completed orders
  availability: function() {
    var resource = this;
    return resource.quantity - Orders.find({state: {$in: ['completed', 'created']},orderedResources: {$elemMatch: {resourceId: resource._id, state: 'ordered'}}}).count();
  }
});

Resources.allow({
  update: function(userId) {
    return userId?true:false;
  }
});

Resources.importFromCsv = function(csvFile) {
  var resourceId;
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
    var resource = Resources.findOne({reference: line.Reference});
    if (!resource) {
      resourceId = Resources.insert({
        title:     line.Title,
        reference: line.Reference,
        editor:    line.Editor,
        subject:   line.Subject,
        group:     line.Group
      });
    } else {
      resourceId = resource._id;
    }

    schoolNames(lines[0]).forEach(function(school) {
      var courseName = school + '-' + line.Year;
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
      } else {
        Courses.update({
          name: courseName
        }, {
          $pull: {
            resources: resourceId
          }
        });
      }
    });
  });
};

