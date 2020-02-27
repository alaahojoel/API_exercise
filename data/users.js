let users = [
  {
    id: 1,
    username: "tester",
    password: "$2y$06$bMk3FIMEm2C4XZBDgEghveD/qM/LnehqZoo4VrcDtTFvNzyEaxab." // testpw
  }
];

//Exporting some arrow functions to be used in the api methods
module.exports = {
  //Pushing a new user into the array
  addUser: (username, password) => {
    users.push({
      id: users.length + 1,
      username,
      password
    });
  },

  //Obvious
  getAllUsers: () => users,

  //Getting user by their username
  getUserByName: (username) => users.find(u => u.username == username)

}