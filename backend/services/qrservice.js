import QRCode from 'qrcode';
import crypto from 'crypto';

const generateGuestQR = async (guestId) => {
	const token = crypto.randomBytes(16).toString('hex');

	// Encode guestId + token into the QR
	const payload = JSON.stringify({ guestId, token });

	// Generate as base64 PNG (easy to send via Twilio)
	const qrBase64 = await QRCode.toDataURL(payload);

	return { token, qrBase64 };
};

export { generateGuestQR };
