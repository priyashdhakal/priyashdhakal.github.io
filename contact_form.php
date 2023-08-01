<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $to_email = "priyashdhakal@jbnu.ac.kr"; // Replace with your email address
  $subject = "Contact Form Submission";
  $name = $_POST["name"];
  $email = $_POST["email"];
  $message = $_POST["message"];
  
  // Validate the data (you can add more validation as needed)
  if (empty($name) || empty($email) || empty($message)) {
    echo "Please fill out all the fields.";
    exit;
  }

  // Compose the email
  $headers = "From: $name <$email>\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "Content-Type: text/plain; charset=utf-8\r\n";

  // Send the email
  if (mail($to_email, $subject, $message, $headers)) {
    echo "Email sent successfully!";
  } else {
    echo "Error: Unable to send the email. Please try again later.";
  }
}
?>
