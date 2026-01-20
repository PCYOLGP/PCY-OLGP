<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log request for debugging
$log_data = sprintf("[%s] %s %s\n", date('Y-m-d H:i:s'), $_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
file_put_contents('debug.log', $log_data, FILE_APPEND);

require_once 'db_config.php';

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Improved path detection
$script_path = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($script_path, '', $request_uri);
$path = trim($path, '/');
$path_parts = explode('/', $path);

$resource = $path_parts[0] ?? '';
$id = $path_parts[1] ?? null;
$sub_resource = $path_parts[2] ?? null;

// Helper to get input data
function get_input() {
    return json_decode(file_get_contents('php://input'), true);
}

// Helper to send response
function send_response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// Routing
switch ($resource) {
    case 'status':
        try {
            $user_count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
            $post_count = $pdo->query("SELECT COUNT(*) FROM posts")->fetchColumn();
            send_response([
                'status' => 'ok',
                'database' => 'connected',
                'users' => $user_count,
                'posts' => $post_count,
                'php_version' => phpversion()
            ]);
        } catch (Exception $e) {
            send_response([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
        break;

    case 'login':
        if ($method === 'POST') {
            $data = get_input();
            
            // Check if table is empty first
            $check = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
            if ($check == 0) {
                send_response(['error' => 'Database is empty. Please run migrate.php first.'], 500);
            }

            $stmt = $pdo->prepare("SELECT id, username, email, image, bio, fname, lname FROM users WHERE username = ? AND password = ?");
            $stmt->execute([$data['username'], $data['password']]);
            $user = $stmt->fetch();
            if ($user) {
                send_response($user);
            } else {
                send_response(['error' => 'Invalid credentials'], 401);
            }
        }
        break;

    case 'users':
        if ($method === 'GET') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT id, username, email, image, bio, fname, lname FROM users WHERE id = ?");
                $stmt->execute([$id]);
                send_response($stmt->fetch());
            } else if (isset($_GET['username'])) {
                $stmt = $pdo->prepare("SELECT id, username, email, image, bio, fname, lname FROM users WHERE username = ?");
                $stmt->execute([$_GET['username']]);
                send_response($stmt->fetchAll());
            } else {
                $stmt = $pdo->query("SELECT id, username, email, image, bio, fname, lname FROM users");
                send_response($stmt->fetchAll());
            }
        } else if ($id && $method === 'PATCH') {
            $data = get_input();
            $fields = [];
            $params = [];
            foreach ($data as $key => $value) {
                if (in_array($key, ['username', 'email', 'bio', 'fname', 'lname', 'image'])) {
                    $fields[] = "$key = ?";
                    $params[] = $value;
                }
            }
            if ($fields) {
                $params[] = $id;
                $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
                $stmt->execute($params);
                
                $stmt = $pdo->prepare("SELECT id, username, email, image, bio, fname, lname FROM users WHERE id = ?");
                $stmt->execute([$id]);
                send_response($stmt->fetch());
            }
        } else if ($id && $sub_resource === 'profile-image' && $method === 'POST') {
            if (isset($_FILES['image'])) {
                $upload_dir = '../public/profile/';
                if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
                
                $filename = time() . '_' . $_FILES['image']['name'];
                $upload_path = $upload_dir . $filename;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_path)) {
                    $image_url = 'profile/' . $filename;
                    $stmt = $pdo->prepare("UPDATE users SET image = ? WHERE id = ?");
                    $stmt->execute([$image_url, $id]);
                    
                    $stmt = $pdo->prepare("SELECT id, username, email, image, bio, fname, lname FROM users WHERE id = ?");
                    $stmt->execute([$id]);
                    send_response($stmt->fetch());
                } else {
                    send_response(['error' => 'Upload failed'], 500);
                }
            }
        }
        break;

    case 'posts':
        if ($method === 'GET') {
            if ($id === null) {
                $stmt = $pdo->query("SELECT * FROM posts ORDER BY timestamp DESC");
                $posts = $stmt->fetchAll();
                
                // Fetch likes and comments for each post
                foreach ($posts as &$post) {
                    $stmtLikes = $pdo->prepare("SELECT * FROM likes WHERE post_id = ?");
                    $stmtLikes->execute([$post['id']]);
                    $post['likes'] = $stmtLikes->fetchAll();

                    $stmtComments = $pdo->prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY timestamp ASC");
                    $stmtComments->execute([$post['id']]);
                    $post['comments'] = $stmtComments->fetchAll();
                }
                send_response($posts);
            } else if ($id && $sub_resource === 'comments') {
                if ($method === 'GET') {
                    $stmt = $pdo->prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY timestamp ASC");
                    $stmt->execute([$id]);
                    send_response($stmt->fetchAll());
                } else if ($method === 'POST') {
                    $data = get_input();
                    $stmt = $pdo->prepare("INSERT INTO comments (post_id, username, comment) VALUES (?, ?, ?)");
                    $stmt->execute([$id, $data['username'], $data['comment']]);
                    $new_id = $pdo->lastInsertId();
                    
                    $stmt = $pdo->prepare("SELECT * FROM comments WHERE id = ?");
                    $stmt->execute([$new_id]);
                    send_response($stmt->fetch());
                }
            } else if ($id && $sub_resource === 'toggle-like') {
                if ($method === 'POST') {
                    $data = get_input();
                    // Check if exists
                    $stmt = $pdo->prepare("SELECT id FROM likes WHERE post_id = ? AND user_id = ?");
                    $stmt->execute([$id, $data['userId']]);
                    if ($stmt->fetch()) {
                        $stmt = $pdo->prepare("DELETE FROM likes WHERE post_id = ? AND user_id = ?");
                        $stmt->execute([$id, $data['userId']]);
                        send_response(['success' => true, 'liked' => false]);
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO likes (post_id, user_id) VALUES (?, ?)");
                        $stmt->execute([$id, $data['userId']]);
                        send_response(['success' => true, 'liked' => true]);
                    }
                }
            } else if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM posts WHERE id = ?");
                $stmt->execute([$id]);
                send_response($stmt->fetch());
            }
        } else if ($method === 'POST') {
            // Handle post creation with image upload
            if (isset($_FILES['image'])) {
                $upload_dir = '../public/pcy-wall/';
                if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
                
                $filename = time() . '_' . $_FILES['image']['name'];
                $upload_path = $upload_dir . $filename;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_path)) {
                    $image_url = 'pcy-wall/' . $filename;
                    $caption = $_POST['caption'] ?? '';
                    $username = $_POST['username'] ?? 'Anonymous';
                    
                    $stmt = $pdo->prepare("INSERT INTO posts (username, image, caption) VALUES (?, ?, ?)");
                    $stmt->execute([$username, $image_url, $caption]);
                    $new_id = $pdo->lastInsertId();
                    
                    $stmt = $pdo->prepare("SELECT * FROM posts WHERE id = ?");
                    $stmt->execute([$new_id]);
                    send_response($stmt->fetch());
                } else {
                    send_response(['error' => 'Upload failed'], 500);
                }
            }
        } else if ($id && $method === 'PATCH') {
            $data = get_input();
            $stmt = $pdo->prepare("UPDATE posts SET caption = ? WHERE id = ?");
            $stmt->execute([$data['caption'], $id]);
            
            $stmt = $pdo->prepare("SELECT * FROM posts WHERE id = ?");
            $stmt->execute([$id]);
            send_response($stmt->fetch());
        } else if ($id && $method === 'DELETE') {
            $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
            $stmt->execute([$id]);
            send_response(['success' => true]);
        }
        break;

    default:
        send_response(['error' => 'Resource not found: ' . $resource], 404);
        break;
}
?>
