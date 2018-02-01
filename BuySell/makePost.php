<?php

$servername = 'localhost'; // default server name
$serverusername = 'cscicsuf'; // user name that you created
$serverpassword = "3GwzlRP8zSsSfzWW";// password that you created
$dbname = 'project';;

if(!empty($_POST)){
  $action = $_POST["action"];                       // set action
  $object = json_decode($_POST["object"], true);

  // Call function according to action
  if($action == "new"){
    newPost($object);
  }
  if($action == "update"){
    update($object);
  }
  if($action == "edit")
  {
    $postID = $_POST["postID"];
    editPost($object, $postID);
  }
}

// Updates object in db
function update($object)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }
  // Prepare aql statement
  $stmt = $conn->prepare("SELECT * FROM Users WHERE email = ?");
  if ($stmt==FALSE)
  {
  	echo "There is a problem with prepare <br>";
  	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
  }
  $stmt->bind_param("s", $email);

  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows != 0)          // Results returned, email already exits
  {
    echo "email already exists";
    return;
  }

  // Parse invalid character
  $object["address"] = $conn->real_escape_string($object["address"]);

  if ($object["password"] != "")     // Update everything including password
  {
    $stmt = $conn->prepare("UPDATE Users SET password = ?, email = ?, fname = ?, lname = ?, address = ? WHERE username = ?");
    if ($stmt==FALSE)
    {
    	echo "There is a problem with prepare <br>";
    	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
    }
    $stmt->bind_param("ssssss", $object["password"], $object["email"], $object["firstName"], $object["lastName"], $object["address"], $object["username"]);
  }
  else            // Update everything except the password
  {
    $stmt = $conn->prepare("UPDATE Users SET email = ?, fname = ?, lname = ?, address = ? WHERE username = ?");
    if ($stmt==FALSE)
    {
    	echo "There is a problem with prepare <br>";
    	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
    }
    $stmt->bind_param("sssss",  $object["email"], $object["firstName"], $object["lastName"], $object["address"], $object["username"]);
  }

  if ($stmt->execute() === TRUE)
  {
    echo "settings updated";
  }
  else
  {
    echo "Error: " . $sql . "<br>" . $conn->error;
  }

  $conn->close();
}

function editPost($object, $postID)
{
  if($object["isbook"]){
    $username = $object["username"];
    $postTitle = $object["postTitle"];
    $content = $object["content"];
    $image = $object["image"];
    $price = $object["price"];
    $bookTitle = $object["bookTitle"];
    $bookAuthor = $object["bookAuthor"];
    $bookPages = $object["bookPages"];

    // Create connection
    $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

    // Check connection
    if ($conn->connect_error)
    {
        die("Connection failed: " . $conn->connect_error ."<br>");
    }

    $date = date("Y-m-d");

    // Parse invalid character
    $postTitle = $conn->real_escape_string($postTitle);
    $content = $conn->real_escape_string($content);
    $bookTitle = $conn->real_escape_string($bookTitle);
    $bookAuthor = $conn->real_escape_string($bookAuthor);

    $stmt = $conn->prepare("UPDATE Posts SET postTitle = ?, postDescription = ?, postImage =?, postPrice=?, postDateModified= ? WHERE postID = ? ");
    if ($stmt==FALSE)
    {
    	echo "There is a problem with prepare <br>";
    	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
    }
    $stmt->bind_param("sssisi", $postTitle, $content, $image, $price, $date, $postID);

    if ($stmt->execute() === TRUE)      // Query successful, book info edited
    {
      // prepare query
      $stmt = $conn->prepare("UPDATE Books SET bookTitle = ?, bookAuthor = ?, bookPages =? WHERE postID = ? ");
      if ($stmt==FALSE)
      {
      	echo "There is a problem with prepare <br>";
      	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
      }
      $stmt->bind_param("ssii", $bookTitle, $bookAuthor, $bookPages, $postID);

      if ($stmt->execute() === TRUE) {         // Query
        echo "record updated";
      }
      else {
        echo "Error updating record: " . $conn->error;
      }
    }
    else {
      echo "Error updating record: " . $conn->error;
    }

    $conn->close();
  }
  else{
    $username = $object["username"];
    $postTitle = $object["postTitle"];
    $content = $object["content"];
    $image = $object["image"];
    $price = $object["price"];
    $videoTitle = $object["videoTitle"];
    $videoDuration = $object["videoDuration"];
    $videoGenre = $object["videoGenre"];

    // Create connection
    $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

    // Check connection
    if ($conn->connect_error)
    {
        die("Connection failed: " . $conn->connect_error ."<br>");
    }

    $date = date("Y-m-d");

    $postTitle = $conn->real_escape_string($postTitle);
    $content = $conn->real_escape_string($content);
    $videoTitle = $conn->real_escape_string($videoTitle);

    $stmt = $conn->prepare("UPDATE Posts SET postTitle = ?, postDescription = ?, postImage =?, postPrice=?, postDateModified= ? WHERE postID = ? ");
    if ($stmt==FALSE)
    {
    	echo "There is a problem with prepare <br>";
    	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
    }
    $stmt->bind_param("sssisi", $postTitle, $content, $image, $price, $date, $postID);

    if ($stmt->execute() === TRUE)        // Query successful, video info edited
    {
      $stmt = $conn->prepare("UPDATE Videos SET videoTitle = ?, videoDuration = ?, videoGenre =? WHERE postID = ? ");
      if ($stmt==FALSE)
      {
      	echo "There is a problem with prepare <br>";
      	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
      }
      $stmt->bind_param("sisi", $videoTitle, $videoDuration, $videoGenre, $postID);

      if ($stmt->execute() === TRUE) {
        echo "record updated";
      }
      else {
        echo "Error updating record: " . $conn->error;
      }
    }
    else {
      echo "Error updating record: " . $conn->error;
    }
  }
}


function newPost($object){
  if ($object["isbook"] == true)
  {
    $username = $object["username"];
    $postTitle = $object["postTitle"];
    $content = $object["content"];
    $image = $object["image"];
    $price = $object["price"];
    $bookTitle = $object["bookTitle"];
    $bookAuthor = $object["bookAuthor"];
    $bookPages = $object["bookPages"];
    $isbook = 1;

    // Create connection
    $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

    // Check connection
    if ($conn->connect_error)
    {
        die("Connection failed: " . $conn->connect_error ."<br>");
    }

    // Get most recent post
    $sql = "SELECT MAX(postID) AS pID FROM Posts";
    $result = $conn->query($sql);

    if ($result->num_rows != 0)    // If post exists, get post ID
    {
      $row = $result->fetch_assoc();
      $postID = $row["pID"];
      $postID = $postID + 1;
    }
    else
    {
      $postID = 0;                  // new post will be the first one
    }

    $date = date("Y-m-d");

    $postTitle = $conn->real_escape_string($postTitle);
    $content = $conn->real_escape_string($content);
    $bookTitle = $conn->real_escape_string($bookTitle);
    $bookAuthor = $conn->real_escape_string($bookAuthor);

    // Prepare query for new post
    $stmt = $conn->prepare("INSERT INTO Posts (postID, postUsername, postTitle, postDescription, postImage, postDateCreated, postPrice, postDateModified, postIssaBook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt==FALSE)
    {
    	echo "There is a problem with prepare <br>";
    	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
    }
    $stmt->bind_param("isssssisi", $postID, $username, $postTitle, $content, $image, $date, $price, $date, $isbook);

    if ($stmt->execute() === TRUE)       // Query successful
    {
      // Prepare query for book
      $stmt = $conn->prepare("INSERT INTO Books (postID, bookTitle, bookAuthor, bookPages) VALUES (?, ?, ?, ?)");
      if ($stmt==FALSE)
      {
      	echo "There is a problem with prepare <br>";
      	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
      }
      $stmt->bind_param("issi", $postID, $bookTitle, $bookAuthor, $bookPages);

      if ($stmt->execute() === TRUE)          // Query successful, new record created
      {
        echo "New record created successfully";
      }
      else
      {
        echo "Error: " . $sql . "<br>" . $conn->error;
      }
    }
    else
    {
      echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();

    return;
  }
  else
  {
    $username = $object["username"];
    $postTitle = $object["postTitle"];
    $content = $object["content"];
    $image = $object["image"];
    $price = $object["price"];
    $videoTitle = $object["videoTitle"];
    $videoDuration = $object["videoDuration"];
    $videoGenre = $object["videoGenre"];
    $isbook = 0;

    // Create connection
    $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

    // Check connection
    if ($conn->connect_error)
    {
        die("Connection failed: " . $conn->connect_error ."<br>");
    }

    // Get most recent post
    $sql = "SELECT MAX(postID) AS pID FROM Posts";
    $result = $conn->query($sql);

    if ($result->num_rows != 0)        // There are results
    {
      $row = $result->fetch_assoc();
      $postID = $row["pID"];           // Assign new posts postID as incremented from more recent posts ID
      $postID = $postID + 1;
    }
    else
    {
      $postID = 0;
    }

    $date = date("Y-m-d");

    // Parses invalid characters
    $postTitle = $conn->real_escape_string($postTitle);
    $content = $conn->real_escape_string($content);
    $videoTitle = $conn->real_escape_string($videoTitle);

    $stmt = $conn->prepare("INSERT INTO Posts (postID, postUsername, postTitle, postDescription, postImage, postDateCreated, postPrice, postDateModified, postIssaBook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt==FALSE)
    {
    	echo "There is a problem with prepare <br>";
    	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
    }
    $stmt->bind_param("isssssisi", $postID, $username, $postTitle, $content, $image, $date, $price, $date, $isbook);

    if ($stmt->execute() === TRUE)   // Query successful
    {
      $stmt = $conn->prepare("INSERT INTO Videos (postID, videoTitle, videoDuration, videoGenre) VALUES (?, ?, ?, ?)");
      $stmt->bind_param("isss", $postID, $videoTitle, $videoDuration, $videoGenre);

      if ($stmt->execute() === TRUE) // Query for new video successful
      {
        echo "New record created successfully";
      }
      else
      {
        echo "Error: " . $sql . "<br>" . $conn->error;
      }
    }
    else
    {
      echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();

    return;
  }
}


?>
