const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = [];

  // data.handle = !isEmpty(data.handle) ? data.handle : "";
  data.skills = !isEmpty(data.skills) ? data.skills : "";
  data.status = !isEmpty(data.status) ? data.status : "";

  // if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
  //   errors.push("Handle needs to be between 2 and 40 characters");
  // }

  // if (Validator.isEmpty(data.handle)) {
  //   errors.push("Handle is required");
  // }

  if (Validator.isEmpty(data.status)) {
    errors.push("status is required");
  }

  if (Validator.isEmpty(data.skills)) {
    errors.push("skills is required");
  }

  if (!isEmpty(data.website)) {
    if (!Validator.isURL(data.website)) {
      errors.push("Not a valid website URL");
    }
  }

  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(data.youtube)) {
      errors.push("Not a valid YouTube URL");
    }
  }

  if (!isEmpty(data.twitter)) {
    if (!Validator.isURL(data.twitter)) {
      errors.push("Not a valid Twitter URL");
    }
  }

  if (!isEmpty(data.facebook)) {
    if (!Validator.isURL(data.facebook)) {
      errors.push("Not a valid Facebook URL");
    }
  }

  if (!isEmpty(data.linkedin)) {
    if (!Validator.isURL(data.linkedin)) {
      errors.push("Not a valid LinkedIn URL");
    }
  }

  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(data.instagram)) {
      errors.push("Not a valid Instagram URL");
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
