<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET,DELETE,PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once 'db.php';


/* ================= 
   USER AUTOCOMPLETE 
   ================= */
if (isset($_GET['terms'])) {

    $terms = $_GET['terms'];

    $sql = "SELECT user_id, user_name ,user_email
            FROM user_management
            WHERE user_name LIKE '%$terms%' 
            LIMIT 10";

    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"    => (int)$row['user_id'],
            "label" => $row['user_name'],
            "email" => $row['user_email']
        ];
    }

    echo json_encode($data);
    exit;
}


/* ================= 
   Project AUTOCOMPLETE 
   ================= */

if (isset($_GET['project_term'])) {

    $term = $_GET['project_term'];

    $sql = "
        SELECT 
            p.project_id,
            p.project_name,
            c.client_name
        FROM project_management p
        INNER JOIN client_management c 
            ON p.client_id = c.client_id
        WHERE p.project_name LIKE '%{$term}%'
        LIMIT 10
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"          => (int)$row['project_id'],
            "label"       => $row['project_name'],
            "client_name" => $row['client_name']
        ];
    }

    echo json_encode($data);
    exit;
}

/* ================= 
     Task Submit
   ================= */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $project_id = (int)$data['project_id'];
    $billable_type=(int)$data['billable_type'];

    foreach ($data['tasks'] as $task) {

        $task_name = $task['task_name'];
        $task_description = $task['task_description'];
        $team_member = (int)$task['team_member'];
        $due_date = $task['due_date'];

        $stmt = $conn->prepare(
            "INSERT INTO task_management (project_id,billable_type, task_name,task_description,team_member,due_date)
         VALUES ('$project_id','$billable_type','$task_name' ,'$task_description','$team_member', '$due_date')"
        );
        $result = $stmt->execute();
    }

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Project created"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}


/* ================= 
     GET TASKS
   ================= */

if (isset($_GET['list'])) {

    $sql = "
        SELECT 
            t.task_id,
            p.project_id,
            p.project_name,
            t.billable_type,
            t.task_name,
            t.task_description,
            u.user_id,
            u.user_name,
            t.due_date,
            t.status
        FROM task_management t
        JOIN project_management p ON p.project_id = t.project_id
        JOIN user_management u ON u.user_id=t.team_member
        ORDER BY t.task_id DESC
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


/* ================= 
    UPDATE PROJECT 
   ================= */
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);
    $task_id   = (int)$data['task_id'];
    $project_id = (int)$data['project_id'];
    $billable_type=(int)$data['billable_type'];
    $task = $data['tasks'][0];

    $task_name = $task['task_name'];
    $task_description = $task['task_description'];
    $team_member = (int)$task['team_member'];
    $due_date = $task['due_date'];

    $stmt = $conn->prepare(
        "UPDATE task_management
         SET project_id = '$project_id',billable_type='$billable_type',task_name='$task_name', task_description='$task_description' ,team_member = '$team_member', due_date='$due_date'
         WHERE task_id = '$task_id'"
    );
    $result = $stmt->execute();

    if ($result) {
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

    if (empty($data['task_id'])) {
        echo json_encode(["status" => "error", "message" => "Task ID required"]);
        exit;
    }

    $task_id = (int)$data['task_id'];

    $stmt = $conn->prepare(
        "DELETE FROM task_management WHERE task_id = '$task_id'"
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Task deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}
