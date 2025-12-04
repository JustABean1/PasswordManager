<?php
session_start();
// Set response content type to JSON
header("Content-Type: application/json");

// ---------------------------
// DATABASE CONNECTION
// ---------------------------

$servername = "localhost";
$server_username = "CS344";
$server_password = "CS344F25";
$dbname = "CS344F25";

// Create connection
$conn = new mysqli($servername, $server_username, $server_password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// ---------------------------
// ENCRYPTION/DECRYPTION FUNCTIONS
// ---------------------------

// ENCRYPTION KEY
$encryption_key = "fkg244dsf3g34n34dgdfgdg4435ddg34";

// ENCRYPT PASSWORD
function encryptPassword($password, $key)
{
    // generate random psuedo bytes for iv
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('AES-256-CBC'));
    
    // encrypt password
    $encrypted = openssl_encrypt($password, 'AES-256-CBC', $key, 0, $iv);
    
    // return encrypted password with base64 encoding
    return base64_encode($iv . $encrypted);
}

// DECRYPT PASSWORD
function decryptPassword($encrypted_data, $key)
{
    // decode the base64 encoded data
    $data = base64_decode($encrypted_data);
    
    // extract iv
    $iv_length = openssl_cipher_iv_length('AES-256-CBC');
    $iv = substr($data, 0, $iv_length);
    
    // extract password
    $encrypted = substr($data, $iv_length);
    
    // return decrypted password
    return openssl_decrypt($encrypted, 'AES-256-CBC', $key, 0, $iv);
}

// ---------------------------
// AUTHENTICATION FUNCTIONS
// ---------------------------

// LOGIN
function login($conn, $username, $password)
{
    // prepare query
    $stmt = $conn->prepare("SELECT id, password FROM PasswordManager_users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    // check if user exists
    if ($stmt->num_rows === 0) {
        echo json_encode([
            "success" => false, 
            "message" => "User not found!"
        ]);
        return;
    }

    // initialize to avoid "unassigned variable" warnings
    $user_id = null;
    $hashed_password = null;

    $stmt->bind_result($user_id, $hashed_password);
    $stmt->fetch();

    // verify password
    if (password_verify($password, $hashed_password)) {
        // save user_id in session
        $_SESSION["user_id"] = $user_id;

        echo json_encode([
            "success" => true,
            "user_id" => $user_id,
            "message" => "Login successful!"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Incorrect password!"
        ]);
    }
}

// SIGNUP
function signup($conn, $username, $password)
{
    // prepare query
    $stmt = $conn->prepare("SELECT id FROM PasswordManager_users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    // check if username already exists
    if ($stmt->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "Username already exists!"
        ]);
        return;
    }
    $stmt->close();

    // hash the users password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // add new user to database
    $stmt = $conn->prepare("INSERT INTO PasswordManager_users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "User created!"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to create user!"
        ]);
    }

    $stmt->close();
}

// ---------------------------
// PASSWORD MANAGEMENT FUNCTIONS
// ---------------------------

// LOAD PASSWORDS
function loadPasswords($conn, $user_id)
{
    global $encryption_key;
    
    // prepare query to fetch passwords for the user
    $stmt = $conn->prepare("SELECT id, site, site_user, site_pass FROM PasswordManager_passwords WHERE user_id = ? ORDER BY id DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $passwords = [];

    // add each password to the array and decrypt site_pass
    while ($row = $result->fetch_assoc()) {
        // decrypt password
        $row['site_pass'] = decryptPassword($row['site_pass'], $encryption_key);
        $passwords[] = $row;
    }

    echo json_encode([
        "success" => true, 
        "passwords" => $passwords
    ]);

    $stmt->close();
}

// ADD PASSWORD
function addPassword($conn, $user_id, $site, $site_user, $site_pass)
{
    global $encryption_key;
    
    // check for missing fields
    if (!$user_id || empty($site) || empty($site_user) || empty($site_pass)) {
        echo json_encode([
            "success" => false, 
            "message" => "Missing fields!"
        ]);
        return;
    }

    // encrypt password
    $encrypted_pass = encryptPassword($site_pass, $encryption_key);

    // prepare insert query
    $stmt = $conn->prepare("INSERT INTO PasswordManager_passwords (user_id, site, site_user, site_pass) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user_id, $site, $site_user, $encrypted_pass);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Failed to add password!"
        ]);
    }

    $stmt->close();
}

// DELETE PASSWORD
function deletePassword($conn, $user_id, $site_id)
{
    // check for missing fields
    if (!$user_id || !$site_id) {
        echo json_encode([
            "success" => false, 
            "message" => "Missing fields!"
        ]);
        return;
    }

    $stmt = $conn->prepare("DELETE FROM PasswordManager_passwords WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $site_id, $user_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true
            ]);
        } else {
            // No rows deleted → wrong user_id or site_id
            echo json_encode([
                "success" => false,
                "message" => "Entry not found or unauthorized"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Database error"
        ]);
    }

    $stmt->close();
}

// ---------------------------
// REQUEST ROUTING
// ---------------------------

// Get the parameters from the POST request
$action = $_POST['action'] ?? '';
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$user_id = $_SESSION["user_id"] ?? 0;
$site = $_POST["site"] ?? '';
$site_user = $_POST["site_user"] ?? '';
$site_pass = $_POST["site_pass"] ?? '';
$site_id = $_POST["site_id"] ?? 0;

// Route the request based on the action parameter
switch ($action) {
    case "login":
        login($conn, $username, $password);
        break;
    case "signup":
        signup($conn, $username, $password);
        break;
    case "loadPasswords":
        loadPasswords($conn, $user_id);
        break;
    case "addPassword":
        addPassword($conn, $user_id, $site, $site_user, $site_pass);
        break;
    case "deletePassword":
        deletePassword($conn, $user_id, $site_id);
        break;
}
?>