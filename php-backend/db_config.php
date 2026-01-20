<?php
$host = 'localhost';
$db   = 'pcy_webdoc';
$user = 'root';
$pass = ''; // Default XAMPP password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     if (php_sapi_name() !== 'cli') {
         header("Content-Type: application/json");
         http_response_code(500);
         echo json_encode([
             'error' => 'Database connection failed',
             'message' => $e->getMessage()
         ]);
         exit();
     }
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>
