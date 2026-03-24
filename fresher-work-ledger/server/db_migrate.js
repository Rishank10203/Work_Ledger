db.users.updateMany({ role: 'Admin' }, { $set: { role: 'admin' } });
db.users.updateMany({ role: 'Team Member' }, { $set: { role: 'user' } });
db.users.updateMany({ role: 'Project Manager' }, { $set: { role: 'user' } });
db.users.updateMany({ role: 'Client' }, { $set: { role: 'client' } });
console.log('User roles migration finished');
