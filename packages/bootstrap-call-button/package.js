Package.describe({
  name: 'pierreo:bootstrap-call-button',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use("templating", "client");
  api.use('jquery', 'client');
  api.addFiles('bootstrap-call-button.html', 'client');
  api.addFiles('bootstrap-call-button.js', 'client');
});

