<?php

$servername = 'localhost'; // default server name
$serverusername = 'cscicsuf'; // user name that you created
$serverpassword = "3GwzlRP8zSsSfzWW";// password that you created
$dbname = 'project';

if (!empty($_POST))
{
  $username = $_POST['userName'];
  $passWord = $_POST['password'];
  $email = $_POST['email'];

  // Create connection
  $conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);

  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error ."<br>");
  }


  $stmt = $conn->prepare("SELECT * FROM Users WHERE username = ?");
  if ($stmt==FALSE)
  {
  	echo "There is a problem with prepare <br>";
  	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
  }
  $stmt->bind_param("s", $userName);

  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows != 0)      // No results are returned, username exists
  {
    echo "username already exists";
    return;
  }

  $stmt = $conn->prepare("SELECT * FROM Users WHERE email = ?");
  if ($stmt==FALSE)
  {
  	echo "There is a problem with prepare <br>";
  	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
  }
  $stmt->bind_param("s", $email);

  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows != 0)     // No results are returned, email exists
  {
    echo "email already exists";
    return;
  }

  $passWord = $conn->real_escape_string($passWord);
  $x = 0;

  // Initial values for all columns
  $stmt = $conn->prepare("INSERT INTO Users (username, password, email, fname, lname, address, admin) VALUES (?,?,?,'NULL','NULL','NULL',0)");
  if ($stmt==FALSE)
  {
  	echo "There is a problem with prepare <br>";
  	echo $conn->error; // Need to connect/reconnect before the prepare call otherwise it doesnt work
  }
  $stmt->bind_param("sss", $username, $passWord, $email);

  if ($stmt->execute() === TRUE)      // result is returned
  {
    echo "New record created successfully";
  }
  else
  {
    echo "Error: " . $sql . "<br>" . $conn->error;
  }

  $conn->close();
}
else
{
  echo "Error 2";
}

?>
