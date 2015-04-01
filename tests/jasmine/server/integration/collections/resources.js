Jasmine.onTest(function () {
  describe('Resources', function() {
    it('importFromCsv', function() {
      var csvFile = process.env.PWD + '/tests/testsample.csv';
      
      Resources.importFromCsv(csvFile);

      expect(Resources.find().count()).toEqual(6);
      expect(Resources.find({reference: '92898'}).count()).toEqual(1);
      expect(Resources.findOne({reference: '92898'}).title).toEqual('Pasta Mágica - EM 1');
      expect(Courses.find().count()).toEqual(4);
      expect(Schools.find().count()).toEqual(5);
      expect(Schools.find({name: 'School2'}).count()).toEqual(1);
      expect(Courses.findOne({name: 'School1-1'}).resources.length).toEqual(2);
      expect(Courses.findOne({name: 'School3-1'}).resources.length).toEqual(3);
    });
  });
});

