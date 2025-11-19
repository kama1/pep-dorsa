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
### Overview

The library exports a typed client `PepDorsa` and several request/response interfaces to interact with the PEP Dorsa payment API. All methods are async and return Promises that reject on error.

### Constructor Options

```typescript
interface Config {
  baseUrl: string;        // Payment gateway base URL
  terminalNumber: number; // Your terminal number
  username: string;       // API username
  password: string;       // API password
}
```

Create a client instance:

```ts
const client = new PepDorsa(config);
```

### Exported types (short)

- `PurchaseRequest` / `MultiAccPurchaseRequest` — standard and multi-account purchase payloads
- `BillRequest` — bill payment payload
- `DirectChargeRequest` / `PinChargeRequest` / `InternetChargeRequest` — mobile services
- `PaymentRequest` — { invoice: string; urlId: string }
- `PurchaseResponse`, `ConfirmResponse`, `SimpleResponse`, `ReverseResponse` — standard response shapes
- `MobileOperator` — enum: `MCI`, `MTN`, `RTL`

### MobileOperator

Use the `MobileOperator` enum when calling mobile-related methods:

- `MobileOperator.MCI`
- `MobileOperator.MTN`
- `MobileOperator.RTL`

The client maps these to the gateway's service codes internally.

### Methods

All method signatures are on the `PepDorsa` instance. Common request fields include `invoice`, `invoiceDate`, `amount`, `callbackApi`, and `mobileNumber` where applicable.

#### purchase(request: PurchaseRequest): Promise<{ urlId: string; url: string }>

Create a standard purchase transaction. Returns `{ urlId, url }` where `url` is the payment redirect URL and `urlId` should be kept for confirmation.

Key request fields (in addition to common ones):
- `description?`, `payerMail?`, `payerName?`, `pans?`, `nationalCode?`, `paymentCode?`

#### multiAccPurchase(request: MultiAccPurchaseRequest): Promise<{ urlId: string; url: string }>

Create a multi-account purchase. Additional fields:
- `sharedValue: string[]` — array of split amounts (rials or percentages as required by gateway)
- `sheba: string[]` — target SHEBA accounts

#### bill(request: BillRequest): Promise<string>

Create a bill payment (pre-transaction). Returns a string token/identifier from the gateway on success.

Required extra fields: `billId`, `paymentId`.

#### directCharge(request: DirectChargeRequest): Promise<string>

Request a direct mobile charge. Provide `operator: MobileOperator`. Returns a string result from the gateway on success.

#### pinCharge(request: PinChargeRequest): Promise<string>

Purchase mobile PIN codes. `count` controls number of PINs returned.

#### internetCharge(request: InternetChargeRequest): Promise<string>

Purchase internet/data packages. Provide `productCode` identifying the package.

#### confirm(request: PaymentRequest): Promise<ConfirmResponse['data']>

Confirm a completed transaction after the user returns to your `callbackApi`. Returns detailed confirmation data:

```ts
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

#### verifyTransaction(request: PaymentRequest): Promise<SimpleResponse>

Verify the transaction status (returns the gateway's `SimpleResponse` shape).

#### verify(request: PaymentRequest): Promise<ConfirmResponse | SimpleResponse>

Another verification endpoint that returns detailed or simple response depending on the gateway response.

#### reverse(request: PaymentRequest): Promise<ReverseResponse>

Reverse (refund) a transaction. Returns `ReverseResponse` with `resultCode` and `resultMsg`.

### Authentication and token caching

The client handles authentication automatically via `authenticate()` and caches the token in-memory. If the remote response does not provide an expire time, a 5-minute fallback cache is used.


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
