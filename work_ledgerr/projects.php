<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once 'db.php';

/* ================= 
  CLIENT AUTOCOMPLETE 
 ================= */
if (isset($_GET['term'])) {

    $term = $_GET['term'];

    $sql = "SELECT client_id, client_name 
            FROM client_management 
            WHERE client_name LIKE '%$term%' 
            LIMIT 10";

    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"    => (int)$row['client_id'],
            "label" => $row['client_name'],

        ];
    }

    echo json_encode($data);
    exit;
}


/* ================= 
    CREATE PROJECT 
   ================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);
    $project_name   = $data['project_name'];
    // $client_id  = $data['client_id'];
    // $members = $data['country_name'];

    $checkSql = "SELECT COUNT(*) AS total 
                 FROM project_management 
                 WHERE project_name='$project_name'";
    $stmt = $conn->prepare($checkSql);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode([
            'status' => 'error',
            'message' => 'Project  name already exists.'
        ]);
        exit;
    }

    if (
        empty($data['project_name']) ||
        empty($data['project_description']) ||
        empty($data['client_id']) ||
        empty($data['starting_date']) ||
        empty($data['end_date']) 
        // ||
        // empty($data['project_attach'])
    ) {
        echo json_encode(["status" => "error", "message" => "Invalid data"]);
        exit;
    }

    
    // $target_dir = 'uploads/';
    // $target_file = $target_dir . basename($_FILES['fileToUpload']['name']);
    // $uploadOk = 1;
    // $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
    // $allowed = ['jpg', 'jpeg', 'png', 'pdf', 'docx'];

    // if (!in_array($fileType, $allowed)) {
    //     echo json_encode(["status" => "error", "message" => "Invalid file type"]);
    //     exit;
    // }
    $project_name = $data['project_name'];
    $project_description = $data['project_description'];
    $client_id    = (int)$data['client_id'];
    // $members      = json_encode(array_map('intval', $data['members']));
    $starting_date = $data['starting_date'];
    $budget=$data['budget'];
    $estimatedHours=(float)$data['estimatedHours'];
    $end_date = $data['end_date'];
    // $project_attach = $data['project_attach'];   
    $stmt = $conn->prepare(
        "INSERT INTO project_management (project_name, project_description,client_id, budget_amount,starting_date,end_date,estimated_hours)
         VALUES ('$project_name','$project_description' ,'$client_id', '$budget','$starting_date','$end_date','$estimatedHours')"
    );


    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Project created"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}

/* ================= 
     PROJECT LIST 
   ================= */
if (isset($_GET['list'])) {

    $sql = "
        SELECT 
            p.project_id,
            p.project_name,
            p.project_description,
            p.client_id,
            c.client_name,
            p.budget_amount,
            p.starting_date,
            p.end_date,
            p.estimated_hours,
            p.status
        FROM project_management p
        JOIN client_management c ON c.client_id = p.client_id
        ORDER BY p.project_id DESC
    ";

    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit;
}

/* ==========================
   UPDATE PROJECT STATUS 
   ========================== */
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['status'])) {

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['project_id']) || empty($data['status'])) {
        echo json_encode(["status" => "error", "message" => "project_id and status required"]);
        exit;
    }

    $project_id = (int)$data['project_id'];
    $status = ($data['status'] === 'completed') ? 'completed' : 'pending';

    $stmt = $conn->prepare(
        "UPDATE project_management SET status = '$status' WHERE project_id = '$project_id'"
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Status updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}
/* ================= 
    UPDATE PROJECT 
   ================= */
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

     if (
        empty($data['project_id']) ||
        empty($data['project_name']) ||
        empty($data['project_description']) ||
        empty($data['client_id']) ||
        empty($data['starting_date']) ||
        empty($data['end_date'])
        // empty($data['status'])
    ) {
        echo json_encode(["status" => "error", "message" => "Invalid data"]);
        exit;
    }

    $project_id     = intval($data['project_id']);
    $project_name   = $data['project_name'];

    $checkSql = "SELECT COUNT(*) AS total 
                 FROM project_management 
                 WHERE project_id !='$project_id' AND project_name='$project_name'";
    $stmt = $conn->prepare($checkSql);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode([
            'status' => 'error',
            'message' => 'Project  name already exists.'
        ]);
        exit;
    }

   
    $project_id   = (int)$data['project_id'];
    $project_name = $data['project_name'];
    $project_description = $data['project_description'];
    $client_id    = (int)$data['client_id'];
    // $members      = json_encode(array_map('intval', $data['members']));
    $starting_date = $data['starting_date'];
    $end_date = $data['end_date'];
    $budget=$data['budget'];
    $estimatedHours=(float)$data['estimatedHours'];
    //   $status = ($data['status'] === 'completed') ? 'completed' : 'pending';
    $stmt = $conn->prepare(
        "UPDATE project_management
         SET project_name = '$project_name', project_description='$project_description' ,client_id = '$client_id',budget_amount='$budget', starting_date='$starting_date', end_date='$end_date',estimated_hours='$estimatedHours'
         WHERE project_id = '$project_id'"
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Project Updated Successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}

/* ================= 
    DELETE PROJECT 
   ================= */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['project_id'])) {
        echo json_encode(["status" => "error", "message" => "Project ID required"]);
        exit;
    }

    $project_id = (int)$data['project_id'];

    $stmt = $conn->prepare(
        "DELETE FROM project_management WHERE project_id = '$project_id'"
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Project deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}
