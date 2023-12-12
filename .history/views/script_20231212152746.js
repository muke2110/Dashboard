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



  