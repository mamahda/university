<?php
error_reporting(E_ALL);

$servername = "mysql1";
$username = "root";
$password = getenv("MYSQL_ROOT_PASSWORD");
$dbname = getenv("MYSQL_DATABASE"); 


try {
  $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
  // set the PDO error mode to exception
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  echo "Connected successfully";
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}


$stm = $conn->query("select * from mydata");

$data = $stm->fetchAll(PDO::FETCH_ASSOC);


echo '<table border=1>';

foreach($data as $k=>$v){
	echo '<tr>';
	echo '<td>' . $v['id'] . '</td>';
	echo '<td>' . $v['nama'] . '</td>';
	echo '<td>' . $v['alamat'] . '</td>';
	echo '</tr>';
}
echo '</table>';
