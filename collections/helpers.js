SimpleSchema.messages({
  uniqueEmail: '[label] must be unique',
  regEx: [
    {exp: /^[a-zA-Z0-9- ]+$/, msg: '[label] - "[value]" must not contain other chars than: 0-9, a-z, A-Z, "-" and " "'},
    {exp: /^[0-9]{9}$/, msg: '[label] must be 9 digits, without any other chars.'}
  ]
});

