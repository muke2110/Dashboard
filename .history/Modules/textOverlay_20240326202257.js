const { PDFDocument, rgb } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates, viewportDimensions) {
    try {
        console.log('Name:', name);
        console.log('Event Name:', eventName);
        console.log('Certificate Date:', certificateDate);

        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Overlay text on the template PDF
        const fontSize = 20;
        const font = await pdfDoc.embedFont('Helvetica-Bold');

        // Get viewport dimensions from the frontend
        const { width: windowWidth, height: windowHeight } = viewportDimensions;

        // Get dimensions of the PDF page
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Translate coordinates from frontend viewport to PDF page space
        const translateX = (coordinates.Name.x / windowWidth) * pageWidth;
        const translateY = (coordinates.Name.y / windowHeight) * pageHeight;
        const xCoordinateName = parseFloat(translateX);
        const yCoordinateName = parseFloat(translateY);

        // Similarly, translate coordinates for other text elements if needed

        // Convert certificateDate to string
        certificateDate = certificateDate.toString();

        // Draw text on the page using translated coordinates
        page.drawText(name, { x: xCoordinateName, y: yCoordinateName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        // Draw other text elements using translated coordinates if needed

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = { overlayTextOnTemplate };
