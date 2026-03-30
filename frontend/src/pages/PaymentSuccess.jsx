import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import Confetti from 'react-confetti';

const PaymentSuccessPage = () => {
	const [isProcessing, setIsProcessing] = useState(true);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState('');

	useEffect(() => {
		const verifyPayment = async (sessionId) => {
			try {
				const res = await axios.post('/payments/checkout-success', {
					sessionId,
				});

				setMessage(res.data.message || 'Payment processed successfully');
			} catch (err) {
				console.error(err);
				setError('Payment verification failed');
			} finally {
				setIsProcessing(false);
			}
		};

		const sessionId = new URLSearchParams(window.location.search).get(
			'session_id',
		);

		if (sessionId) {
			verifyPayment(sessionId);
		} else {
			setError('No session ID found in URL');
			setIsProcessing(false);
		}
	}, []);

	if (isProcessing) {
		return (
			<div className="h-screen flex items-center justify-center text-white">
				Processing payment...
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen flex items-center justify-center text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="h-screen flex items-center justify-center px-4">
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				numberOfPieces={500}
				recycle={false}
			/>

			<div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
				<div className="p-6 sm:p-8">
					<div className="flex justify-center">
						<CheckCircle className="text-green-400 w-16 h-16 mb-4" />
					</div>

					<h1 className="text-2xl sm:text-3xl font-bold text-center text-green-400 mb-2">
						Payment Successful!
					</h1>

					<p className="text-gray-300 text-center mb-2">
						Your booking deposit has been received.
					</p>

					<p className="text-green-400 text-center text-sm mb-6">{message}</p>

					<div className="bg-gray-700 rounded-lg p-4 mb-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400">Status</span>
							<span className="text-sm font-semibold text-green-400">
								Booked
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-400">Next Step</span>
							<span className="text-sm font-semibold text-green-400">
								Final Payment Pending
							</span>
						</div>
					</div>

					<div className="space-y-4">
						<Link to={'/events'}>
							<button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
								<CreditCard
									className="mr-2"
									size={18}
								/>
								View My Events
							</button>
						</Link>

						<Link
							to={'/'}
							className="w-full bg-gray-700 hover:bg-gray-600 text-green-400 font-bold py-2 px-4 rounded-lg flex items-center justify-center">
							Back to Dashboard
							<ArrowRight
								className="ml-2"
								size={18}
							/>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PaymentSuccessPage;
