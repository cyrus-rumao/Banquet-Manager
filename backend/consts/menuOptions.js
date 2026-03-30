export const MENU_TIERS = {
	Standard: {
		pricePerPlate: 800,
		limits: {
			Starter: 4,
			'Main Course': 4,
			Breads: 2,
			'Rice & Biryani': 2,
			Dessert: 2,
			Beverage: 2,
			'Live Counter': 1,
			Snacks: 2,
		},
	},

	Premium: {
		pricePerPlate: 1200,
		limits: {
			Starter: 6,
			'Main Course': 6,
			Breads: 4,
			'Rice & Biryani': 3,
			Dessert: 3,
			Beverage: 3,
			'Live Counter': 2,
			Snacks: 3,
		},
	},

	Elite: {
		pricePerPlate: 1800,
		limits: {
			Starter: 8,
			'Main Course': 8,
			Breads: 5,
			'Rice & Biryani': 4,
			Dessert: 4,
			Beverage: 4,
			'Live Counter': 3,
			Snacks: 4,
		},
	},
};
