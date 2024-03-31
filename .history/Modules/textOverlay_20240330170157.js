// Backend code using Puppeteer to render canvas
const { PDFDocument } = require('pdf-lib');
const puppeteer = require('puppeteer');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the dimensions of the page to match the PDF template
        await page.setViewport({
            width: coordinates.width,
            height: coordinates.height,
            deviceScaleFactor: 1,
        });

        // Draw text on the canvas
        await page.evaluate((name, eventName, certificateDate, coordinates) => {
            const { xCoordinateName, yCoordinateName, xCoordinateEventName, yCoordinateEventName, xCoordinateDate, yCoordinateDate } = coordinates;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = coordinates.width;
            canvas.height = coordinates.height;

            const fontSize = 40;
            ctx.font = `${fontSize}px Helvetica-Bold`;
            ctx.fillStyle = 'black';
            ctx.fillText(name, xCoordinateName, yCoordinateName);
            ctx.fillText(eventName, xCoordinateEventName, yCoordinateEventName);
            ctx.fillText(certificateDate, xCoordinateDate, yCoordinateDate);

            document.body.appendChild(canvas);
        }, name, eventName, certificateDate, coordinates);

        // Wait for a short delay to ensure canvas rendering is complete
        await page.waitForTimeout(1000);

        // Capture the canvas content as an image
        const imageData = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
        });

        await browser.close();

        // Embed the image into the PDF
        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const pngImage = await pdfDoc.embedPng(Buffer.from(imageData, 'base64'));

        // Add the image to the PDF
        const page = pdfDoc.getPages()[0];
        page.drawImage(pngImage, {
            x: 0, // Adjust coordinates as needed
            y: 0, // Adjust coordinates as needed
            width: coordinates.width,
            height: coordinates.height,
        });

        // Serialize the PDF
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = overlayTextOnTemplate;
