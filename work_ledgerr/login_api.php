<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST,GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type,Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');
session_start();
include 'db.php';

$response = [
    "success" => "",
    "message" => "",
    "errors" =>[],  
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

        $email = $data['email'];
        $password = $data['password'];

        $emailsql = "SELECT password,id,fullName FROM admin
                WHERE email='$email'";

        $result = mysqli_query($conn, $emailsql);

        if ( mysqli_num_rows($result) === 0) {
            $response['errors']['email'] = "Email not registered";
        } else {
            if($row=$result->fetch_assoc()){
            // $valid =password_verify($password,$row['password']);
            // $hashPassword=$row['password'];
            if(password_verify($password,$row['password'])){
                $token=bin2hex(random_bytes(32));
                $response = [
                "success" => "success",
                "message" => "Login successful",
                "token" =>$token,
                "user" =>[
                    "id"=>$row['id'],
                    "name"=>$row['fullName'],
                    "email"=>$email,
                ],
            ];
            }else{
            $response['errors']['password'] = "Incorrect password";
            }
        }
    }
 
}

echo json_encode($response);
exit;
