describe('Helpers', function() {
  it('SchoolNames', function() {
    var csvLine = {
      Title: 'title',
      Reference: 'qwer1234',
      Editor: 'editor',
      Subject: 'Math',
      Year: '2',
      School1: '',
      School2: 'x',
      School3: 'x'
    };
    
    expect(schoolNames(csvLine)).toEqual(['School1', 'School2', 'School3']);
  });
});

