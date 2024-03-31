const { PDFDocument, rgb } = require('pdf-lib');

const DPI = 96; // Common DPI value

// Function to convert pixels to PDF points
function pixelsToPoints(pixels) {
    return pixels * 72 / DPI; // 72 points per inch
}

// Function to convert PDF points to pixels
function pointsToPixels(points) {
    return points * DPI / 72;
}

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
        const xCoordinateName = pixelsToPoints(coordinates.namePositionX);
        const yCoordinateName = pixelsToPoints(coordinates.namePositionY);
        const xCoordinateEventName = pixelsToPoints(coordinates.eventPositionX);
        const yCoordinateEventName = pixelsToPoints(coordinates.eventPositionY);
        const xCoordinateDate = pixelsToPoints(coordinates.datePositionX);
        const yCoordinateDate = pixelsToPoints(coordinates.datePositionY);

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
