import { useState } from 'react';
import axios from '../lib/axios';

const CLOUD_NAME = 'dnsmcewxq';
const UPLOAD_PRESET = 'guest_uploads';

const GuestGalleryUpload = ({ eventId }) => {
	const [file, setFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const [caption, setCaption] = useState('');
	const [loading, setLoading] = useState(false);

	// 📸 File / camera input
	const handleFileChange = (e) => {
		const selected = e.target.files[0];
		if (!selected) return;

		setFile(selected);
		setPreview(URL.createObjectURL(selected));
	};

	// ☁️ Upload to Cloudinary (axios)
	const uploadToCloudinary = async () => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('upload_preset', UPLOAD_PRESET);
		formData.append('folder', `events/${eventId}`);

		const res = await fetch(
			`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
			{
				method: 'POST',
				body: formData,
			},
		);

		const data = await res.json();
console.log(data)
		return {
			url: res.data.secure_url,
			publicId: res.data.public_id,
		};
	};

	// 🚀 Upload flow
	const handleUpload = async () => {
		if (!file) {
			alert('Take a photo first');
			return;
		}

		try {
			setLoading(true);

			// Step 1: Upload to Cloudinary
			const cloudData = await uploadToCloudinary();

			// Step 2: Save in backend
			await axios.post('/gallery/save', {
				eventId,
				imageUrl: cloudData.url,
				cloudinaryPublicId: cloudData.publicId,
				caption,
			});

			alert('Uploaded successfully');

			// reset
			setFile(null);
			setPreview(null);
			setCaption('');
		} catch (err) {
			console.error(err);
			alert('Upload failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 max-w-md mx-auto bg-gray-900 text-white rounded-lg">
			<h2 className="text-lg font-bold mb-3 text-center">Upload Photo 📸</h2>

			<input
				type="file"
				placeholder="Upload image here"
				accept="image/*"
				capture="environment"
				onChange={handleFileChange}
				className="mb-3 w-full"
			/>

			{preview && (
				<img
					src={preview}
					alt="preview"
					className="mb-3 rounded-lg w-full"
				/>
			)}

			<input
				type="text"
				placeholder="Caption (optional)"
				value={caption}
				onChange={(e) => setCaption(e.target.value)}
				className="mb-3 w-full p-2 rounded bg-gray-800"
			/>

			<button
				onClick={handleUpload}
				disabled={loading}
				className="w-full bg-green-600 hover:bg-green-700 p-2 rounded">
				{loading ? 'Uploading...' : 'Upload Photo'}
			</button>
		</div>
	);
};

export default GuestGalleryUpload;
