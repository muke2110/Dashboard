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

        // Draw text at specified coordinates
        const drawText = (text, x, y) => {
            ctx.fillText(text, x, y);
        };

        drawText(name, parseFloat(coordinates.Name.x), parseFloat(coordinates.Name.y));
        drawText(eventName, parseFloat(coordinates['Event Name'].x), parseFloat(coordinates['Event Name'].y));
        drawText(certificateDate.toString(), parseFloat(coordinates.Date.x), parseFloat(coordinates.Date.y));

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
        const [templatePage] = await pdfDocOverlay.copyPages(pdfDoc, [0]);
        pdfDoc.removePage(0);
        pdfDoc.insertPage(0, templatePage);

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = { overlayTextOnTemplate };
