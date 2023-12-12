document.addEventListener('DOMContentLoaded', function () {
    // Sample data for students
    const events = [
      { serialNumber: 1, eventName: 'Event 1', date: '2023-01-01', certificationID: 'ABC123', certificate: 'cert1.pdf' },
      { serialNumber: 2, eventName: 'Event 2', date: '2023-02-15', certificationID: 'XYZ456', certificate: 'cert2.pdf' },
      // Add more event data as needed
    ];
  
    const tableBody = document.querySelector('.student-table tbody');
  
    // Function to populate the table with event data
    function populateTable() {
      tableBody.innerHTML = '';
  
      events.forEach((event, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${event.eventName}</td>
          <td>${event.date}</td>
          <td>${event.certificationID}</td>
          <td><a href="#" onclick="downloadCertificate('${event.certificate}')">Click here</a></td>
        `;
        tableBody.appendChild(row);
      });
    }
  
    // Function to handle certificate download
    function downloadCertificate(certificateFileName) {
      // Implement your download logic here
      alert(`Downloading certificate: ${certificateFileName}`);
      // For a real implementation, consider using AJAX or other appropriate methods
    }
  
    // Function to toggle the visibility of the feedback container
    function toggleIssues() {
      const feedbackContainer = document.getElementById('feedback-container');
      feedbackContainer.style.display = (feedbackContainer.style.display === 'none' || feedbackContainer.style.display === '') ? 'block' : 'none';
    }
  
    // Initial table population
    populateTable();
  });








  //ADMIN DASHBOARD
  
  document.addEventListener('DOMContentLoaded', function () {
    // Your JavaScript code goes here

    // Upload button click event
    document.querySelector('.upload-btn').addEventListener('click', function () {
        // You can add your logic for handling the upload here
        alert('Upload button clicked!');
    });

    // View certificate button click event
    document.querySelector('.view-certificate-btn').addEventListener('click', function () {
        // You can add your logic for viewing certificates here
        alert('View Certificate button clicked!');
    });

    // Issues of the student button click event
    document.querySelector('.student-issues-btn').addEventListener('click', function () {
        // You can add your logic for handling student issues here
        alert('Issues of the Student button clicked!');
    });
});