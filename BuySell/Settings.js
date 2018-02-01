function saveSettings()
{
  let password = document.getElementById("passwordTextBox");
  let confirmPassword = document.getElementById("confirmPasswordTextBox");
  let firstName = document.getElementById("firstNameTextBox");
  let lastName = document.getElementById("lastNameTextBox");
  let email = document.getElementById("emailTextBox");
  let address = document.getElementById("addressTextBox");
  let errorFlag = false;

  if (email.value == '')     // Email cannot be empty
  {
    email.classList.remove("regularTextbox");
    email.classList.add("errorTextbox");
    alert("Please fill all the fields in the page before clicking the 'Create Account' button.");
    return;
  }

  if (password.value != confirmPassword.value)         // Password do not match alert
  {
    alert("The passwords do not match. Please retype both passwords.");
    document.getElementById("passwordTextBox").value = "";
    document.getElementById("confirmPasswordTextBox").value = "";
    password.classList.remove("regularTextbox");
    password.classList.add("errorTextbox");
    confirmPassword.classList.remove("regularTextbox");
    confirmPassword.classList.add("errorTextbox");
    return;
  }

  emailvalidation = validateEmail(email.value);        // validate email before changing

  if (emailvalidation == false)                        // Email not validated, alert
  {
    alert("Invalid email. Please re-enter a valid email.");
    email.classList.remove("regularTextbox");
    email.classList.add("errorTextbox");
    return;
  }

  // Alerts when first name, last name, or user tries to enter html
  if(!validateString(firstName)){
    alert("Please enter a valid first name");
    firstName.classList.remove("regularTextbox");
    firstName.classList.add("errorTextbox");
    return;
  }

  if(!validateString(lastName)){
    alert("Please enter a valid last name");
    lastName.classList.remove("regularTextbox");
    lastName.classList.add("errorTextbox");
    return;
  }

  if (address.value.indexOf("<") != -1)
  {
    alert("This field contains invalid characters");
    address.classList.remove("regularTextarea");
    address.classList.add("errorTextarea");
    return false;
  }

  submitEdit(password, email, firstName, lastName, address);       // Info validated, ready to submit
}

function validateString(str){
    if(str.value == '')                   // Cannot be empty
    {
      return true;
    }
    if (str.value.indexOf("'") != -1)     // Cannot be apostrophe
    {
      return false;
    }
    if (str.value.indexOf("<") != -1)      // Cannot be html
    {
      return false;
    }
    var re = /^[A-Za-z]+$/;                // Regex for only a-z
    if(re.test(str.value))
       return true;
    else
       return false;
}

function validateEmail(email) {
  if (email.indexOf("'") != -1)          // Cannot be apostrophe
  {
    return false;
  }
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function checkPrivilege()               // Checks if user is logged in
{
  user = sessionStorage.getItem("currentUser");

  if (user == undefined)
  {
    alert("Please log into your account.");
    window.open("Login.html", "_self", false);
  }

  loadDetails();                       // Loads all setting details
}

function loadDetails()
{
  let userName = document.getElementById('usernameTextBox');     // Fills username (cannot edit)

  userName.value = sessionStorage.getItem("currentUser");

  loadUserInfo();                     // Displays current user info
}

function loadUserInfo(){
  var requestURL = "http://csci130.xyz/BuySell/getPost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadEdit;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  httpRequest.send('action=' + encodeURIComponent('getUserInfo') + '&postID=' +  encodeURIComponent(sessionStorage.getItem("currentUser")));
}

function submitEdit(password, email, firstName, lastName, address)
{
  var requestURL = "http://csci130.xyz/BuySell/makePost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_submitEdit;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  let userInfo = new Object();

  userInfo.username = sessionStorage.getItem("currentUser");
  userInfo.password = password.value;
  userInfo.email = email.value;
  userInfo.firstName = firstName.value;
  userInfo.lastName = lastName.value;
  userInfo.address = address.value;

  httpRequest.send('action=' + encodeURIComponent('update') + '&object=' + JSON.stringify(userInfo));
}

function alertContents_submitEdit()
{
  try
  {
    if (httpRequest.readyState === XMLHttpRequest.DONE)
    {
      if (httpRequest.status === 200)
      {
    		var response = httpRequest.responseText;

        if (response == "email already exists")         // Checks if email is in use by another user
        {
          alert("This email is already in use by another account. Please use a different email to sign up for an account.");
          document.getElementById("emailTextBox").classList.remove("regularTextbox");
          document.getElementById("emailTextBox").classList.add("errorTextbox");
          document.getElementById("passwordTextBox").value = "";
          document.getElementById("confirmPasswordTextBox").value = "";
          return;
        }

        if (response == "settings updated")             // Settings correctly updated
        {
          alert("Settings successfully updated xD");
          window.open("MainPage.html", "_self", false); // Go back to Main Page
          return;
        }
      }
      else
      {
        alert('There was a problem with the request.');
      }
    }
	return 1;
  }
  catch(e) // Always deal with what can happen badly, client-server applications --> there is always something that can go wrong on one end of the connection
  {
    alert('Caught Exception: ' + e.description);
  }
}

function alertContents_loadEdit()
{
  try
  {
    if (httpRequest.readyState === XMLHttpRequest.DONE)
    {
      if (httpRequest.status === 200)
      {
    		var response = httpRequest.responseText;

        let userInfo = JSON.parse(response);

        fillInputFields(userInfo);          // Fills all inputs
      }
      else
      {
        alert('There was a problem with the request.');
      }
    }
	return 1;
  }
  catch(e) // Always deal with what can happen badly, client-server applications --> there is always something that can go wrong on one end of the connection
  {
    alert('Caught Exception: ' + e.description);
  }
}

// Fills all settings page inputs according to current user
function fillInputFields(userInfo)
{
  let firstName = document.getElementById("firstNameTextBox");
  let lastName = document.getElementById("lastNameTextBox");
  let email = document.getElementById("emailTextBox");
  let address = document.getElementById("addressTextBox");

  firstName.value = userInfo.firstName;
  if (userInfo.firstName == "NULL")     // If user has not entered name display empty string
  {
    firstName.value = "";
  }
  lastName.value = userInfo.lastName;   // If user has not entered last name display empty string
  if (userInfo.lastName == "NULL")
  {
    lastName.value = "";
  }
  email.value = userInfo.emailAddress;  // If user has not entered email display empty string
  if (userInfo.emailAddress == "NULL")
  {
    email.value = "";
  }
  let temp = userInfo.address.split("\\'").join("'");    // handles apostrophes, new lines
  temp = temp.split("\\n").join("\\\n");
  address.value = temp.split("\\").join("");
  if (userInfo.address == "NULL")
  {
    address.value = "";
  }
  return;
}
