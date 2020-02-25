/* eslint-disable */

import axios from 'axios';

('use strict');

export const validate = input => {
  if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
    if (
      $(input)
        .val()
        .trim()
        .match(
          /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
        ) == null
    ) {
      return false;
    }
  } else {
    if (
      $(input)
        .val()
        .trim() == ''
    ) {
      return false;
    }
  }
};

export const showValidate = input => {
  var thisAlert = $(input).parent();

  $(thisAlert).addClass('alert-validate');
};

export const hideValidate = input => {
  var thisAlert = $(input).parent();

  $(thisAlert).removeClass('alert-validate');
};

/*========================================================
  [login] */

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      alert('You successfully logged in');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

/*========================================================
  [logout] */

export const logout = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: 'http://localhost:3000/api/v1/users/logout'
    });
    if (res.data.status === 'success') location.assign('/');
  } catch (err) {
    alert('error logging out! try again.');
  }
};
