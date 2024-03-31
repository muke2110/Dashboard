const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Overlay text on the template PDF
        const fontSize = 40;
        const font = await pdfDoc.embedFont('Helvetica');

        // Convert pixel coordinates to PDF points
        const pointsToPixels = 96 / 72; // Assuming 96 DPI
        const xCoordinateName = coordinates.namePositionX / pointsToPixels;
        const yCoordinateName = (page.getHeight() - coordinates.namePositionY) / pointsToPixels;
        const xCoordinateEventName = coordinates.eventPositionX / pointsToPixels;
        const yCoordinateEventName = (page.getHeight() - coordinates.eventPositionY) / pointsToPixels;
        const xCoordinateDate = coordinates.datePositionX / pointsToPixels;
        const yCoordinateDate = (page.getHeight() - coordinates.datePositionY) / pointsToPixels;

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

