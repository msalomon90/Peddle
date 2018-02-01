<?php

class User
{
  private $userID;
  private $userName;
  private $password;
  private $firstName;
  private $lastName;
  private $emailAddress;
  private $address;

  // get functions for user
  public function getuserID()
  {
    return $this->userID;
  }

  public function getuserName()
  {
    return $this->userName;
  }

  public function getpassword()
  {
    return $this->password;
  }

  public function getFirstName()
  {
    return $this->firstName;
  }

  public function getLastName()
  {
    return $this->lastName;
  }

  public function getEmailAddress()
  {
    return $this->emailAddress;
  }

  public function getAddress()
  {
    return $this->address;
  }

  // set functions for user
  public function setFirstName($name)
  {
    $this->firstName = $name;
  }

  public function setLastName($name)
  {
    $this->lastName = $name;
  }

  public function setEmailAddress($email)
  {
    $this->emailAddress = $email;
  }

  public function setAddress($add)
  {
    $this->address = $add;
  }

  public function setUserID($uID)
  {
    $this->userID = $uID;
  }

  public function setUserName($name)
  {
    $this->userName = $name;
  }

  public function setPassword($pw)
  {
    $this->password = $pw;
  }

  public function displayAll()     // print function
  {
    echo "User Class";
    newLine();
    foreach ($this as $key => $value)
    {
     echo "-- User $key : $value";
     newLine();
    }
  }

  public function expose()
  {
    return get_object_vars($this);
  }

  public function toJSON()
  {
    $json = "";

    return json_encode($this->expose());
  }
}

class Book
{
  private $bookTitle;
  private $bookAuthor;
  private $bookPages;

  // get functions  for book
  public function getBookTitle()
  {
    return $this->bookTitle;
  }

  public function setBookTitle($value)
  {
    $this->bookTitle = $value;
  }

  public function getBookAuthor()
  {
    return $this->bookAuthor;
  }

  public function setBookAuthor($value)
  {
    $this->bookAuthor = $value;
  }

  public function getBookPages()
  {
    return $this->bookPages;
  }

  // set functions for book
  public function setBookPages($value)
  {
    $this->bookPages = $value;
  }

  public function expose()
  {
    return get_object_vars($this);
  }

  public function toJSON()
  {
    $json = "";

    return json_encode($this->expose());
  }
}

class Video
{
  private $videoTitle;
  private $videoDuration;
  private $videoGenre;

  // get functions for video
  public function getVideoTitle()
  {
    return $this->videoTitle;
  }

  public function setVideoTitle($value)
  {
    $this->videoTitle = $value;
  }

  public function getVideoDuration()
  {
    return $this->videoDuration;
  }

  public function setVideoDuration($value)
  {
    $this->videoDuration = $value;
  }

  public function getVideoGenre()
  {
    return $this->videoGenre;
  }
  // set functions for video
  public function setVideoGenre($value)
  {
    $this->videoGenre = $value;
  }

  public function expose()
  {
    return get_object_vars($this);
  }

  public function toJSON()
  {
    $json = "";

    return json_encode($this->expose());
  }
}

// Object refers to post item
class Item
{
  private $postID;
  private $postUsername;
  private $postTitle;
  private $postDescription;
  private $postImage;
  private $postDateCreated;
  private $postPrice;
  private $postDateModified;
  private $postIssaBook;
  private $subClass;

  // Book info
  public function createBookSubClass($bookTitle, $bookAuthor, $bookPages)
  {
    $x = new Book();     // book object used to set book info

    $x->setBookTitle($bookTitle);
    $x->setBookAuthor($bookAuthor);
    $x->setBookPages($bookPages);

    $y = $x->toJSON();

    $this->subClass = $y;
  }

  // Video info
  public function createVideoSubClass($videoTitle, $videoDuration, $videoGenre)
  {
    $x = new Video();     // video object used to set video info

    $x->setVideoTitle($videoTitle);
    $x->setVideoGenre($videoGenre);
    $x->setVideoDuration($videoDuration);

    $y = $x->toJSON();

    $this->subClass = $y;
  }

  // get/set functions for item
  public function getSubClass()
  {
    return $this->subClass;
  }

  public function getPostID()
  {
    return $this->postID;
  }

  public function setPostID($value)
  {
    $this->postID = $value;
  }

  public function getPostUsername()
  {
    return $this->postUsername;
  }

  public function setPostUsername($value)
  {
    $this->postUsername = $value;
  }

  public function getPostTitle()
  {
    return $this->postTitle;
  }

  public function setPostTitle($value)
  {
    $this->postTitle = $value;
  }

  public function getPostDescription()
  {
    return $this->postDescription;
  }

  public function setPostDescription($value)
  {
    $this->postDescription = $value;
  }

  public function getPostImage()
  {
    return $this->postImage;
  }

  public function setPostImage($value)
  {
    $this->postImage = $value;
  }

  public function getPostDateCreated()
  {
    return $this->postDateCreated;
  }

  public function setPostDateCreated($value)
  {
    $this->postDateCreated = $value;
  }

  public function getPostPrice()
  {
    return $this->postPrice;
  }

  public function setPostPrice($value)
  {
    $this->postPrice = $value;
  }

  public function getPostDateModified()
  {
    return $this->postDateModified;
  }

  public function setPostDateModified($value)
  {
    $this->postDateModified = $value;
  }

  public function getPostIssaBook()
  {
    return $this->postIssaBook;
  }

  public function setPostIssaBook($value)
  {
    $this->postIssaBook = $value;
  }

  public function displayAll()          // print function
  {
    echo "Item Class";
    newLine();
    foreach ($this as $key => $value)
    {
     echo "-- Item $key : $value";
     newLine();
    }
  }

  public function expose()
  {
    return get_object_vars($this);
  }

  public function toJSON()
  {
    $json = "";

    return json_encode($this->expose());
  }
}



?>
