const validator = require("validator");
const usersCollection = require("../db").db().collection("users");
const bcrypt = require("bcryptjs");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  //get rid of our bad properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = function(){
  return new Promise(async (resolve, reject) => {
    if (this.data.username == "") {
      this.errors.push("You must provide a username");
    }
    if (
      this.data.username != "" &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push("Username can only contain letters and numbers.");
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("You must provide a valid email address");
    }
    if (this.data.password == "") {
      this.errors.push("You must provide a password");
    }
    if (this.data.password.length > 0 && this.data.password.length < 12) {
      this.errors.push("Your password must be at least 12 characters long");
    }
    if (this.data.password.length > 50) {
      this.errors.push("You password cannot exceed 50 characters.");
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Your username must be at least 3 characters long");
    }
    if (this.data.username.length > 30) {
      this.errors.push("You username cannot exceed 30 characters.");
    }
  
    // Only if username is valid, check to see if its already taken
    // if(this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)){
    //   let usernameExists = await usersCollection.findOne({username: this.data.username});
    //   if(usernameExists){
    //     this.errors.push("That username is already taken.")
    //   }
    // }
  
    //   // Only if username is valid, check to see if its already taken
    // if(validator.isEmail(this.data.email)){
    //   let emailExists = await usersCollection.findOne({email: this.data.email});
    //   if(emailExists){
    //     this.errors.push("That email is already in use.")
    //   }
    // }

    if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      let usernameExists = await usersCollection.findOne({
        username: this.data.username,
        _id: { $ne: new ObjectId(this.data._id) }, // Exclude current user
      });
      if (usernameExists) {
        this.errors.push("That username is already taken.");
      }
    }
    
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email,
        _id: { $ne: new ObjectId(this.data._id) }, // Exclude current user
      });
      if (emailExists) {
        this.errors.push("That email is already in use.");
      }
    }
    
    resolve()
  
  })
}

User.prototype.login = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    const attemptedUser = await usersCollection.findOne({
      username: this.data.username,
    });
    if (
      attemptedUser &&
      bcrypt.compareSync(this.data.password, attemptedUser.password)
    ) {
      this.data = attemptedUser;
      resolve("Congrats");
    } else {
      reject("Invalid Username / Password");
    }
  });
};

User.prototype.register = function(){
  return new Promise(async (resolve, reject) => {
    // Step 1: Validate user data
    this.cleanUp();
    await this.validate();
  
    // step 2: Only if there are no validation errors, then save user data into a database.
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
      resolve()
    }else{
      reject(this.errors)
    }
  })
}


User.findByUsername = function(username){
  return new Promise(function(resolve, reject){
    if(typeof(username)!="string"){
      reject()
      return
    }
    usersCollection.findOne({username: username}).then(function(userDoc){
      if(userDoc){
        userDoc = new User(userDoc, true)
        userDoc = {
          _id: userDoc.data._id,
          username: userDoc.data.username
        }
        resolve(userDoc)
      }else{
        reject()
      }
    }).catch(function(){
      reject()
    })
  })
}

User.doesEmailExist = function(email){
  return new Promise(async function(resolve, reject){
    if(typeof(email) != "string"){
      resolve(false)
      return
    }

    let user = await usersCollection.findOne({email: email})
    if(user){
      resolve(true)
    }else{
      resolve(false)
    }
  })
}


// Need a findSingleUserById func to find a single user by ID
  // Need to have a reusablePostQuery to get information of user 
    // Update function to check if the user is the active user
      // actuallyUpdate func to perform the findOneAndUpdate method


  User.prototype.update = function () {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await usersCollection.findOne({ _id: new ObjectId(this.data._id) });
        if (user) {
          let status = await this.actuallyUpdate();
          resolve(status);
        } else {
          reject("User not found.");
        }
      } catch (err) {
        reject("Unable to update user.");
      }
    });
  };
  
  User.prototype.actuallyUpdate = function () {
    return new Promise(async (resolve, reject) => {
      this.cleanUp();
      await this.validate();
      if (!this.errors.length) {
        await usersCollection.findOneAndUpdate(
          { _id: new ObjectId(this.data._id) },
          {
            $set: {
              username: this.data.username,
              email: this.data.email,
            },
          }
        );
        resolve("success");
      } else {
        resolve("failure");
      }
    });
  };



module.exports = User;
