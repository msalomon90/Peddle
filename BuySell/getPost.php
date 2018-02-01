<?php

include "projectClasses.php";

$servername = 'localhost'; // default server name
$serverusername = 'cscicsuf'; // user name that you created
$serverpassword = "3GwzlRP8zSsSfzWW";// password that you created
$dbname = 'project';

if (!empty($_POST))
{
  $action = $_POST['action'];
  $postID = $_POST['postID'];

  if ($action == 'view')    // Function to get the post the user will see on the main page
  {
    $sort = $_POST['sort'];

    if($sort == 'date')
    {
      viewPostDate($postID);
    }
    if($sort == 'price'){
      viewPostPrice($postID);
    }
  }
  if ($action == 'next' || $action == 'prev') // Function to get the next and prev posts ordered by date or price
  {
    $sort = $_POST['sort'];

    if($sort == 'date')
    {
      dateNavigation($postID, $action);
    }
    if($sort == 'price')
    {
      priceNavigation($postID, $action);
    }
  }
  if ($action == 'delete')
  {
    $sort = $_POST['sort'];

    deletePost($postID, $sort);    // Function to delete a post
  }
  if ($action == 'comments')
  {
    getComments($postID);   // Function to get the comments for a post
  }
  if($action == 'deleteComment')
  {
    deleteComment($postID);   // Function to delete a post
  }
  if($action == 'getUserInfo')
  {
    getUserInfo($postID);   // Function to get the details of a user
  }
  if($action == 'search')
  {
    searchResults($_POST['query']);   // Function to search for a search term in the search area
  }

  return;
}

function viewPostDate($postID)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  // See if the table is empty
  $sql = "SELECT COUNT(postID) AS numPost FROM Posts";
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();

  if($row["numPost"] == 0)
  {
    echo "no records";
    return;
  }

  if ($postID == -1)  // Find the first post to view
  {
    $sql = "SELECT MAX(postID) AS pID FROM Posts ORDER BY postDateCreated DESC";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $postID = $row["pID"];

    echo getCurrentObject($conn, $postID);
  }
  else // Case where we went to load back where the user was
  {
    echo getCurrentObject($conn, $postID);
  }

  $conn->close();
  return;
}

function viewPostPrice($postID)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $sql = "SELECT COUNT(postID) AS numPost FROM Posts";  // Check if the table is empty
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();

  if($row["numPost"] == 0)
  {
    echo "no records";
    return;
  }

  if ($postID == -1)
  {
    $sql = "SELECT postID FROM Posts ORDER BY postPrice DESC, postID DESC LIMIT 1"; // Find the new post ordered by price
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();

    $postID = $row["postID"];

    echo getCurrentObject($conn, $postID);

    $conn->close();

    return;
  }
  else // Case where we went to load back where the user was
  {
    echo getCurrentObject($conn, $postID);

    $conn->close();

    return;
  }
}

function dateNavigation($postID, $action)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $sql = "SELECT COUNT(postID) AS numPost FROM Posts";  // Check if the table is empty
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();

  if($row["numPost"] == 0)
  {
    echo "no records";
    return;
  }

  if($action == 'next') // Get the next post ordered by date
  {
    $sql = "SELECT MAX(postID) AS pID FROM Posts p WHERE p.postID < {$postID}";
  }
  else
  {
    $sql = "SELECT MIN(postID) AS pID FROM Posts p WHERE p.postID > {$postID}"; // get the prev post ordered by date
  }

  $result = $conn->query($sql);
  $row = $result->fetch_assoc();

  if ($row["pID"] != null)
  {
    echo getCurrentObject($conn, $row["pID"]);  // Return back the next/prev object
    return;
  }
  else
  {
    echo "End of list";
    return;
  }
}

function priceNavigation($postID, $action)
{
  // Create connection
  $conn = mysqli_connect($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  if ($action == 'next')  // Find the next post ordered by price
  {
    $sql = "SELECT * FROM Posts WHERE postPrice <= (SELECT A.postPrice FROM Posts A WHERE A.postID = '{$postID}') ORDER BY postPrice DESC, postID DESC";
  }
  else    // Find the prev post ordered by price
  {
    $sql = "SELECT * FROM Posts WHERE postPrice >= (SELECT A.postPrice FROM Posts A WHERE A.postID = '{$postID}') ORDER BY postPrice ASC, postID ASC";
  }

  $result = mysqli_query($conn,$sql);

  while($row = mysqli_fetch_assoc($result)) // Loop until the correct record is found
  {
    if ($row["postID"] == $postID)
    {
      $row = mysqli_fetch_assoc($result);
      if($row["postID"] == null)
      {
        echo "End of list";
        return;
      }
      echo getCurrentObject($conn, $row["postID"]);
      return;
    }
  }

  echo "End of list";
  mysqli_close($conn);
  return;
}

function deletePost($postID, $sort)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  if ($sort == 'date')
  {
    $sql = "SELECT MIN(postID) AS pID FROM Posts";  // Find the first post ordered by date
  }
  else
  {
    $sql = "SELECT postID AS pID FROM Posts ORDER BY postPrice ASC, postID ASC";  // Find the first post ordered by price
  }

  $result = $conn->query($sql);
  $row = $result->fetch_assoc();

  $pID = $row["pID"];

  $sqlB = "DELETE FROM Books WHERE postID = {$postID}";  // Delete record from the Books table
  $sqlV = "DELETE FROM Videos WHERE postID = {$postID}";  // Delete record from the Videos table

  if ($conn->query($sqlB) === TRUE || $conn->query($sqlV) === TRUE)
  {
    $sql = "DELETE FROM Posts WHERE postID = {$postID}";  // Delete record from the Posts table

    if ($conn->query($sql) === TRUE)
    {
      $sql = "DELETE FROM Comments WHERE postID = {$postID}";  // Delete record from the Comments table

      if($conn->query($sql) === TRUE)
      {
        if ($pID == $postID)
        {
          echo "Record deletedp";
        }
        else
        {
          echo "Record deletedn";
        }
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
  }
  else
  {
    echo "Error: " . $sql . "<br>" . $conn->error;
  }
}

function getComments($postID)
{
  // Create connection
  $conn = mysqli_connect($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $sql = "SELECT * FROM Comments WHERE postID = '{$postID}' ORDER BY commentID ASC";  // Get all the comments for a certain post
  $result = mysqli_query($conn,$sql);

  $rows = array();

  while($row = mysqli_fetch_assoc($result))
  {
    $rows[] = array("commentID"=>$row["commentID"],"postID"=>$row["postID"], "postUsername"=>$row["postUsername"], "commentText"=>$row["commentText"], "commentDate"=>$row["commentDate"]); // Put the data into an associative array
  }

  echo json_encode($rows);    // Json encode the data to send back
  mysqli_close($conn);
}

function deleteComment($commentID)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $sql = "DELETE FROM Comments WHERE commentID = '{$commentID}'"; // Delete a comment

  if ($conn->query($sql) === TRUE)
  {
    echo "Comment deleted";
  }
  else
  {
    echo "Error: " . $sql . "<br>" . $conn->error;
  }
  return;
}

function getUserInfo($username)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $sql = "SELECT * FROM Users WHERE username = '{$username}'"; // Find all the details about a user
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();

  $user = new User();

  // Encode all the data into a class object
  $user->setUserName($row["username"]);
  $user->setEmailAddress($row["email"]);
  $user->setFirstName($row["fname"]);
  $user->setLastName($row["lname"]);
  $user->setAddress($row["address"]);

  echo $user->toJSON(); // Send back the json object of the class
  return;
}

function searchResults($searchText)
{
  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $searchText = $conn->real_escape_string($searchText); // Parse for invalid characters

  $stmt = $conn->prepare("SELECT * FROM Books WHERE bookTitle = ? OR bookAuthor = ? LIMIT 1");  // Search the books table
  if ($stmt==FALSE)
  {
  	echo "There is a problem with prepare <br>";
  	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
  }
  $stmt->bind_param("ss", $searchText, $searchText);

  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows == 0)
  {
    $stmt = $conn->prepare("SELECT * FROM Videos WHERE videoTitle = ? LIMIT 1"); // Search the videos table
    if ($stmt==FALSE)
    {
    	echo "There is a problem with prepare <br>";
    	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
    }
    $stmt->bind_param("s", $searchText);

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0)
    {
      echo "no records";
      return;
    }
    else
    {
      $row = $result->fetch_assoc();
      echo getCurrentObject($conn, $row["postID"]);
      return;
    }
  }
  else
  {
    $row = $result->fetch_assoc();
    echo getCurrentObject($conn, $row["postID"]);
    return;
  }
  $conn->close;
  return;
}

function getCurrentObject($conn, $postID) // Function to return all the details about a current object
{
  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $sql = "SELECT * FROM Posts WHERE postID = {$postID}";
  $result = $conn->query($sql);
  $row = $result->fetch_assoc();

  $item = new Item();
  $item->setPostID($postID);
  $item->setPostUsername($row["postUsername"]);
  $item->setPostTitle($row["postTitle"]);
  $item->setPostDescription($row["postDescription"]);
  $item->setPostImage($row["postImage"]);
  $item->setPostDateCreated($row["postDateCreated"]);
  $item->setPostPrice($row["postPrice"]);
  $item->setPostIssaBook($row["postIssaBook"]);
  $item->setPostDateModified($row["postDateModified"]);

  if ($row["postIssaBook"] == '1')
  {
    $sql = "SELECT * FROM Books WHERE postID = {$postID}";
    $result = $conn->query($sql);
    $bookRow = $result->fetch_assoc();
    $item->createBookSubClass($bookRow["bookTitle"], $bookRow["bookAuthor"], $bookRow["bookPages"]);
  }
  else
  {
    $sql = "SELECT * FROM Videos WHERE postID = {$postID}";
    $result = $conn->query($sql);
    $videoRow = $result->fetch_assoc();
    $item->createVideoSubClass($videoRow["videoTitle"], $videoRow["videoDuration"], $videoRow["videoGenre"]);
  }

  return $item->toJSON();
}

?>
