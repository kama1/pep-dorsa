# PEP Dorsa

A TypeScript/Node.js client library for integrating with Pasargad Electronic Payment (PEP) Dorsa payment gateway.

## Features

- 🔐 Automatic token management with caching
- 💳 Standard purchase transactions
- 🏦 Multi-account purchase support
- 📱 Mobile charge services (direct, PIN-based)
- 🌐 Internet package charge
- 🧾 Bill payment support
- ✅ Transaction confirmation and verification
- 🔄 Transaction reversal
- 📝 Full TypeScript support with type definitions
- ⚡ Promise-based async/await API

## Installation

```bash
npm install pep-dorsa
```

## Usage

### Initialize the Client

```typescript
import { PepDorsa } from 'pep-dorsa';

// or

const { PepDorsa } = require('pep-dorsa');


const pepClient = new PepDorsa({
  baseUrl: 'https://pep.shaparak.ir/dorsa1',
  terminalNumber: 12345678,
  username: 'your-username',
  password: 'your-password'
});
```

### Standard Purchase

Create a payment request and redirect the user to the payment gateway:

```typescript
const purchaseResult = await pepClient.purchase({
  invoice: 'INV-001',
  invoiceDate: '1404/08/28',
  amount: 100000, // Amount in Rials
  callbackApi: 'https://yoursite.com/payment/callback',
  mobileNumber: '09123456789',
  description: 'Purchase description',
  payerMail: 'customer@example.com',
  payerName: 'John Doe',
  nationalCode: '1234567890'
});

// Redirect user to: purchaseResult.url
console.log(purchaseResult.urlId); // Save this for confirmation
console.log(purchaseResult.url);   // Redirect URL for payment
```

### Multi-Account Purchase

For splitting payments across multiple accounts:

```typescript
const multiAccResult = await pepClient.multiAccPurchase({
  invoice: 'INV-002',
  invoiceDate: '1404/08/28',
  amount: 200000,
  callbackApi: 'https://yoursite.com/payment/callback',
  mobileNumber: '09123456789',
  sharedValue: ['100000', '100000'], // Split amounts in Rials or percentages
  sheba: ['IR123...', 'IR456...'],   // SHEBA account numbers
  description: 'Multi-account purchase',
  payerMail: 'customer@example.com',
  payerName: 'John Doe'
});
```

### Bill Payment

Pay utility bills:

```typescript
const billResult = await pepClient.bill({
  invoice: 'INV-003',
  invoiceDate: '1404/08/28',
  amount: 50000,
  callbackApi: 'https://yoursite.com/payment/callback',
  mobileNumber: '09123456789',
  billId: '1234567890123',
  paymentId: '98765',
  description: 'Electricity bill payment'
});
```

### Mobile Direct Charge

Directly charge a mobile number:

```typescript
import { MobileOperator } from 'pep-dorsa';

const chargeResult = await pepClient.directCharge({
  invoice: 'INV-004',
  invoiceDate: '1404/08/28',
  amount: 20000,
  callbackApi: 'https://yoursite.com/payment/callback',
  mobileNumber: '09123456789',
  operator: MobileOperator.MCI, // or MobileOperator.MTN, MobileOperator.RTL
  description: 'Mobile charge'
});
```

### Mobile PIN Charge

Purchase mobile charge PIN codes:

```typescript
const pinResult = await pepClient.pinCharge({
  invoice: 'INV-005',
  invoiceDate: '1404/08/28',
  amount: 100000,
  callbackApi: 'https://yoursite.com/payment/callback',
  mobileNumber: '09123456789',
  operator: MobileOperator.MTN,
  count: 5, // Number of PIN codes
  description: 'PIN charge purchase'
});
```

### Internet Package Charge

Purchase internet data packages:

```typescript
const internetResult = await pepClient.internetCharge({
  invoice: 'INV-006',
  invoiceDate: '1404/08/28',
  amount: 30000,
  callbackApi: 'https://yoursite.com/payment/callback',
  mobileNumber: '09123456789',
  operator: MobileOperator.MCI,
  productCode: '95017',
  description: 'Internet package purchase'
});
```

### Confirm Transaction

After the user completes payment and returns to your callback URL, confirm the transaction:

```typescript
const confirmation = await pepClient.confirm({
  invoice: 'INV-001',
  urlId: 'url-id-from-purchase-response'
});

console.log(confirmation.referenceNumber);
console.log(confirmation.trackId);
console.log(confirmation.maskedCardNumber);
console.log(confirmation.amount);
```

### Verify Transaction

Verify a transaction status:

```typescript
const verification = await pepClient.verify({
  invoice: 'INV-001',
  urlId: 'url-id-from-purchase-response'
});
```

### Reverse Transaction

Reverse a transaction:

```typescript
const reversal = await pepClient.reverse({
  invoice: 'INV-001',
  urlId: 'url-id-from-purchase-response'
});
```

## API Reference

### Constructor Options

```typescript
interface Config {
  baseUrl: string;        // Payment gateway base URL
  terminalNumber: number; // Your terminal number
  username: string;       // API username
  password: string;       // API password
}
```

### Methods

#### `purchase(request: PurchaseRequest): Promise<PurchaseData>`

Create a standard purchase transaction.

**Parameters:**
- `invoice` (string): Unique invoice identifier
- `invoiceDate` (string): Invoice date
- `amount` (number): Amount in Rials
- `callbackApi` (string): Callback URL for payment result
- `mobileNumber` (string): Customer mobile number
- `description` (string, optional): Transaction description
- `payerMail` (string, optional): Customer email
- `payerName` (string, optional): Customer name
- `pans` (string[], optional): Allowed card numbers
- `nationalCode` (string, optional): Customer national code
- `paymentCode` (string, optional): Payment code

**Returns:**
```typescript
{
  urlId: string,  // Transaction URL ID (save for confirmation)
  url: string     // Payment gateway URL (redirect user here)
}
```

#### `multiAccPurchase(request: MultiAccPurchaseRequest): Promise<PurchaseData>`

Create a multi-account purchase transaction for splitting payments.

**Additional Parameters:**
- `sharedValue` (string[]): Array of amounts to split
- `sheba` (string[]): Array of SHEBA account numbers

#### `confirm(request: ConfirmRequest): Promise<ConfirmData>`

Confirm a completed transaction.

**Parameters:**
- `invoice` (string): Invoice identifier from purchase
- `urlId` (string): URL ID from purchase response

**Returns:**
```typescript
{
  invoice: string,
  referenceNumber: string,
  trackId: string,
  maskedCardNumber: string,
  hashedCardNumber: string,
  requestDate: string,
  amount: number
}
```

## Error Handling

All methods return promises that reject on errors. Use try-catch blocks:

```typescript
try {
  const result = await pepClient.purchase({...});
} catch (error) {
  console.error('Payment error:', error);
}
```

## Authentication

The library automatically handles authentication and token caching. Tokens are cached for 5 minutes and refreshed automatically when needed.

## Development

### Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist` directory with type definitions.

### Project Structure

```
pep-dorsa/
├── src/
│   └── index.ts       # Main library code
├── dist/              # Compiled output (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC

## Author

Kamal Rahmati

## Repository

[https://github.com/kama1/pep-dorsa](https://github.com/kama1/pep-dorsa)
