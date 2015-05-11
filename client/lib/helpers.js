Template.registerHelper('getSession',function(key){
  return Session.get(key) || null;
});

