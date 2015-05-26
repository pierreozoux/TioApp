Router.route('import');

Uploader.status = function(error, data, textStatus, jqXHR) {
  if(error) {
    Session.set('errorResult', error.reason);
    console.log(error + ' ' + data + ' ' + textStatus + ' ' + jqXHR);
    $('#errorResult').collapse('show');
  } else {
    $('#errorResult').collapse('hide');
    $('#successResult').collapse('hide');
  }
};

Uploader.finished = function(index, fileInfo) {
  console.log('Finished upload, starting csv import.');
  $('#processing').collapse('show');
  Meteor.call('importIntegradas', fileInfo.path, function (error) {
    window.setTimeout(function() {
      $('#processing').collapse('hide');
    }, 1000);
    
    if (error) {
      Uploader.status(error);
    } else {
      $('#successResult').collapse('show');
    }
    console.log('Finished processing CSV.');
  });
};

Template.import.helpers({
  errorResult: function() {
    return Session.get('errorResult');
  }
})

