describe('User List', () => {
  it('Should use always the same instance of UserList', () => {
    const ul1 = require('../../src/UserList');
    const ul2 = require('../../src/UserList');
    expect(ul2).toBe(ul1);
  });

  it('Should add users to all declared UserList', () => {
    const ul1 = require('../../src/UserList');
    ul1.addUser({id:'rafael'});
    expect(ul1.getUserIds()).toContain('rafael');
    const ul2 = require('../../src/UserList');
    ul2.addUser({id:'arantes'});
    expect(ul2.getUserIds()).toContain('arantes');
    expect(ul1.getUserIds()).toContain('arantes');
    expect(ul2.getUserIds()).toContain('rafael');
  });
});