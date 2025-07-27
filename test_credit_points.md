# Credit Point System Test

## How the Credit Point System Works

### Eco-Friendly Products
- **Organic Disposal Plates** (Pack of 50 pieces) - Eco-friendly ✅
- **Eco Disposal Plates** (Pack of 50 pieces) - Eco-friendly ✅
- **Eco-Friendly Bags** (Pack of 50 pieces) - Eco-friendly ✅

### Credit Point Calculation
- **1 Credit Point = 100 Eco-friendly pieces**
- Each pack contains 50 pieces
- Points are calculated as: `Math.floor(totalPieces / 100)`

### Examples:

#### Example 1: 1 Pack of Organic Disposal Plates
- Quantity: 1 pack
- Pieces: 1 × 50 = 50 pieces
- Points earned: Math.floor(50 / 100) = **0 points**

#### Example 2: 2 Packs of Organic Disposal Plates
- Quantity: 2 packs
- Pieces: 2 × 50 = 100 pieces
- Points earned: Math.floor(100 / 100) = **1 point**

#### Example 3: 3 Packs of Organic Disposal Plates
- Quantity: 3 packs
- Pieces: 3 × 50 = 150 pieces
- Points earned: Math.floor(150 / 100) = **1 point**

#### Example 4: 4 Packs of Organic Disposal Plates
- Quantity: 4 packs
- Pieces: 4 × 50 = 200 pieces
- Points earned: Math.floor(200 / 100) = **2 points**

### Frontend Display
- Shows "📦 50 pcs per pack" for eco-friendly products
- Shows total eco-friendly pieces in cart
- Shows points to earn: `Math.floor(totalPieces / 100)`
- Shows "1 point per 100 eco-friendly pieces"

### Backend Processing
- When order is placed, calculates total eco-friendly pieces
- Awards points based on the calculation
- Updates buyer's credit wallet
- Returns updated wallet information

### Credit Point Usage
- 1 Point = ₹10 discount
- Can be used during checkout
- Points are deducted from wallet when used 