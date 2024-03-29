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
        const font = await pdfDoc.embedFont('Times-Roman');

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

        // Calculate offsets dynamically based on the scale factor and selected coordinates
        const xOffsetName = xCoordinateName * scale; // Adjust this value based on your requirements
        const yOffsetName = (page.getHeight() - yCoordinateName) * scale; // Adjust this value based on your requirements
        const xOffsetEventName = xCoordinateEventName * scale; // Adjust this value based on your requirements
        const yOffsetEventName = (page.getHeight() - yCoordinateEventName) * scale; // Adjust this value based on your requirements
        const xOffsetDate = xCoordinateDate * scale; // Adjust this value based on your requirements
        const yOffsetDate = (page.getHeight() - yCoordinateDate) * scale; // Adjust this value based on your requirements

        // Draw text on the page using calculated exact coordinates
        page.drawText(name, { x: xOffsetName, y: yOffsetName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(eventName, { x: xOffsetEventName, y: yOffsetEventName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(certificateDate, { x: xOffsetDate, y: yOffsetDate, size: fontSize, font: font, color: rgb(0, 0, 0) });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = overlayTextOnTemplate;
