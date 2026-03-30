import { configStripe } from '../config/stripe.js';
import Payment from '../models/paymentModel.js';
import Event from '../models/eventModel.js';
// import dotenv from 'dotenv';
import { MENU_TIERS } from '../consts/menuOptions.js';
const stripe = configStripe();
// dotenv.config();

export const createPaymentForEvent = async (req, res) => {
	try {
		const { eventId, tier } = req.body;

		const event = await Event.findById(eventId);

		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		const guestCount = event.headcount.expected;

		const tierData = MENU_TIERS[tier];

		if (!tierData) {
			return res.status(400).json({ message: 'Invalid tier' });
		}

		const pricePerPlate = tierData.pricePerPlate;

		const packageValue = guestCount * pricePerPlate;

		// prevent duplicate payment records (very important)
		let payment = await Payment.findOne({ event: eventId });

		if (!payment) {
			payment = await initializeTwoStepPayment(
				eventId,
				packageValue,
				req.user._id,
			);
		}

		res.json({ payment, packageValue });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};
export const initializeTwoStepPayment = async (
	eventId,
	packageValue,
	createdBy,
) => {
	const depositAmount = packageValue * 0.5;
	const finalAmount = packageValue * 0.5;

	// Deposit due now, Final due e.g. 30 days later or after event date
	const depositDueDate = new Date();
	const finalDueDate = new Date();
	finalDueDate.setDate(finalDueDate.getDate() + 30);

	return await Payment.create({
		event: eventId,
		packageValue,
		totalPayable: packageValue, // Logic for GST can be added here: packageValue * 1.18
		createdBy,
		installments: [
			{
				amount: depositAmount,
				dueDate: depositDueDate,
				remarks: '50% Initial Booking Deposit',
				status: 'PENDING',
			},
			{
				amount: finalAmount,
				dueDate: finalDueDate,
				remarks: '50% Final Settlement Post-Event',
				status: 'PENDING',
			},
		],
	});
};

/**
 * STEP 1: Create Stripe Session
 * Expects { eventId, installmentIndex } (0 for Deposit, 1 for Final)
 */
export const createInstallmentSession = async (req, res) => {
	try {
		const { eventId, installmentIndex } = req.body;
		// const CHECKOUT_SESSION_ID = 'cs_test_1234567890';
		const paymentRecord = await Payment.findOne({ event: eventId }).populate(
			'event',
		);

		if (!paymentRecord) {
			return res.status(404).json({ message: 'Payment record not found' });
		}

		const installment = paymentRecord.installments[installmentIndex];

		if (!installment || installment.status === 'PAID') {
			return res.status(400).json({
				message: 'Invalid installment or already paid',
			});
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',

			line_items: [
				{
					price_data: {
						currency: 'inr',
						product_data: {
							name:
								installmentIndex === 0
									? `Booking Deposit - ${paymentRecord.event.partyName}`
									: `Final Payment - ${paymentRecord.event.partyName}`,
							description: `Event Code: ${paymentRecord.event.eventCode}`,
						},
						unit_amount: Math.round(installment.amount * 100),
					},
					quantity: 1,
				},
			],

			success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,

			metadata: {
				eventId: eventId.toString(),
				installmentId: installment._id.toString(),
				installmentIndex: installmentIndex.toString(),
			},
		});
		console.log('STRIPE METADATA:', {
			eventId: eventId.toString(),
			installmentId: installment._id.toString(),
			installmentIndex: installmentIndex.toString(),
		});

		res.json({
			success: true,
			url: session.url,
			id: session.id,
		});
	} catch (err) {
		console.error('Stripe session error:', err);
		res.status(500).json({ message: 'Failed to create session' });
	}
};

/**
 * STEP 2: Verify Payment & Update Event Status
 * Expects { sessionId } from the frontend redirect
 */
export const paymentSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		const { eventId, installmentId, installmentIndex } = session.metadata;
		const paymentRecord = await Payment.findOne({ event: eventId });
		let installment = paymentRecord.installments.id(installmentId);

		if (!session) {
			return res.status(404).json({ message: 'Session not found' });
		}
		if (installment.status === 'PAID') {
			return res.json({ message: 'Already processed' });
		}

		if (!paymentRecord) {
			return res.status(404).json({ message: 'Payment record not found' });
		}

		if (!installment) {
			console.log('Installment ID mismatch → using index');
			installment = paymentRecord.installments[parseInt(installmentIndex)];
		}

		if (!installment) {
			return res.status(400).json({ message: 'Installment not found' });
		}

		// ✅ NOW safe to check
		if (installment.status === 'PAID') {
			return res.json({ message: 'Already processed' });
		}

		console.log('INSTALLMENT BEFORE UPDATE:', installment);

		// update
		installment.status = 'PAID';
		installment.paidAt = new Date();
		installment.paymentMode = 'Card';
		installment.referenceNumber = session.payment_intent;

		if (session.payment_status !== 'paid') {
			return res.status(400).json({ message: 'Payment not completed' });
		}
		await paymentRecord.save();

		// update event
		if (parseInt(installmentIndex) === 0) {
			await Event.findByIdAndUpdate(eventId, {
				status: 'BOOKED',
			});
		}

		res.json({
			success: true,
			message:
				parseInt(installmentIndex) === 0
					? 'Booking Confirmed'
					: 'Final Payment Received',
		});
	} catch (err) {
		console.error('Payment success error:', err);
		res.status(500).json({ message: 'Internal server error' });
	}
};
