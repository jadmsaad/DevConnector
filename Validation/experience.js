const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateExperienceInput(data) {
  let errors = [];

  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.title)) {
    errors.push("Title Field is required");
  }

  if (Validator.isEmpty(data.company)) {
    errors.push("Company Field is required");
  }

  if (Validator.isEmpty(data.from)) {
    errors.push("From Field is required");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
