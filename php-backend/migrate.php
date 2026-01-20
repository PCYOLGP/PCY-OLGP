<?php
require_once 'db_config.php';

$json_data = file_get_contents('../db.json');
$data = json_decode($json_data, true);

$pdo->exec("SET sql_mode='NO_AUTO_VALUE_ON_ZERO'");

// Migrate Users
if (isset($data['users'])) {
    $stmt = $pdo->prepare("INSERT INTO users (id, username, password, email, bio, fname, mname, lname, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username=VALUES(username)");
    foreach ($data['users'] as $user) {
        $stmt->execute([
            $user['id'],
            $user['username'],
            $user['password'],
            $user['email'] ?? '',
            $user['bio'] ?? '',
            $user['fname'] ?? '',
            $user['mname'] ?? '',
            $user['lname'] ?? '',
            $user['image'] ?? ''
        ]);
    }
    echo "Users migrated.\n";
}

// Migrate Posts
if (isset($data['posts'])) {
    $stmt = $pdo->prepare("INSERT INTO posts (id, username, image, caption, timestamp) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=VALUES(id)");
    foreach ($data['posts'] as $post) {
        $stmt->execute([
            $post['id'],
            $post['username'],
            $post['image'],
            $post['caption'],
            isset($post['timestamp']) ? date('Y-m-d H:i:s', strtotime($post['timestamp'])) : date('Y-m-d H:i:s')
        ]);
    }
    echo "Posts migrated.\n";
}

// Migrate Comments
if (isset($data['comments'])) {
    $stmt = $pdo->prepare("INSERT INTO comments (id, post_id, username, comment, timestamp) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=VALUES(id)");
    foreach ($data['comments'] as $comment) {
        $stmt->execute([
            $comment['id'],
            $comment['post_id'],
            $comment['username'] ?: 'Anonymous',
            $comment['comment'],
            (isset($comment['timestamp']) && $comment['timestamp']) ? date('Y-m-d H:i:s', strtotime($comment['timestamp'])) : date('Y-m-d H:i:s')
        ]);
    }
    echo "Comments migrated.\n";
}

// Migrate Likes
if (isset($data['likes'])) {
    $stmt = $pdo->prepare("INSERT INTO likes (id, post_id, user_id, timestamp) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=VALUES(id)");
    foreach ($data['likes'] as $like) {
        $stmt->execute([
            $like['id'],
            $like['post_id'],
            $like['user_id'],
            isset($like['timestamp']) ? date('Y-m-d H:i:s', strtotime($like['timestamp'])) : date('Y-m-d H:i:s')
        ]);
    }
    echo "Likes migrated.\n";
}

echo "Migration completed.\n";
?>
