const { PDFDocument, rgb } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        console.log('Name:', name);
        console.log('Event Name:', eventName);
        console.log('Certificate Date:', certificateDate);

        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Overlay text on the template PDF
        const fontSize = 20;
        const font = await pdfDoc.embedFont('Helvetica-Bold');

        const xCoordinateName = parseFloat(coordinates.Name.x);
        const yCoordinateName = parseFloat(coordinates.Name.y);
        const xCoordinateEventName = parseFloat(coordinates['Event Name'].x);
        const yCoordinateEventName = parseFloat(coordinates['Event Name'].y);
        const xCoordinateDate = parseFloat(coordinates.Date.x);
        const yCoordinateDate = parseFloat(coordinates.Date.y);
        
        // Convert certificateDate to string
        certificateDate = certificateDate.toString();

        page.drawText(name, { x: xCoordinateName, y: yCoordinateName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(eventName, { x: xCoordinateEventName, y: yCoordinateEventName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(certificateDate, { x: xCoordinateDate, y: yCoordinateDate, size: fontSize, font: font, color: rgb(0, 0, 0) });
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = { overlayTextOnTemplate };

