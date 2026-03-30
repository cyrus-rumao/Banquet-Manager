import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const SendQR = async (req, res) => {
	try {
		// Added messageText to destructuring
		const { phoneNumber, qrData, messageText } = req.body;

		if (!phoneNumber || !qrData) {
			return res.status(400).json({ error: 'Missing phoneNumber or qrData' });
		}

		// 1. Generate the QR Code URL with a Margin (Zoomed Out effect)
		// margin=50 adds a thick white border, making the QR look smaller/zoomed out
		const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=50&data=${encodeURIComponent(qrData)}`;

		const API_KEY = process.env.VONAGE_API_KEY;
		const API_SECRET = process.env.VONAGE_API_SECRET;
		const SANDBOX_NUMBER = process.env.SANDBOX_NUMBER;
		const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

		const vonageUrl = 'https://messages-sandbox.nexmo.com/v1/messages';
		const headers = {
			Authorization: `Basic ${auth}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		};

		// 2. Payload for the Image (NO caption here to keep it clean)
		const imagePayload = {
			from: SANDBOX_NUMBER,
			to: phoneNumber,
			message_type: 'image',
			image: { url: qrImageUrl },
			channel: 'whatsapp',
		};

		// 3. Payload for the separate Text message
		const textPayload = {
			from: SANDBOX_NUMBER,
			to: phoneNumber,
			message_type: 'text',
			text: messageText || 'Here is your QR code for the event!',
			channel: 'whatsapp',
		};

		// 4. Send both messages in sequence
		// We await the image first, then the text
		const imageResponse = await axios.post(vonageUrl, imagePayload, {
			headers,
		});
		const textResponse = await axios.post(vonageUrl, textPayload, { headers });

		return res.status(200).json({
			success: true,
			message: 'Image and Text sent as separate bubbles',
			image_uuid: imageResponse.data.message_uuid,
			text_uuid: textResponse.data.message_uuid,
		});
	} catch (error) {
		const errorData = error.response ? error.response.data : error.message;
		console.error('Vonage Error:', errorData);

		return res.status(500).json({
			success: false,
			error: 'Failed to send WhatsApp messages',
			details: errorData,
		});
	}
};
