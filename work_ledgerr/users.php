<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET,DELETE,PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $type = $_GET['type'];

    if ($type === 'roles') {
        $sql = "SELECT role_id, role_name FROM roles";
        $result = $conn->query($sql);

        $roles = [];
        while ($row = $result->fetch_assoc()) {
            $roles[] = $row;
        }
        echo json_encode($roles);
        exit;
    }


    if ($type === 'users') {
        $sql = "SELECT 
                    user_id,
                    user_name,
                    user_email,
                    user_number,
                    role_name
                FROM user_management";

        $result = $conn->query($sql);

        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode($users);
        exit;
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $user_name  = $data['user_name'];
    $user_email = $data['user_email'];
    $user_number = $data['user_number'];
    $role_name    = $data['role_name'];
    $checkSql = "SELECT COUNT(*) AS total 
                 FROM user_management 
                 WHERE user_email = '$user_email' OR user_number = '$user_number'";
   $stmt = $conn->prepare($checkSql);
   $stmt->execute();
   $result = $stmt->get_result();
   $row = $result->fetch_assoc();

   if ($row['total'] > 0) {
      http_response_code(409);
      echo json_encode([
         'status' => 'error',
         'message' => 'User details already exists.'
      ]);
      exit;
   }

    $sql = "INSERT INTO user_management (user_name, user_email,user_number, role_name)
            VALUES ('$user_name', '$user_email','$user_number', '$role_name')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "User was successfully created"]);
    } else {
        echo json_encode(["error" => $conn->error]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['user_id'])) {
        // http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }

    $user_id = intval($data['user_id']);


    $checkSql = "
SELECT COUNT(*) AS total
FROM project_management
WHERE JSON_CONTAINS(team_member, JSON_ARRAY($user_id))
";

    $checkResult = mysqli_query($conn, $checkSql);
    $row = mysqli_fetch_assoc($checkResult);

    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'User cannot be deleted because a project is already assigned.'
        ]);
        exit;
    }

    $sql = "DELETE FROM user_management WHERE user_id = $user_id";

    if (mysqli_query($conn, $sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting user',
            'error' => mysqli_error($conn)
        ]);
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $user_id     = intval($data['user_id']);
    $user_name   = $data['user_name'];
    $user_email  = $data['user_email'];
    $user_number  = $data['user_number'];
    $role_name = $data['role_name'];

    $checkSql = "SELECT COUNT(*) AS total 
                FROM user_management 
                WHERE (user_email = '$user_email' OR user_name = '$user_name' OR user_number='$user_number')
                AND user_id != '$user_id'";

    $stmt = $conn->prepare($checkSql);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode([
            'status' => 'error',
            'message' => 'User details already exists.'
        ]);
        exit;
    }

    $sql = "UPDATE user_management 
           SET user_name='$user_name', user_email='$user_email',user_number='$user_number', role_name='$role_name'
           WHERE user_id='$user_id'";

    $stmt = $conn->prepare($sql);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'User updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $stmt->error]);
    }
}
