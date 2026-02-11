<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET,DELETE,PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once 'db.php';
if (isset($_GET['projects'])) {
    $sql = "SELECT project_id, project_name FROM project_management";
    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit;
}

if (isset($_GET['list'])) {

    $projectId = isset($_GET['project_id']) ? (int)$_GET['project_id'] : 0;

    $sql = "
    SELECT 
        t.task_id,
        t.task_name,
        t.status,
        p.project_name,
        u.user_name,
        t.due_date,
        t.project_id,
        GROUP_CONCAT(
  CONCAT(n.notes_id, '::', n.notes, '::', n.notes_status)
  SEPARATOR '||'
) AS notes
    FROM task_management t
    JOIN project_management p ON p.project_id = t.project_id
    JOIN user_management u ON u.user_id = t.team_member
    LEFT JOIN task_notes n ON n.task_id = t.task_id
    WHERE t.project_id = '$projectId'
    GROUP BY t.task_id
    ORDER BY t.task_id
";

    // JOIN task_notes t1 ON t1.task_id = t.task_id
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit;
}
/* ========================== UPDATE NOTE STATUS ========================== */
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['note_status'])) {

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['id']) || empty($data['status'])) {
        echo json_encode(["status" => "error", "message" => "Invalid data"]);
        exit;
    }

    $id     = (int)$data['id'];
    $status = ($data['status'] === 'completed') ? 'completed' : 'pending';

    $stmt = $conn->prepare(
        "UPDATE task_notes SET notes_status = ? WHERE notes_id = ?"
    );
    $stmt->bind_param("si", $status, $id);

    echo json_encode(["status" => $stmt->execute() ? "success" : "error"]);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

    $task_id = (int)$data['task_id'];

    if (isset($data['status'])) {

        $status = $data['status'];
        $stmt = $conn->prepare(
            "UPDATE task_management SET status = '$status' WHERE task_id = '$task_id'"
        );
        $stmt->execute();

        echo json_encode([
            "status" => "success",
            "message" => "Task status updated"
        ]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $task_id = (int)$_POST['task_id'];
    $note    = $_POST['note'];

    $filePath = null;

    if (!empty($_FILES['file']['name'])) {

        $uploadDir = "uploads/task_files/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = time() . "_" . basename($_FILES['file']['name']);
        $filePath = $uploadDir . $fileName;

        if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
            echo json_encode([
                "status" => "error",
                "message" => "File upload failed"
            ]);
            exit;
        }
    }

    $stmt = $conn->prepare(
        "INSERT INTO task_notes (task_id, notes, file)
         VALUES ('$task_id', '$note', '$filePath')"
    );
    $stmt->execute();

    echo json_encode([
        "status" => "success",
        "message" => "Note and file saved"
    ]);
    exit;
}


/* ================= 
    DELETE Notes
   ================= */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['id'])) {
        echo json_encode(["status" => "error", "message" => "Project ID required"]);
        exit;
    }

    $id = (int)$data['id'];

    $stmt = $conn->prepare(
        "DELETE FROM task_notes WHERE notes_id = '$id'"
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Project deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}
