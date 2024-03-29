const { PDFDocument, rgb } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        console.log('Name:', name);
        console.log('Event Name:', eventName);
        console.log('Certificate Date:', certificateDate);
        
        // Load the original PDF document
        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const originalPage = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Create a new PDF document for the canvas
        const canvasDoc = await PDFDocument.create();
        const canvasPage = canvasDoc.addPage(originalPage.getSize());

        // Overlay text on the canvas
        const fontSize = 20;
        const font = await canvasDoc.embedFont('Helvetica-Bold');

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

        // Calculate exact coordinates based on canvas dimensions
        const canvasWidth = canvasPage.getWidth();
        const canvasHeight = canvasPage.getHeight();
        
        const textWidth = font.widthOfTextAtSize(name, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        const exactXCoordinateName = xCoordinateName - (textWidth / 2); // Center text horizontally
        const exactYCoordinateName = canvasHeight - yCoordinateName - (textHeight / 2); // Center text vertically
        
        const exactXCoordinateEventName = xCoordinateEventName - (textWidth / 2); // Center text horizontally
        const exactYCoordinateEventName = canvasHeight - yCoordinateEventName - (textHeight / 2); // Center text vertically
        
        const exactXCoordinateDate = xCoordinateDate - (textWidth / 2); // Center text horizontally
        const exactYCoordinateDate = canvasHeight - yCoordinateDate - (textHeight / 2); // Center text vertically

        // Draw text on the canvas using calculated exact coordinates
        canvasPage.drawText(name, { x: exactXCoordinateName, y: exactYCoordinateName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        canvasPage.drawText(eventName, { x: exactXCoordinateEventName, y: exactYCoordinateEventName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        canvasPage.drawText(certificateDate, { x: exactXCoordinateDate, y: exactYCoordinateDate, size: fontSize, font: font, color: rgb(0, 0, 0) });

        // Create a new page in the original PDF document and draw the canvas onto it
        const newPage = pdfDoc.insertPage(0, originalPage.getSize());
        newPage.drawImage(await canvasPage.render(), {
            x: 0,
            y: 0,
            width: canvasPage.getWidth(),
            height: canvasPage.getHeight(),
        });

        // Save the updated PDF document
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = overlayTextOnTemplate;
