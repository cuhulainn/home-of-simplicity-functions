const isEmpty = (str) => {
  if (str.trim() === '') return true;
  else return false
}

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
}

exports.validateSignUpData = (data) => {
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = 'Please enter an email to sign up!'
  } else if (!isEmail(data.email)) {
    errors.email = 'Please enter a valid email address!'
  }
  if (isEmpty(data.firstName) || isEmpty(data.lastName)) errors.name = 'Please enter your first and last name to sign up!'

  if (isEmpty(data.password)) errors.password = 'Please enter a password to sign up!';
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Please check the passwords, they must match!';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.validateLogInData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = 'Please enter an email to log in!'
  if (isEmpty(data.password)) errors.password = 'Please enter a password to log in!'

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}