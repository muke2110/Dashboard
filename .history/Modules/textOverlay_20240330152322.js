const fs = require('fs');
const { createCanvas } = require('canvas');
const { PDFDocument, drawPage } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        console.log('Coordinates:', coordinates); // Log coordinates to check their values

        // Ensure coordinates are parsed correctly
        const xCoordinateName = parseFloat(coordinates.namePositionX);
        const yCoordinateName = parseFloat(coordinates.namePositionY);
        const xCoordinateEventName = parseFloat(coordinates.eventPositionX);
        const yCoordinateEventName = parseFloat(coordinates.eventPositionY);
        const xCoordinateDate = parseFloat(coordinates.datePositionX);
        const yCoordinateDate = parseFloat(coordinates.datePositionY);

        // Load the template PDF
        const existingPdfBytes = templatePDFBuffer;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const [firstPage] = pdfDoc.getPages();

        // Get the dimensions of the first page
        const { width, height } = firstPage.getSize();

        // Create a canvas with the page dimensions
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Render the PDF page onto the canvas
        await drawPage(firstPage, {
            canvasContext: ctx,
            x: 0,
            y: 0,
            width: width,
            height: height,
            scale: 1,
        });

        // Draw text on the canvas
        ctx.font = '40px Helvetica-Bold';
        ctx.fillStyle = 'black';
        ctx.fillText(name, xCoordinateName, yCoordinateName);
        ctx.fillText(eventName, xCoordinateEventName, yCoordinateEventName);
        ctx.fillText(certificateDate, xCoordinateDate, yCoordinateDate);

        // Convert canvas to a buffer
        const canvasAsBuffer = canvas.toBuffer();

        return canvasAsBuffer;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error;
    }
}

module.exports = overlayTextOnTemplate;
