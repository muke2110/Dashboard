const { PDFDocument, rgb } = require('pdf-lib');


async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Overlay text on the template PDF
        const fontSize = 40;
        const font = await pdfDoc.embedFont('Helvetica-Bold');

        // Convert certificateDate to string
        certificateDate = certificateDate.toString();

        // Convert pixel coordinates to PDF points
        const pixelsToPoints = 72 / 96; // Assuming 96 DPI
        const xCoordinateName = coordinates.namePositionX * pixelsToPoints;
        const yCoordinateName = coordinates.namePositionY * pixelsToPoints;
        const xCoordinateEventName = coordinates.eventPositionX * pixelsToPoints;
        const yCoordinateEventName = coordinates.eventPositionY * pixelsToPoints;
        const xCoordinateDate = coordinates.datePositionX * pixelsToPoints;
        const yCoordinateDate = coordinates.datePositionY * pixelsToPoints;

        // Check if coordinates are valid numbers
        if (isNaN(xCoordinateName) || isNaN(yCoordinateName) ||
            isNaN(xCoordinateEventName) || isNaN(yCoordinateEventName) ||
            isNaN(xCoordinateDate) || isNaN(yCoordinateDate)) {
            throw new Error('Invalid coordinate values');
        }

        // Draw text on the page using calculated exact coordinates
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

module.exports = overlayTextOnTemplate;
