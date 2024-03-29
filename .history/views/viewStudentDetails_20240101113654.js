<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Search</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.css"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="/Student.css">
</head>
<body>

  <form id="logoutForm" action="/logout" method="get">
    <button type="submit"><i class="material-icons">logout</i> Log Out</button>
  </form> 

  <div class="dashboard-container"> 
    <div class="top-bar">
      <h1>STUDENT DASHBOARD</h1>  
    </div>

    <div class="student-info">
      <strong id="rollNumberLabel">Roll Number:</strong> <span id="rollNumber"></span>
    </div>

    <!-- Insert your search form here -->
    <form class="search-container" id="searchForm">
      <label for="roll-number-search">Search by Roll Number:</label>
      <input type="text" name="roll_number" id="roll-number-search" placeholder="Enter Roll Number">
      <button type="button" id="searchButton">Search</button>
    </form>

    <div id="resultContainer" style="display: none;">
      <div class="student-info" id="studentInfo">
        <!-- Student details will be displayed here -->
      </div>

      <h2>Certificates:</h2>
      <ul id="certificatesList">
        <!-- Certificates will be displayed here -->
      </ul>

      <h2>Student Table:</h2>
      <table class="student-table" border="1">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Certification ID</th>
            <th>Certificates</th>
          </tr>
        </thead>
        <tbody id="studentTableBody">
          <!-- Student table rows will be dynamically added here -->
        </tbody>
      </table>
    </div>

    <div id="noRecords" style="display: none;">
      <p>No student details found for the provided roll number.</p>
    </div>

  </div>

  <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
  <script>
    $(document).ready(function () {
      $('#searchButton').click(function () {
        // Get roll number from the input
        const rollNumber = $('#roll-number-search').val();
  
        // Send a POST request to the server using AJAX
        $.post('/admin_Dashboard/viewStudentDetails', { roll_number: rollNumber })
          .done(function (data) {
            // Display the result container
            $('#resultContainer').show();
  
            if (data && data.length > 0) {
              // Display student details for the first student
              const student = data[0];
              $('#rollNumber').text(student.roll_number);
  
              // Display certificates
              const certificatesList = $('#certificatesList');
              certificatesList.empty();
  
              if (student.certificate_id && student.certificate_id.length > 0) {
                student.certificate_id.forEach(function (certificate_id) {
                  certificatesList.append('<li><strong>Certificate ID:</strong> ' + certificate_id + '</li>');
                });
              } else {
                certificatesList.append('<p>No certificates found for this student.</p>');
              }

              // Display student table
              const studentTableBody = $('#studentTableBody');
              studentTableBody.empty();
              let serialNumber = 1;

              if (student.certificate_id && student.certificate_id.length > 0) {
                student.certificate_id.forEach(function (certificate_id) {
                  studentTableBody.append(`
                    <tr>
                      <td>${serialNumber++}</td>
                      <td>${certificate_id}</td>
                      <td>
                        <form action="/download-certificate" method="post" style="display: inline-block">
                          <input type="hidden" name="certificatePath" value="${student.certificate_path[student.certificate_id.indexOf(certificate_id)]}">
                          <input type="hidden" name="certificateId" value="${certificate_id}">
                          <button type="submit">Download</button>
                        </form>
                        <form action="/view-certificate" method="post" target="_blank" style="display: inline-block">
                          <input type="hidden" name="certificatePath" value="${student.certificate_path[student.certificate_id.indexOf(certificate_id)]}">
                          <input type="hidden" name="certificateId" value="${certificate_id}">
                          <button type="submit">View</button>
                        </form>
                      </td>
                    </tr>
                  `);
                });
              }
            
            } else {
              // If no records found, display a message
              $('#noRecords').show();
            }
          })
          .fail(function (error) {
            console.error('Error:', error.responseText);
          });
      });
    });
  </script>

</body>
</html>
