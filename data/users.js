const uuidv4 = require('uuid/v4');

let users = [
  {
    id: 1,
    username: "tester",
    password: "$2y$06$bMk3FIMEm2C4XZBDgEghveD/qM/LnehqZoo4VrcDtTFvNzyEaxab." // testpw
  }
];

module.exports = {
  addUser: (username, password) => {
    users.push({
      id: users.length + 1,
      username,
      password
    });
  },
  getAllUsers: () => users,

}