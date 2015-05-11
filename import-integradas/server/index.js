Meteor.startup(function () {
  log.info('logging is ready');
  var uploadDir = process.env.PWD + '/.uploads/';

  UploadServer.init({
    tmpDir: uploadDir + 'tmp',
    uploadDir: uploadDir,
    checkCreateDirectories: true, //create the directories for you
    finished: function(fileInfo) {
      log.info('Finished upload, starting csv import.');
      Resources.importFromCsv(uploadDir + fileInfo.path);
      log.info('Finished processing CSV.');
    }
  });
});


