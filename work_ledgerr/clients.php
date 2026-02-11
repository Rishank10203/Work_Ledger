<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods:POST, GET,DELETE,PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
   http_response_code(200);
   exit;
}
include_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   $data = json_decode(file_get_contents('php://input'), true);

   $client_name   = $data['client_name'];
   $client_email  = $data['client_email'];
   $company_details =$data['company_details'];
   $country_name = $data['country_name'];

   $checkSql = "SELECT COUNT(*) AS total 
                 FROM client_management 
                 WHERE client_email = '$client_email' OR client_name = '$client_name'";
   $stmt = $conn->prepare($checkSql);
   $stmt->execute();
   $result = $stmt->get_result();
   $row = $result->fetch_assoc();

   if ($row['total'] > 0) {
      http_response_code(409);
      echo json_encode([
         'status' => 'error',
         'message' => 'Client email or name already exists.'
      ]);
      exit;
   }

   $sql = "INSERT INTO client_management (client_name, client_email,company_details, country)
            VALUES ('$client_name', '$client_email', '$company_details','$country_name')";

   if (mysqli_query($conn, $sql)) {
      echo json_encode(['message' => 'Client is successfully created.']);
   }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   $sql1 = "SELECT * FROM client_management";
   $result = $conn->query($sql1);

   $clients = [];

   if ($result->num_rows > 0) {
      while ($row = $result->fetch_assoc()) {
         $clients[] = $row;
      }
   }

   echo json_encode($clients);
   exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
   $data = json_decode(file_get_contents('php://input'), true);
   $client_id = intval($data['client_id']);


   $checkSql = "SELECT COUNT(*) AS total FROM project_management WHERE client_id = '$client_id'";
   $checkResult = mysqli_query($conn, $checkSql);
   $row = mysqli_fetch_assoc($checkResult);

   if ($row['total'] > 0) {
      http_response_code(409);
      echo json_encode([
         'status' => 'error',
         'message' => 'Client data cannot be deleted because project is linked.'
      ]);
      exit;
   }
   $sql = "DELETE FROM client_management WHERE client_id='$client_id'";
   if (mysqli_query($conn, $sql)) {
      echo json_encode(['message' => 'Deleted Data Successfully']);
   } else {
      echo json_encode(['message' => 'Error in deleting the data', 'error' => mysqli_error($conn)]);
   }
}
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
   $data = json_decode(file_get_contents('php://input'), true);

   $client_id     = intval($data['client_id']);
   $client_name   = $data['client_name'];
   $client_email  = $data['client_email'];
   $company_details=$data['company_details'];
   $country_name = $data['country_name'];

   $checkSql = "SELECT COUNT(*) AS total 
                FROM client_management 
                WHERE (client_email = '$client_email' OR client_name = '$client_name')
                AND client_id != '$client_id'";

   $stmt = $conn->prepare($checkSql);
   $stmt->execute();
   $result = $stmt->get_result();
   $row = $result->fetch_assoc();

   if ($row['total'] > 0) {
      http_response_code(409);
      echo json_encode([
         'status' => 'error',
         'message' => 'Client name or email already exists.'
      ]);
      exit;
   }

   $sql = "UPDATE client_management 
           SET client_name='$client_name', client_email='$client_email',company_details='$company_details', country='$country_name'
           WHERE client_id='$client_id'";

   $stmt = $conn->prepare($sql);

   if ($stmt->execute()) {
      echo json_encode(['message' => 'Client updated successfully']);
   } else {
      http_response_code(500);
      echo json_encode(['error' => $stmt->error]);
   }
}
