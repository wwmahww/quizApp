/* eslint-disable */
import '@babel/polyfill';
import { login, logout, validate, showValidate, hideValidate } from './login';

// DOM ELEMENTS
var input = $('.validate-input .input100');
const logoutBtn = $('.logout-btn');

// VALUES
var showPass = 0;

// DELEGATION

/*==================================================================
    [ Focus input ]*/
$('.input100').each(function() {
  $(this).on('blur', function() {
    if (
      $(this)
        .val()
        .trim() != ''
    ) {
      $(this).addClass('has-val');
    } else {
      $(this).removeClass('has-val');
    }
  });
});

/*==================================================================
    [ Validate ]*/
$('.validate-form').on('submit', function() {
  var check = true;

  for (var i = 0; i < input.length; i++) {
    if (validate(input[i]) == false) {
      showValidate(input[i]);
      check = false;
    }
  }

  return check;
});

$('.validate-form .input100').each(function() {
  $(this).focus(function() {
    hideValidate(this);
  });
});

/*==================================================================
    [ Show pass ]*/
$('.btn-show-pass').on('click', function() {
  if (showPass == 0) {
    $(this)
      .next('input')
      .attr('type', 'text');
    $(this).addClass('active');
    showPass = 1;
  } else {
    $(this)
      .next('input')
      .attr('type', 'password');
    $(this).removeClass('active');
    showPass = 0;
  }
});

/*==================================================================
    [ Login ]*/
$('form').submit(e => {
  e.preventDefault();
  const email = $('input[name="email"]').val();
  const password = $('input[name="pass"]').val();
  login(email, password);
});

/*==================================================================
    [ Logout ]*/
if (logoutBtn) {
  logoutBtn.click(logout);
}
