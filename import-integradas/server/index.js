var uploadDir = process.env.PWD + '/.uploads/';

Meteor.startup(function () {
  log.info('logging is ready');

  UploadServer.init({
    tmpDir: uploadDir + 'tmp',
    uploadDir: uploadDir,
    checkCreateDirectories: true //create the directories for you
  });
});

Meteor.methods({
  importIntegradas: function(path) {
   var resourceId;
    var lines = [];

    CSV.readCsvFileLineByLine(uploadDir + path, {
      headers: true
    }, function(line) {
      lines.push(line);
    });

    schoolNames(lines[0]).forEach(function(schoolDirty) {
      var school = schoolDirty.trim();
      log.info('write school: ' + school);
      if (!Schools.findOne({name: school})) {
        Schools.insert({
          name: school
        }, function(error) {
          if (error) {
            throw new Meteor.Error('Collection-Error', 'Schools: ' + error.message);
          }
        });
      }
    });

    lines.forEach(function(line) {
      var title = line.Title.trim();
      var reference = line.Reference.trim();
      var editor = line.Editor.trim();
      var subject = line.Subject.trim();
      var group = line.Group.trim();
      
      log.info('processing: ' + reference);
      var resource = Resources.findOne({reference: reference});
      if (!resource) {
        resourceId = Resources.insert({
          title:     title,
          reference: reference,
          editor:    editor,
          subject:   subject,
          group:     group
        }, function(error) {
          if (error) {
            throw new Meteor.Error('Collection-Error', 'Reference: '  + reference + ' - ' + error.message);
          }
        });
      } else {
        resourceId = resource._id;
      }

      schoolNames(lines[0]).forEach(function(schoolNameDirty) {
        var schoolName = schoolNameDirty.trim();
        var year = line.Year.trim();
        var courseName = schoolName + '-' + year;
        var school = Schools.findOne({name: schoolName});

        log.info('school: ' + schoolName);
        if (school) {
          log.info('schoolId: ' + school._id);
          if ( line[schoolName] === 'x' ) {
            Courses.upsert({
              name: courseName
            }, {
              $setOnInsert: {
                name: courseName,
                year: year,
                schoolId: school._id,
                resources: [resourceId]
              }, 
              $addToSet: {
                resources: resourceId
              }
            }, function(error) {
              if (error) {
                throw new Meteor.Error('Collection-Error', 'Reference: '  + reference + ' - ' + error.message);
              }
            });
          } else {
            Courses.update({
              name: courseName
            }, {
              $pull: {
                resources: resourceId
              }
            }, function(error) {
              if (error) {
                throw new Meteor.Error('Collection-Error', 'Reference: '  + reference + ' - ' + error.message);
              }
            });
          }
        } else {
          throw new Meteor.Error('shcool-not-found', 'No shccol saved with name: ' + schoolName + ' - Reference: ' + Resources.findOne(resourceId).reference);
        }
      });
    });
    UploadServer.delete(path);
  }
});
