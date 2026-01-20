<?php
require_once 'db_config.php';
try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    echo "Connection successful. User count: " . $stmt->fetchColumn() . "\n";
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>
