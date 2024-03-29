// textOverlay.js
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

        // Convert certificateDate to string
        certificateDate = certificateDate.toString();

        // Use coordinates
        const xCoordinateName = parseFloat(coordinates.namePositionX);
        const yCoordinateName = parseFloat(coordinates.namePositionY);
        const xCoordinateEventName = parseFloat(coordinates.eventPositionX);
        const yCoordinateEventName = parseFloat(coordinates.eventPositionY);
        const xCoordinateDate = parseFloat(coordinates.datePositionX);
        const yCoordinateDate = parseFloat(coordinates.datePositionY);
        
        // Check if coordinates are valid numbers
        if (isNaN(xCoordinateName) || isNaN(yCoordinateName) ||
            isNaN(xCoordinateEventName) || isNaN(yCoordinateEventName) ||
            isNaN(xCoordinateDate) || isNaN(yCoordinateDate)) {
            throw new Error('Invalid coordinate values');
        }

        // Calculate a default or relative scale factor
        const defaultScale = 1.0; // Default scale factor
        const relativeScale = 0.8; // Relative scale factor (80% of the page dimensions)
        const scale = defaultScale; // Use either defaultScale or relativeScale

        // Calculate exact coordinates based on scale factor
        const exactXCoordinateName = xCoordinateName * scale;
        const exactYCoordinateName = (page.getHeight() - yCoordinateName) * scale;
        
        const exactXCoordinateEventName = xCoordinateEventName * scale;
        const exactYCoordinateEventName = (page.getHeight() - yCoordinateEventName) * scale;
        
        const exactXCoordinateDate = xCoordinateDate * scale;
        const exactYCoordinateDate = (page.getHeight() - yCoordinateDate) * scale;

        // Draw text on the page using calculated exact coordinates
        page.drawText(name, { x: exactXCoordinateName, y: exactYCoordinateName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(eventName, { x: exactXCoordinateEventName, y: exactYCoordinateEventName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(certificateDate, { x: exactXCoordinateDate, y: exactYCoordinateDate, size: fontSize, font: font, color: rgb(0, 0, 0) });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = overlayTextOnTemplate;
