const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = [];

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (Validator.isEmpty(data.name)) {
    errors.push("Name Field is required");
  }

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    // errors.name = "Name must be between 2 and 30 characters";
    errors.push("Name must be between 2 and 30 characters");
  }

  if (Validator.isEmpty(data.email)) {
    //errors.email = "Email Field is required";
    errors.push("Email Field is required");
  }

  if (!Validator.isEmail(data.email)) {
    //errors.email = "Email is invalid";
    errors.push("Email is invalid");
  }

  if (Validator.isEmpty(data.password)) {
    // errors.password = "Password Field is required";
    errors.push("Password Field is required");
  }

  if (!Validator.isLength(data.password, { min: 2, max: 30 })) {
    //errors.password = "Password must be between 2 and 30 characters";
    errors.push("Password must be between 2 and 30 characters");
  }

  if (Validator.isEmpty(data.password2)) {
    // errors.password2 = "Confirm Password Field is required";
    errors.push("Confirm Password Field is required");
  }

  if (!Validator.equals(data.password, data.password2)) {
    // errors.password2 = "Passwords must match";
    errors.push("Passwords must match");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
