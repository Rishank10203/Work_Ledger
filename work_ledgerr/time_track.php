<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET,DELETE,PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once 'db.php';


/* ================= 
   TAsk AUTOCOMPLETE 
   ================= */
if (isset($_GET['terms'])) {

    $terms = $_GET['terms'];

    $sql = "SELECT t.task_id, t.task_name ,p.project_id,p.project_name
            FROM task_management t
            INNER JOIN project_management p ON t.project_id=p.project_id 
            WHERE task_name LIKE '%$terms%' 
            LIMIT 10";

    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"    => (int)$row['task_id'],
            "label" => $row['task_name'],
            "project_name" => $row['project_name']
        ];
    }

    echo json_encode($data);
    exit;
}


/* ================= 
     Track Submit
   ================= */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    foreach ($data['tasks'] as $task) {

        $task_id = (int)$task['task_id'];
        $task_date  = $task['task_date'];
        $task_start = $task['task_start'];
        $task_end   = $task['task_end'];
        // $notes      = $task['task_notes'];
        $total_hours = (float)$task['total_hours'];


        $stmt = $conn->prepare(
            "INSERT INTO time_tracking (task_date,task_id, task_start,task_end,total_duration)
         VALUES ('$task_date','$task_id','$task_start','$task_end','$total_hours')"
        );
        $result = $stmt->execute();
    }

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Task Timer created"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}


/* ================= 
     GET Duration
   ================= */

if (isset($_GET['list'])) {

    $sql = "
    SELECT 
        t1.timer_id,
        t1.task_date,
        t2.task_name,
        p.project_name,
        t1.task_start,
        t1.task_end,
        t1.total_duration AS total_hours
    FROM time_tracking t1
    JOIN task_management t2 ON t2.task_id = t1.task_id
    JOIN project_management p ON p.project_id = t2.project_id
    ORDER BY t1.timer_id DESC
";



    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit;
}


/* ================= 
    DELETE TIMER 
   ================= */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['timer_id'])) {
        echo json_encode(["status" => "error", "message" => "Task ID required"]);
        exit;
    }

    $timer_id = (int)$data['timer_id'];

    $stmt = $conn->prepare(
        "DELETE FROM time_tracking WHERE timer_id = '$timer_id'"
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Task deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}


/* ================= 
    UPDATE TIME TRACKER 
   ================= */
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);
    $timer_id = (int)$data['timer_id'];
    $task     = $data['tasks'][0];

    $task_id = (int)$task['task_id'];
    $task_date   = $task['task_date'];
    $task_start  = $task['task_start'];
    $task_end    = $task['task_end'];
    $total_hours = (float)($task['total_hours'] ?? 0);


    $stmt = $conn->prepare(
        "UPDATE time_tracking
         SET task_date= '$task_date',task_id='$task_id',task_start='$task_start', task_end='$task_end' ,
         total_duration='$total_hours'
         WHERE timer_id = '$timer_id'"
    );
    $result = $stmt->execute();

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Project Updated Successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}
