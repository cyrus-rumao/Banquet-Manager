import { create } from 'zustand';
import axios from '../lib/axios';
import { handleError, handleSuccess } from '../lib/utils';

export const useVenueStore = create((set, get) => ({
	venues: [],
	loading: false,

	/**
	 * 📦 FETCH ALL VENUES
	 */
	getVenues: async () => {
		try {
			set({ loading: true });

			const res = await axios.get('/venues');
			set({ venues: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			handleError(error.response?.data?.message || 'Failed to fetch venues');
		}
	},

	/**
	 * 🧾 CREATE VENUE
	 */
	createVenue: async (data) => {
		try {
			set({ loading: true });

			const res = await axios.post('/venues', data);

			set((state) => ({
				venues: [res.data, ...state.venues],
				loading: false,
			}));

			handleSuccess('Venue created');
			return res.data;
		} catch (error) {
			set({ loading: false });
			handleError(error.response?.data?.message || 'Failed to create venue');
		}
	},

	/**
	 * ✏️ UPDATE VENUE
	 */
	updateVenue: async (id, data) => {
		try {
			set({ loading: true });

			const res = await axios.put(`/venues/${id}`, data);

			set((state) => ({
				venues: state.venues.map((v) => (v._id === id ? res.data : v)),
				loading: false,
			}));

			handleSuccess('Venue updated');
		} catch (error) {
			set({ loading: false });
			handleError(error.response?.data?.message || 'Failed to update venue');
		}
	},

	/**
	 * ❌ DELETE VENUE
	 */
	deleteVenue: async (id) => {
		try {
			set({ loading: true });

			await axios.delete(`/venues/${id}`);

			set((state) => ({
				venues: state.venues.filter((v) => v._id !== id),
				loading: false,
			}));

			handleSuccess('Venue deleted');
		} catch (error) {
			set({ loading: false });
			handleError(error.response?.data?.message || 'Failed to delete venue');
		}
	},
}));
