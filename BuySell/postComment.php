<?php

$servername = 'localhost'; // default server name
$serverusername = 'cscicsuf'; // user name that you created
$serverpassword = "3GwzlRP8zSsSfzWW";// password that you created
$dbname = 'project';

if(!empty($_POST)){
  $postID = $_POST["postID"];
  $postUsername = $_POST["postUsername"];
  $text = $_POST["text"];

  // Create connection
  $conn = new mysqli($GLOBALS['servername'], $GLOBALS['serverusername'], $GLOBALS['serverpassword'], $GLOBALS['dbname']);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }

  $sql = "SELECT MAX(commentID) AS cID FROM Comments";        // Query to selects most recent comment
  $result = $conn->query($sql);

  if ($result->num_rows != 0)          // Results returned increment comment ID value for new comment
  {
    $row = $result->fetch_assoc();
    $commentID = $row["cID"];
    $commentID = $commentID + 1;
  }
  else
  {
    $commentID = 0;                    // first comment
  }

  $text = $conn->real_escape_string($text);
  $date = date("Y-m-d");

  // Insert comment into comments table with correct comment ID
  $stmt = $conn->prepare("INSERT INTO Comments (commentID, postID, postUsername, commentText, commentDate) VALUES (?, ?, ?, ?, ?)");
  if ($stmt==FALSE)
  {
  	echo "There is a problem with prepare <br>";
  	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
  }
  $stmt->bind_param("iisss", $commentID, $postID, $postUsername, $text, $date);

  if ($stmt->execute() === TRUE)      // Query successful
  {
    echo "Good News! Comment Posted";
  }
  else
  {
    echo "Error: " . $sql . "<br>" . $conn->error;
  }

  $conn->close();

  return;
}

?>
