const uploadToCloudinary = async (file) => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('upload_preset', 'your_preset');

	const res = await fetch(
		'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
		{
			method: 'POST',
			body: formData,
		},
	);

	const data = await res.json();

	return {
		url: data.secure_url,
		publicId: data.public_id,
	};
};
