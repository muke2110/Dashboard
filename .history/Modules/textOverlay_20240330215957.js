const { PDFDocument } = require('pdf-lib');
const puppeteer = require('puppeteer');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the viewport size
        await page.setViewport({
            width: coordinates.width || 800, // Set a default width if not provided
            height: coordinates.height || 600, // Set a default height if not provided
        });

        // Create a new canvas using Puppeteer
        const imgData = await page.evaluate((name, eventName, certificateDate, coordinates) => {
            const canvas = document.createElement('canvas');
            canvas.width = coordinates.width;
            canvas.height = coordinates.height;
            const ctx = canvas.getContext('2d');

            // Overlay text on the canvas
            const fontSize = 40;
            ctx.font = `${fontSize}px Helvetica`;
            ctx.fillStyle = 'black';

            ctx.fillText(name, coordinates.namePositionX, coordinates.namePositionY);
            ctx.fillText(eventName, coordinates.eventPositionX, coordinates.eventPositionY);
            ctx.fillText(certificateDate, coordinates.datePositionX, coordinates.datePositionY);

            // Convert canvas to base64 image
            return canvas.toDataURL().split(',')[1]; // Remove "data:image/png;base64," prefix
        }, name, eventName, certificateDate, coordinates);

        // Convert base64 image to buffer
        const imgBytes = Buffer.from(imgData, 'base64');

        await browser.close();

        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const pdfPage = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Add the image to the PDF document
        const pngImage = await pdfDoc.embedPng(imgBytes);
        const imageDims = pngImage.scale(1);
        pdfPage.drawImage(pngImage, {
            x: 0,
            y: pdfPage.getHeight() - imageDims.height, // Adjust position to match canvas coordinates
            width: imageDims.width,
            height: imageDims.height,
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = overlayTextOnTemplate;
