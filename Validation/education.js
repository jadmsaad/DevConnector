const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldOfStudy = !isEmpty(data.fieldOfStudy) ? data.fieldOfStudy : "";

  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "school Field is required";
  }

  if (Validator.isEmpty(data.degree)) {
    errors.degree = "degree Field is required";
  }

  if (Validator.isEmpty(data.fieldOfStudy)) {
    errors.fieldOfStudy = "fieldOfStudy Field is required";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "From Field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
