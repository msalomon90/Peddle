function checkPrivilege()
{
  showform('radio1');
  user = sessionStorage.getItem("currentUser");

  if (user == undefined)      // Checks if user is logged in
  {
    alert("Please log into your account.");
    window.open("Login.html", "_self", false);        // goes to login page if not logged in
  }

// If post is being edited, send changes to update posts table
  if(sessionStorage.getItem('action') == "EP")
  {
    var requestURL = "http://csci130.xyz/BuySell/getPost.php";
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = alert_fillInputFields;
    httpRequest.open('POST', requestURL);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    httpRequest.send('action=' + encodeURIComponent('view') + '&postID=' + encodeURIComponent(sessionStorage.getItem('lastPostViewed')) + '&sort=' + encodeURIComponent(sessionStorage.getItem('sortBy')));
  }
}

// Fills all elements on current page
function fillInputFields(item, subClass)
{
  let title = document.getElementById("titleTextBox");
  let postContent = document.getElementById("descriptionTextBox");
  let imageLink = document.getElementById("imageTextBox");
  let priceAmount = document.getElementById('priceTextBox');
  let bookRadio = document.getElementById('r12');
  let videoRadio = document.getElementById('r22');
  let bookTitle = document.getElementById('bookTitleTextBox');
  let bookAuthor = document.getElementById('bookAuthorTextBox');
  let bookPages = document.getElementById('bookPagesTextBox');
  let videoTitle = document.getElementById('VideoTitleTextBox');
  let videoHours = document.getElementById('videoHoursDropdown');
  let videoMinutes = document.getElementById('videoMinutesDropdown');
  let videoSeconds = document.getElementById('videoSecondsDropdown');
  let videoGenre = document.getElementById('videoGenreDropdown');

  title.value = item['postTitle'].split("\'").join("'");      // Handles apostrophes
  temp = item['postDescription'].split("\'").join("'");
  postContent.value = temp.split("\n").join("<br/>");         // Handles new lines
  imageLink.value = item['postImage'];
  priceAmount.value = item['postPrice'];

  if(item['postIssaBook'] == 1 )      //  Sets all book values into page
  {
    bookRadio.checked = true;
    videoRadio.disabled = true;
    bookTitle.value = subClass['bookTitle'].split("\'").join("'");     // Handles apostrophes
    bookAuthor.value = subClass['bookAuthor'].split("\'").join("'");
    bookPages.value = subClass['bookPages'];
  }
  else                                // Sets all video values into page
  {
    bookRadio.disabled = true;
    videoRadio.checked = true;
    showform('radio2');
    videoTitle.value = subClass['videoTitle'].split("\'").join("'");  // Handles apostrophes
    videoGenre.value = subClass['videoGenre'];

    let duration = subClass['videoDuration'];    // Sets duration for video
    if (duration<=59)
    {
      videoHours.selectedIndex = 0;
      videoMinutes.selectedIndex = 0;
      videoSeconds.selectedIndex = duration;
    }
    else if (duration < 3599)
    {
      let minutes = Math.floor(duration / 60);
      let seconds = duration - minutes * 60;
      videoHours.selectedIndex = 0;
      videoMinutes.selectedIndex = minutes;
      videoSeconds.selectedIndex = seconds;
    }
    else
    {
      let hours = Math.floor(duration / 3600);
      duration = duration - hours * 3600;
      let minutes = Math.floor(duration / 60);
      let seconds = duration - minutes * 60;
      videoHours.selectedIndex = hours;
      videoMinutes.selectedIndex = minutes;
      videoSeconds.selectedIndex = seconds;
    }
  }
}

// Calls to fill all info with parsed response from server
function alert_fillInputFields()
{
  try
  {
    if (httpRequest.readyState === XMLHttpRequest.DONE)
    {
      if (httpRequest.status === 200)
      {
        var response = httpRequest.responseText;
        let item = JSON.parse(response);
        let subClass = JSON.parse(item['subClass']);
        fillInputFields(item, subClass);
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

// Displays the correct value for radio button depending on type of post
function showform(val)
{
  var bookform =  document.getElementById("bookform");
  var videoform =  document.getElementById("videoform");
  bookform.style.display = 'block';   // show
  videoform.style.display = 'none';// hide

  if(val == 'radio1')
  {
      bookform.style.display = 'block';
      videoform.style.display = 'none';
  }
  else if(val == 'radio2'){
       bookform.style.display = 'none';
       videoform.style.display = 'block';
  }
}

// Validates all input from input fields
function validateInputInfo(){
  let title = document.getElementById("titleTextBox");
  let postContent = document.getElementById("descriptionTextBox");
  let imageLink = document.getElementById("imageTextBox");
  let priceAmount = document.getElementById('priceTextBox');
  let bookRadio = document.getElementById('r12');
  let videoRadio = document.getElementById('r22');

  let errorFlag = false;
  // Alerts if title or price has no input
  if (title.value == '' | priceAmount.value == '')
  {
      alert("Please fill all the required fields before submitting the post")
      errorFlag = true;
  }

  if (errorFlag == true)    // sets CSS for error
  {
    if (title.value == '')
    {
      title.classList.remove("regularTextbox");
      title.classList.add("errorTextbox");
    }

    if (priceAmount.value == '')
    {
      priceAmount.classList.remove("regularTextarea");
      priceAmount.classList.add("errorTextarea");
    }

    return false;
  }

  let username = sessionStorage.getItem("currentUser");

  price = priceAmount.value

  if(isNaN(price) == false)      // Validates that the price is a number
  {
    price = parseInt(price);
  }
  else
  {
    alert("The price contains invalid characters");      // if price is not a number alert
    priceAmount.classList.remove("regularTextarea");
    priceAmount.classList.add("errorTextarea");
    return false;
  }


  if(bookRadio.checked)      // Post is a book
  {
    let string = imageLink.value;   // Sets image link
    let image = "";

    if (validateImageLink(string) == false)     // Alert if image link if invalid
    {
      alert("Invalid image link.")
      imageLink.classList.remove("regularTextarea");
      imageLink.classList.add("errorTextarea");
      return false;
    }

    if (string.indexOf(".jpg") == -1)           // add .jpg if missing
    {
      if (string != "")
      {
        image = string + ".jpg";
      }
    }
    else
    {
      image = string;                           // Finally set image
    }

    return validateBookInfo(image, price);      // Validate that book info is correct
  }
  else                                          // Post is a book
  {
    let string = imageLink.value;
    let link = "";

    if (validateVideoLink(string))              // Validate image link is valid
    {
      alert("You are only allowed to link to Youtube videos at this time.")    // only allowing youtube videos
      imageLink.classList.remove("regularTextarea");
      imageLink.classList.add("errorTextarea");
      return false;
    }

    // Checks to create a correct youtube link
    // and validates all video input is correct
    let x = string.indexOf(".be/");
    let y = string.indexOf("watch?v=");

    // Handling different types of youtube links
    if (x != -1)
    {
      link = string.substring(x + 4, x + 4 + 11);
      link = "https://www.youtube.com/embed/" + link;
      return validateVideoInfo(link, price);
    }
    else if(y != -1)
    {
      link = string.substring( y + 8, y + 8 + 11);
      link = "https://www.youtube.com/embed/" + link;
      return validateVideoInfo(link, price);
    }
    else if (string.indexOf("https://www.youtube.com/embed/") != -1)
    {
      return validateVideoInfo(string, price);
    }
    else
    {
      alert("Invalid link");
      return false;
    }
  }
}

function validateBookInfo(image, price)
{
  let title = document.getElementById("titleTextBox");
  let postContent = document.getElementById("descriptionTextBox");
  let bookTitle = document.getElementById('bookTitleTextBox');
  let bookAuthor = document.getElementById('bookAuthorTextBox');
  let bookPages = document.getElementById('bookPagesTextBox');

  errorFlag = false;

  // Handles if any fields are empty
  if (bookTitle.value == '' || bookAuthor.value == '' || bookPages.value == '')
  {
    errorFlag = true;
  }

  if (errorFlag == true)
  {
    alert("Please fill all the required fields before submitting the post");   // alerts error
    // Sets CSS for error
    if (bookTitle.value == '')
    {
      bookTitle.classList.remove("regularTextarea");
      bookTitle.classList.remove("errorTextarea");
    }
    if (bookAuthor.value == '')
    {
      bookAuthor.classList.remove("regularTextarea");
      bookAuthor.classList.remove("errorTextarea");
    }
    if (bookPages.value == '')
    {
      bookPages.classList.remove("regularTextarea");
      bookPages.classList.remove("errorTextarea");
    }
    return false;
  }

  if (bookTitle.value.indexOf("<") != -1)           // Handles when user tries to input html
  {
    alert("Oh no! Invalid characters!");
    bookTitle.classList.remove("regularTextarea");
    bookTitle.classList.remove("errorTextarea");
    return false;
  }

  if (bookAuthor.value.indexOf("<") != -1)
  {
    alert("Oh no! Invalid characters!");            // Handles when user tries to input html
    bookAuthor.classList.remove("regularTextarea");
    bookAuthor.classList.remove("errorTextarea");
    return false;
  }

  let pages = bookPages.value;

  if(isNaN(pages) == false)      // Checks if pages is a number
  {
    pages = parseInt(pages);
  }
  else                           // Otherwise alerts of invalid characters
  {
    alert("The number of pages contains invalid characters");
    bookPages.classList.remove("regularTextarea");
    bookPages.classList.add("errorTextarea");
    return false;
  }

  // After info is validated all info is set to book object
  var bookObject = new Object();
  bookObject.username = sessionStorage.getItem("currentUser");
  let temp = title.value.split("<").join("&lt");
  bookObject.postTitle = temp;
  temp = postContent.value.split("<").join("&lt");
  bookObject.content = temp;
  bookObject.image = image;
  bookObject.price = price;
  bookObject.bookTitle = bookTitle.value;
  bookObject.bookAuthor = bookAuthor.value;
  bookObject.bookPages = pages;
  bookObject.isbook = 1;

  submitPost(bookObject);       // Passes book object to be set in posts table
  return true;

}
function validateVideoInfo(image, price){
  let title = document.getElementById("titleTextBox");
  let postContent = document.getElementById("descriptionTextBox");
  let videoTitle = document.getElementById('VideoTitleTextBox');
  let videoGenre = document.getElementById('videoGenreDropdown');
  let videoHours = document.getElementById('videoHoursDropdown');
  let videoMinutes = document.getElementById('videoMinutesDropdown');
  let videoSeconds = document.getElementById('videoSecondsDropdown');

  let errorFlag;

  if (videoTitle.value == '')       // Video title cannot be empty
  {
    errorFlag = true;
  }

  if (errorFlag == true)            // Video title is empty, alerts user
  {
    alert("Please fill all the required fields before submitting the post");

    if (videoTitle.value == '')
    {
      videoTitle.classList.remove("regularTextarea");
      videoTitle.classList.remove("errorTextarea");
    }

    return false;
  }

  if (videoTitle.value.indexOf("<") != -1)      // User cannot enter html into title field
  {
    alert("Oh no! Invalid characters!");
    videoTitle.classList.remove("regularTextarea");
    videoTitle.classList.remove("errorTextarea");
    return false;
  }

  // User must enter video duration
  if (videoHours.value == 0 && videoMinutes.value == 0 && videoSeconds.value == 0)
  {
    alert("A valid video duration must be selected.");
    return false;
  }

  let duration = (parseInt(videoHours.value) * 60 * 60) + (parseInt(videoMinutes.value) * 60) + (parseInt(videoSeconds.value));

  // After info validated all info is set to video object
  var videoObject = new Object();
  videoObject.username = sessionStorage.getItem("currentUser");
  let temp = title.value.split("<").join("&lt");
  videoObject.postTitle = temp;
  temp = postContent.value.split("<").join("&lt");
  videoObject.content = temp;
  videoObject.image = image;
  videoObject.price = price;
  videoObject.videoTitle = videoTitle.value;
  videoObject.videoDuration = duration;
  videoObject.videoGenre = videoGenre.value;
  videoObject.isbook = 0;

  submitPost(videoObject);

  return true;
}

function submit()               // Passes book object to be set in posts table
{
  validateInputInfo();
}

function validateImageLink(string)
{

  if(string.indexOf("'") != -1){        // Link cannot be empty
    return false;
  }
  substring = ".com/a/";
  if (string.indexOf(substring) != -1)
  {
    return false;
  }
  substring = "/gallery";
  if (string.indexOf(substring) != -1)
  {
    return false;
  }
  return true
}

function validateVideoLink(string)
{
  if(string.indexOf("'") != -1){        // Link cannot be empty
    return false;
  }
  substring = "youtube";
  if(string.indexOf(substring) != -1)
  {
    return false;
  }
  substring = "youtu.be";
  if(string.indexOf(substring) != -1)
  {
    return false;
  }
  return true;
}

// Sends object to be inserted/updated in posts table
function submitPost(newObject)
{
  var requestURL = "http://csci130.xyz/BuySell/makePost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_submitPost;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

  if(sessionStorage.getItem('action') == 'NP'){
    httpRequest.send('action=' + encodeURIComponent('new') + '&object=' + JSON.stringify(newObject));
  }
  else{
    httpRequest.send('action=' + encodeURIComponent('edit') + '&postID=' + encodeURIComponent(sessionStorage.getItem('lastPostViewed')) + '&object=' + JSON.stringify(newObject));
  }
}

function alertContents_submitPost()
{
  try
  {
    if (httpRequest.readyState === XMLHttpRequest.DONE)
    {
      if (httpRequest.status === 200)
      {
        var response = httpRequest.responseText;

        if (response == "New record created successfully")    // Alerts when post had been created
        {
          sessionStorage.setItem('lastPostViewed', -1);
          alert("Your post has been submited. ^-^ Click 'Okay' to go back to browsing.");
          window.open("MainPage.html", "_self", false);
          return;
        }
        else if (response == "record updated")                // Alerts when post has beed edited correctly
        {
          alert("Your edits have been submited. Click 'Okay' to go back to browsing where you left off.");
          window.open("MainPage.html", "_self", false);
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
