log = new Logger('server');

schoolNames = function (csvLine) {
  var keys = Object.keys(csvLine);
  var index = keys.indexOf('Title');
  keys.splice(index, 1);
  index = keys.indexOf('Reference');
  keys.splice(index, 1);
  index = keys.indexOf('Editor');
  keys.splice(index, 1);
  index = keys.indexOf('Subject');
  keys.splice(index, 1);
  index = keys.indexOf('Year');
  keys.splice(index, 1);
  index = keys.indexOf('Group');
  keys.splice(index, 1);

  return keys;
};

SimpleSchema.messages({
  regEx: [
    {exp: /^[0-9]{9}$/, msg: '[label] must be 9 digits, without any other chars.'}
  ]
});

