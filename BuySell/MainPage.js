function showImage()
{
  let modal = document.getElementById('myModal');       // Used to expand image to a larger view
  let image = document.getElementById('postImage');
  let modalImg = document.getElementById("img01");

  modal.style.display = "block";
  modalImg.src = image.src;        // Sets image to the
}

function closeSpan()               // Resets image to default post view
{
  let modal = document.getElementById('myModal');
  modal.style.display = "none";
}

function logout()                  // Logs the user out
{
  sessionStorage.clear();
  window.open("Login.html", "_self", false);    // Goes back to login page
}

function checkPrivilege()
{
  user = sessionStorage.getItem("currentUser");
  admin = sessionStorage.getItem("admin");

  // Checks if user is logged in
  if (user == undefined)           // If user is not logged in
  {
    alert("Please log into your account.");
    window.open("Login.html", "_self", false);   // Goes back to the login page
  }

  if(admin == true){               // If current user is the admin,
    showAdminSettings();           // then display admin settings
  }

  let lastViewed = sessionStorage.getItem("lastPostViewed");
  let sortBy = sessionStorage.getItem("sortBy");

  if(lastViewed == undefined)       // If last viewed has not been defined
  {
    // Set it to -1, which means the first post should be displayed
    sessionStorage.setItem("lastPostViewed", -1);
  }
  if(sortBy == undefined){          // If sort by has not been defined
    sessionStorage.setItem("sortBy", "date");       // Default: posts ordered date
    document.getElementById('sortPrice').classList.remove("menuHide");
    document.getElementById('sortPrice').classList.add("menuShow");
  }
  else
  {
    if(sortBy == "price")
    {
      document.getElementById('sortDate').classList.remove("menuHide");
      document.getElementById('sortDate').classList.add("menuShow");
    }
    else {
      document.getElementById('sortPrice').classList.remove("menuHide");
      document.getElementById('sortPrice').classList.add("menuShow");
    }
  }

  populateMainPage();
}

function populateMainPage()
{
  var requestURL = "http://csci130.xyz/BuySell/getPost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadMain;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  httpRequest.send('action=' + encodeURIComponent('view') + '&postID=' + encodeURIComponent(sessionStorage.getItem('lastPostViewed')) + '&sort=' + encodeURIComponent(sessionStorage.getItem('sortBy')));
}
// Sets the session sortBy to appropriate value(date, price)
function sortBy(option){
  sessionStorage.setItem("sortBy", option);
  sessionStorage.setItem("lastPostViewed", -1);
  location.reload();
}

function loadComments(){
  var requestURL = "http://csci130.xyz/BuySell/getPost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadComments;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

  httpRequest.send('action=' + encodeURIComponent('comments') + '&postID=' + encodeURIComponent(sessionStorage.getItem('lastPostViewed')));
}

function alertContents_loadComments(){
  try
  {
    if (httpRequest.readyState === XMLHttpRequest.DONE)
    {
      if (httpRequest.status === 200)
      {
        var response = httpRequest.responseText;

        // Checks if comment has been deleted and reloads the page
        if(response == "Comment deleted"){
          alert("GOOD NEWS! Comment Deleted :D");
          location.reload();
          return;
        }
        // Parses the comment and calls display
        comments = JSON.parse(response);
        showComments(comments);
      }
      else
      {
        alert('There was a problem with the request.');
      }
    }
	return 1;
  }
  catch(e)
  {
    alert('Caught Exception: ' + e.description);
  }
}

function searchPost(){
  let input = document.getElementById('searchTextBox');

  // Checks if no input
  if(input.value == ""){
    alert("You haven't entered anything silly!");
    return;
  }

  // Sets issaSearch to 1, meaning it is currently displaying search results
  sessionStorage.setItem("issaSearch", 1);


  var requestURL = "http://csci130.xyz/BuySell/getPost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadMain;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

  // Sends the action, current post ID, and search query
  httpRequest.send('action=' + encodeURIComponent('search') + '&postID=' + encodeURIComponent(sessionStorage.getItem('lastPostViewed')) + '&query=' + encodeURIComponent(input.value));
}

// Displays comments on Main Page for each post
function showComments(comments){
  let table = document.getElementById("commentTable");

  // Clear comments table so that other post comments do not show up on current
  table.innerHTML = "";
  document.getElementById("newComment").value = "";    // clear the comment box

  // Creates the comments table
  for(let i = 0; i < comments.length; i++)
  {
    let row = table.insertRow(i);     // Inserts new row for every comment from current post
    let cell = row.insertCell(0);

    let commentInfo = document.createElement("div");         // Comment container created
    let commentTextField = document.createElement("div");
    let deleteBtn = document.createElement("button");        // Delete button for comment

    // Displays comment info: Posted by, posted date
    commentInfo.classList.add("commentHeader");
    commentInfo.innerHTML = "Posted by <span class='comment_header'>" + comments[i].postUsername + "</span> on <span class='comment_header'>" + comments[i].commentDate + "</span>";


    commentTextResponse = comments[i].commentText;

    // Catch for escape characters
    commentTextResponse = commentTextResponse.split("\\'").join("'");
    commentTextResponse = commentTextResponse.split("\\n").join("<br>");
    commentTextField.classList.add("commentText");
    commentTextField.innerHTML = commentTextResponse;

    deleteBtn.innerHTML = "Delete Comment";
    deleteBtn.classList.add("menuHide");
    deleteBtn.classList.add("deleteButton");

    // Deletes comment on click
    deleteBtn.addEventListener('click', function()
      {
        deleteComment(comments[i].commentID);
      });

    // Adds comment, button into the cell
    cell.appendChild(commentInfo);
    cell.appendChild(commentTextField)
    cell.appendChild(deleteBtn);

    // Displays delete button only if the current user matches comment user
    if(comments[i].postUsername == sessionStorage.getItem("currentUser")){
      deleteBtn.classList.remove("menuHide");
      deleteBtn.classList.add("menuShow");
    }
    else if(sessionStorage.getItem("admin") == true){
      deleteBtn.classList.remove("menuHide");
      deleteBtn.classList.add("menuShow");
    }
  }

  return;
}

// Sends action to delete comment in the database
function deleteComment(commentID){
  var requestURL = "http://csci130.xyz/BuySell/getPost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadComments;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  httpRequest.send('action=' + encodeURIComponent('deleteComment') + '&postID=' + encodeURIComponent(commentID));
}

// Fills all post information
function fillInputFields(item, subClass)
{
  let title = document.getElementById("postTitleBox");
  let postContent = document.getElementById("postDescription");
  let priceAmount = document.getElementById('postPrice');
  let itemInfo1 = document.getElementById('itemInfo1');
  let itemInfo2 = document.getElementById('itemInfo2');
  let itemInfo3 = document.getElementById('itemInfo3');
  let img = document.getElementById("postImage");
  let vid = document.getElementById("dsfdsf");
  let username = document.getElementById("postUsername");
  let postDate = document.getElementById("postDate");

  // Set that last viewed to current post, to return when navigating through posts
  sessionStorage.setItem('lastPostViewed', item['postID']);
  username.innerHTML = item['postUsername'];
  postDate.innerHTML = item['postDateCreated'];
  priceAmount.innerHTML = "Price: $" + item['postPrice'];
  title.innerHTML = item['postTitle'].split("\\'").join("'");   // Check for apostrophe
  let temp = item['postDescription'].split("\\'").join("'" );
  postContent.innerHTML =  temp.split("\\n").join("<br/>" );    // Check for new line

  // Set post info according to type of post
  if(item['postIssaBook']==1)        //  Check what type of post. Book: 1, Video: 0
  {
    img.removeAttribute("hidden");
    img.src = item['postImage'];
    vid.setAttribute("hidden", true);
    itemInfo1.innerHTML = "Book Title: " + subClass['bookTitle'].split("\\'").join("'");
    itemInfo2.innerHTML = "Author: " + subClass['bookAuthor'].split("\\'").join("'");
    itemInfo3.innerHTML = "Pages: " + subClass['bookPages'];
  }
  else
  {
    vid.removeAttribute("hidden");
    vid.setAttribute('src', item['postImage']);
    img.setAttribute("hidden", true);
    itemInfo1.innerHTML = "Video Title: " + subClass['videoTitle'].split("\\'").join("'");;
    itemInfo3.innerHTML = "Genre: " + subClass['videoGenre'];

    // Sets video duration in correct format
    let duration = subClass['videoDuration'];
    if (duration <= 59)
    {
      itemInfo2.innerHTML = "Duration: 00:00:" + ((duration < 10) ? '0' + duration.toString() : duration.toString());
    }
    else if (duration < 3599)
    {
      let minutes = Math.floor(duration / 60);
      let seconds = duration - minutes * 60;
      itemInfo2.innerHTML = "Duration: 00:" + ((minutes < 10) ? '0' + minutes.toString() : minutes.toString()) + ":"+ ((seconds < 10) ? '0' + seconds.toString() : seconds.toString());
    }
    else
    {
      let hours = Math.floor(duration / 3600);
      duration = duration - hours * 3600;
      let minutes = Math.floor(duration / 60);
      let seconds = duration - minutes * 60;
      itemInfo2.innerHTML = "Duration: " + ((hours < 10) ? '0' + hours.toString() : hours.toString()) + ":" + ((minutes < 10) ? '0' + minutes.toString() : minutes.toString()) + ":" + ((seconds < 10) ? '0' + seconds.toString() : seconds.toString());
    }
  }

  // Allows user to edit/ delete thier own posts
  if (item['postUsername'] == sessionStorage.getItem("currentUser"))
  {
    showUserButtons();
  }
  else
  {
    hideUserButtons();        // If user did not create post, hide edit/delete buttons
  }

  loadComments();             // Display current posts comments
}

function alertContents_loadMain()
{
  try
  {
    if (httpRequest.readyState === XMLHttpRequest.DONE)
    {
      if (httpRequest.status === 200)
      {
        var response = httpRequest.responseText;
        //alert(response);
        // Search only displays one result
        if(sessionStorage.getItem("issaSearch") == 1)     // Currently displaying search results
        {
          sessionStorage.setItem("issaSearch", 0);        // Reset in the case that the user clicks to go home
          document.getElementById("nextPost").style.display = "none";    // cannot navigate when search results are displayed
          document.getElementById("prevPost").style.display = "none";
        }
        else {
          document.getElementById("nextPost").style.display = "block";   // If not currently in search results,
          document.getElementById("prevPost").style.display = "block";   // Display and allow navigation
        }


        if(response == "End of list")      // Users have viewed all posts
        {
          alert("There are no more posts to view at this time.");
          return;
        }

        if (response == "no records"){     // If no posts exists, display no posts message gif
          let itemBox = document.getElementById('no');
          itemBox.innerHTML = "<img id='travolta' src='https://thumbs.gfycat.com/UntidyPlumpDore-small.gif'/>";
          return;
        }

        // Navigate will depend on whether a newer post exists, otherwise navigating to the next post is necessary
        if(response == "Record deletedn"){ // Navigate to right if recorded is deleted
          navigateTo('next');
          return;
        }

        if(response == "Record deletedp"){ // Navigate to left if recorded is deleted
          navigateTo('prev');
          return;
        }

        if(response == "Good News! Comment Posted")   // Comment has been posted
        {
          location.reload();               // Page is reloaded to display newest update from comments
          return;
        }

        // Calls to fill subclass of main page (post details)
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
  catch(e)
  {
    alert('Caught Exception: ' + e.description);
  }
}

// Displays delete buttons for admin user
function showAdminSettings()
{
  let deleteBtn = document.getElementById('deletePost');
  deleteBtn.classList.remove('menuHide');
  deleteBtn.classList.add('menuShow');
}

// Displays delete and edit buttons for users
function showUserButtons()
{
  let deleteBtn = document.getElementById('deletePost');
  let editBtn = document.getElementById('editPost');
  deleteBtn.classList.remove('menuHide');
  deleteBtn.classList.add('menuShow');
  editBtn.classList.remove('menuHide');
  editBtn.classList.add('menuShow');
}

// Hides delete and edit buttons for user
function hideUserButtons()
{
  let deleteBtn = document.getElementById('deletePost');
  let editBtn = document.getElementById('editPost');
  editBtn.classList.remove('menuShow');
  editBtn.classList.add('menuHide');
  deleteBtn.classList.remove('menuShow');
  deleteBtn.classList.add('menuHide');

  if (sessionStorage.getItem("admin") == true)
  {
    showAdminSettings();
  }
}

function newPost()
{
  sessionStorage.setItem("action", "NP");        // sets action to NP code
  window.open("NewPost.html", "_self", false);   // opens new post new page
}

function editPost()
{
  sessionStorage.setItem("action", "EP");        // sets action to EP
  // sets last post viewed to current post to be edited, in order to return to the post after edit
  sessionStorage.setItem("postID", sessionStorage.getItem("lastPostViewed"));

  window.open("NewPost.html", "_self", false);   // opens the new post page with different options
}

// Sends which direction to navigate to
function navigateTo(action)
{
  var requestURL = "http://csci130.xyz/BuySell/getPost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadMain;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

  httpRequest.send('action=' + encodeURIComponent(action) + '&postID=' + encodeURIComponent(sessionStorage.getItem('lastPostViewed')) + '&sort=' + encodeURIComponent(sessionStorage.getItem('sortBy')));
}

// Sends to add a comment to current post, and store into comments table
function addComment(){
  let text = document.getElementById("newComment");
  if(text.value == ''){                 // If comment is empty alert user
    alert("Please enter a comment");
    return;
  }
  let temp = text.value.split("<").join("&lt");                  // User cannot enter html
  var requestURL = "http://csci130.xyz/BuySell/postComment.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadMain;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  httpRequest.send('postID='+ encodeURIComponent(sessionStorage.getItem('lastPostViewed')) + "&postUsername=" + encodeURIComponent(sessionStorage.getItem('currentUser'))+ "&text=" + encodeURIComponent(temp));
}
// Sends which post to be deleted from posts table
function deletePost(){
  var requestURL = "http://csci130.xyz/BuySell/getPost.php";
  httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = alertContents_loadMain;
  httpRequest.open('POST', requestURL);
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  httpRequest.send('action=' + encodeURIComponent('delete') + '&postID=' + encodeURIComponent(sessionStorage.getItem('lastPostViewed')));
}
