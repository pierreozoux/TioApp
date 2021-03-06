var uploadDir = process.env.PWD + '/.uploads/';
// var uploadDir = 'C:/meteor/TioApp/.uploads/';


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
    if (Houston._user_is_admin(Meteor.userId())) {
      var resourceId;
      var lines = [];

      // Read file
      CSV.readCsvFileLineByLine(uploadDir + path, {
        headers: true
      }, function(line) {
        lines.push(line);
      });

      //check uniqueness of reference
      var duplicates = _.compact(
        _.map(
          lines.map(function(line) {
            return line.Reference;
          }).sort(), function(value, index, array) {
          if (value === array[index+1]){
            return value;
          }
        })
      );
      console.log('duplicates:' + duplicates);
      if (duplicates.length) {
        throw new Meteor.Error('Collection-Error', 'Ref is a duplicate: ' + duplicates);
      }
      console.log('line[0]:' + lines[0]);

      // Create schools
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

      lines.forEach(function(line, index) {
        console.log('Line: '+ line);
        if (!(line.Title && line.Reference && line.Editor && line.Subject && line.Group && line.Year && line.Price)) {
          var lineNumber = index + 2
          console.log('error');
          console.log(line);
          console.log(lineNumber);
          throw new Meteor.Error('Collection-Error', 'There is an error on line ' + lineNumber);
        }
        var title = line.Title.trim();
        var reference = line.Reference.trim();
        var editor = line.Editor.trim();
        var subject = line.Subject.trim();
        var group = line.Group.trim();
        var year = line.Year.trim();
        var price = line.Price.trim();

        log.info('processing: ' + reference + 'data=' + title + ',' + reference + ',' + editor + ',' + subject + ',' + group + ',' + year + ',' + price );
        var resource = Resources.findOne({reference: reference});
        // Insert resource
        if (!resource) {
          resourceId = Resources.insert({
            title:     title,
            reference: reference,
            editor:    editor,
            subject:   subject,
            group:     group,
            year:      year,
            price:     price
          }, function(error) {
            if (error) {
              throw new Meteor.Error('Collection-Error', 'Resource insert Reference: '  + reference + ' - ' + error.message);
            }
          });
        } else {
          // update resource
          Resources.update({
            _id: resource._id
          }, {
            $set: {
              title:     title,
              editor:    editor,
              subject:   subject,
              group:     group,
              year:      year,
              price:     price
            }
          })
          resourceId = resource._id;
        }

        // Searching for school using the resource and insert Course
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
                  // resources: [resourceId] // error with last version of Meteor..
                }, 
                $addToSet: {
                  resources: resourceId
                }
              }, function(error) {
                if (error) {
                  throw new Meteor.Error('Collection-Error', 'Course insert Error - Reference: '  + reference + ' - ' + error.message);
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
                  throw new Meteor.Error('Collection-Error', 'Course update Reference: '  + reference + ' - ' + error.message);
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
  }
});
