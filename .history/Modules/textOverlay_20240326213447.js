const { PDFDocument } = require('pdf-lib');
const { createCanvas } = require('canvas');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        console.log('Name:', name);
        console.log('Event Name:', eventName);
        console.log('Certificate Date:', certificateDate);

        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page
        const { width, height } = page.getSize(); // Get the dimensions of the PDF page

        // Create a canvas element with the same dimensions as the PDF page
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Overlay text on the canvas
        const fontSize = 20;
        ctx.fillStyle = 'black';

        const xCoordinateName = parseFloat(coordinates.Name.x);
        const yCoordinateName = parseFloat(coordinates.Name.y);
        const xCoordinateEventName = parseFloat(coordinates['Event Name'].x);
        const yCoordinateEventName = parseFloat(coordinates['Event Name'].y);
        const xCoordinateDate = parseFloat(coordinates.Date.x);
        const yCoordinateDate = parseFloat(coordinates.Date.y);

        ctx.fillText(name, xCoordinateName, yCoordinateName);
        ctx.fillText(eventName, xCoordinateEventName, yCoordinateEventName);
        ctx.fillText(certificateDate.toString(), xCoordinateDate, yCoordinateDate);

        // Convert canvas to PDF
        const imageData = canvas.toDataURL('image/jpeg');
        const pdfDocOverlay = await PDFDocument.create();
        const pageOverlay = pdfDocOverlay.addPage([width, height]);
        const jpgImageBytes = Uint8Array.from(atob(imageData.split(',')[1]), c => c.charCodeAt(0));
        const jpgImage = await pdfDocOverlay.embedJpg(jpgImageBytes);
        pageOverlay.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });

        // Merge the overlay PDF with the template PDF
        const [templatePage] = await pdfDoc.copyPages(pdfDocOverlay, [0]);
        pdfDoc.removePage(0);
        pdfDoc.addPage(templatePage);

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = { overlayTextOnTemplate };
