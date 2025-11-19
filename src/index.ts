import axios from 'axios';

export interface Config {
    baseUrl: string
    terminalNumber: number
    username: string
    password: string
}

export interface PurchaseRequest {
    invoice: string;
    invoiceDate: string;
    amount: number;
    callbackApi: string;
    mobileNumber: string;
    description?: string;
    payerMail?: string;
    payerName?: string;
    pans?: string[];
    nationalCode?: string;
    paymentCode?: string
}

export interface MultiAccPurchaseRequest {
    invoice: string;
    invoiceDate: string;
    amount: number;
    callbackApi: string;
    mobileNumber: string;
    description?: string;
    payerMail?: string;
    payerName?: string;
    pans?: string[];
    sharedValue: string[];
    sheba: string[];
    nationalCode?: string;
}

export interface PurchaseResponse {
    resultMsg: string;
    resultCode: number;
    data: {
        urlId: string,
        url: string,
    };
}

export interface BillRequest {
    invoice: string;
    invoiceDate: string;
    amount: number;
    callbackApi: string;
    mobileNumber: string;
    description?: string;
    payerMail?: string;
    payerName?: string;
    pans?: string[];
    nationalCode?: string;
    billId: string;
    paymentId: string
}

export enum Operator {
    MCI,
    MTN,
    RTL,
}

export interface DirectChargeRequest {
    invoice: string;
    invoiceDate: string;
    amount: number;
    callbackApi: string;
    mobileNumber: string;
    operator: Operator;
    description?: string;
    payerMail?: string;
    payerName?: string;
    pans?: string[];
    nationalCode?: string;
}

export interface PinChargeRequest {
    invoice: string;
    invoiceDate: string;
    amount: number;
    callbackApi: string;
    mobileNumber: string;
    operator: Operator;
    description?: string;
    payerMail?: string;
    payerName?: string;
    pans?: string[];
    nationalCode?: string;
    count: number;
}

export interface InternetChargeRequest {
    invoice: string;
    invoiceDate: string;
    amount: number;
    callbackApi: string;
    mobileNumber: string;
    operator: Operator;
    description?: string;
    payerMail?: string;
    payerName?: string;
    pans?: string[];
    nationalCode?: string;
    productCode: string;
}

export interface SimpleResponse {
    resultMsg: string;
    resultCode: number;
    data: string;
}

export interface PaymentRequest {
    invoice: string;
    urlId: string;
}

export interface ConfirmResponse {
    resultMsg: string;
    resultCode: number;
    data: {
        invoice: string,
        referenceNumber: string,
        trackId: string,
        maskedCardNumber: string,
        hashedCardNumber: string,
        requestDate: string,
        amount: number,
    };
}

export interface ReverseResponse {
    resultMsg: string;
    resultCode: number;
}

export class PepDorsa {

    //— TOKEN CACHE —
    cachedToken: string = '';
    tokenExpiry = 0;
    constructor(private config: Config) {

    }

    //— ERROR HANDLING HELPERS —
    throwError(method: string, body: any) {
        throw new Error(`[${method}] API error: ${JSON.stringify(body)}`);
    }

    //— DRY HEADERS HELPERS —
    getHeaders(token: string) {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }

    async authenticate(): Promise<any> {
        try {
            const now = Date.now();
            if (this.cachedToken && this.tokenExpiry > now) {
                return this.cachedToken;
            }

            const res = await axios.post(
                `${this.config.baseUrl}/token/getToken`,
                {
                    username: this.config.username,
                    password: this.config.password,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000,
                }
            );

            const { resultCode, token } = res.data;
            if (resultCode === 0 && token) {
                this.cachedToken = token;
                // Fallback for missing expireAt: cache 5 minutes
                this.tokenExpiry = now + 5 * 60 * 1000;
                return this.cachedToken;
            } else {
                this.throwError('getToken', res.data);
            }

        } catch (error) {
            return Promise.reject(error);
        }
    }

    async purchase({
        invoice,
        invoiceDate,
        amount,
        callbackApi,
        mobileNumber,
        description,
        payerMail,
        payerName,
        pans,
        nationalCode,
        paymentCode
    }: PurchaseRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            const res = await axios.post<PurchaseResponse>(
                `${this.config.baseUrl}/api/payment/purchase`,
                {
                    invoice,
                    invoiceDate,
                    amount,
                    mobileNumber,
                    callbackApi,
                    terminalNumber: this.config.terminalNumber,
                    serviceCode: '8',
                    serviceType: 'PURCHASE',
                    description,
                    payerMail,
                    payerName,
                    pans,
                    nationalCode,
                    paymentCode
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data.data;
            } else {
                this.throwError('Purchase', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async multiAccPurchase({
        invoice,
        invoiceDate,
        amount,
        callbackApi,
        mobileNumber,
        description,
        payerMail,
        payerName,
        pans,
        nationalCode,
        sharedValue,
        sheba
    }: MultiAccPurchaseRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            const res = await axios.post<PurchaseResponse>(
                `${this.config.baseUrl}/api/payment/purchase`,
                {
                    invoice,
                    invoiceDate,
                    amount,
                    mobileNumber,
                    callbackApi,
                    terminalNumber: this.config.terminalNumber,
                    serviceCode: '9',
                    serviceType: 'MULTIACCPURCHASE',
                    description,
                    payerMail,
                    payerName,
                    pans,
                    nationalCode,
                    sharedValue,
                    sheba,
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data.data;
            } else {
                this.throwError('MultiAccPurchase', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async bill({
        invoice,
        invoiceDate,
        amount,
        callbackApi,
        mobileNumber,
        description,
        payerMail,
        payerName,
        pans,
        nationalCode,
        billId,
        paymentId
    }: BillRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            const res = await axios.post<SimpleResponse>(
                `${this.config.baseUrl}/api/payment/pre-transaction`,
                {
                    invoice,
                    invoiceDate,
                    amount,
                    mobileNumber,
                    callbackApi,
                    terminalNumber: this.config.terminalNumber,
                    serviceCode: '4',
                    serviceType: 'BILL',
                    description,
                    payerMail,
                    payerName,
                    pans,
                    nationalCode,
                    billId,
                    paymentId
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data.data;
            } else {
                this.throwError('Bill', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async directCharge({
        invoice,
        invoiceDate,
        amount,
        callbackApi,
        mobileNumber,
        operator,
        description,
        payerMail,
        payerName,
        pans,
        nationalCode,
    }: DirectChargeRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            let serviceCode;
            switch (operator) {
                case Operator.MCI:
                    serviceCode = '1';
                    break;
                case Operator.MTN:
                    serviceCode = '2';
                    break;
                case Operator.RTL:
                    serviceCode = '3';
                    break;

                default:
                    break;
            }
            const res = await axios.post<SimpleResponse>(
                `${this.config.baseUrl}/api/payment/pre-transaction`,
                {
                    invoice,
                    invoiceDate,
                    amount,
                    mobileNumber,
                    callbackApi,
                    terminalNumber: this.config.terminalNumber,
                    serviceCode,
                    serviceType: operator.toString(),
                    description,
                    payerMail,
                    payerName,
                    pans,
                    nationalCode,
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data.data;
            } else {
                this.throwError('Direct Charge', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async pinCharge({
        invoice,
        invoiceDate,
        amount,
        callbackApi,
        mobileNumber,
        operator,
        description,
        payerMail,
        payerName,
        pans,
        nationalCode,
        count,
    }: PinChargeRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            let serviceCode;
            switch (operator) {
                case Operator.MCI:
                    serviceCode = '5';
                    break;
                case Operator.MTN:
                    serviceCode = '6';
                    break;
                case Operator.RTL:
                    serviceCode = '7';
                    break;

                default:
                    break;
            }
            const res = await axios.post<SimpleResponse>(
                `${this.config.baseUrl}/api/payment/pre-transaction`,
                {
                    invoice,
                    invoiceDate,
                    amount,
                    mobileNumber,
                    callbackApi,
                    terminalNumber: this.config.terminalNumber,
                    serviceCode,
                    serviceType: operator.toString() + '-PIN',
                    description,
                    payerMail,
                    payerName,
                    pans,
                    nationalCode,
                    count,
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data.data;
            } else {
                this.throwError('PIN Charge', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async internetCharge({
        invoice,
        invoiceDate,
        amount,
        callbackApi,
        mobileNumber,
        operator,
        description,
        payerMail,
        payerName,
        pans,
        nationalCode,
        productCode,
    }: InternetChargeRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            let serviceCode;
            switch (operator) {
                case Operator.MCI:
                    serviceCode = '1';
                    break;
                case Operator.MTN:
                    serviceCode = '2';
                    break;
                case Operator.RTL:
                    serviceCode = '3';
                    break;

                default:
                    break;
            }
            const res = await axios.post<SimpleResponse>(
                `${this.config.baseUrl}/api/payment/pre-transaction`,
                {
                    invoice,
                    invoiceDate,
                    amount,
                    mobileNumber,
                    callbackApi,
                    terminalNumber: this.config.terminalNumber,
                    serviceCode,
                    serviceType: operator.toString(),
                    description,
                    payerMail,
                    payerName,
                    pans,
                    nationalCode,
                    productCode,
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data.data;
            } else {
                this.throwError('Internet Charge', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async confirm({
        invoice,
        urlId,
    }: PaymentRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            const res = await axios.post<ConfirmResponse>(
                `${this.config.baseUrl}/api/payment/confirm-transactions`,
                {
                    invoice,
                    urlId
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data.data;
            } else {
                this.throwError('Confirm', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async verifyTransaction({
        invoice,
        urlId,
    }: PaymentRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            const res = await axios.post<SimpleResponse>(
                `${this.config.baseUrl}/api/payment/verify-transactions`,
                {
                    invoice,
                    urlId
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data;
            } else {
                this.throwError('Verify', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async verify({
        invoice,
        urlId,
    }: PaymentRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            const res = await axios.post<ConfirmResponse>(
                `${this.config.baseUrl}/api/payment/verify-payment`,
                {
                    invoice,
                    urlId
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data;
            } else {
                this.throwError('Confirm', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async reverse({
        invoice,
        urlId,
    }: PaymentRequest): Promise<any> {
        try {
            const token = await this.authenticate();
            const res = await axios.post<ReverseResponse>(
                `${this.config.baseUrl}/api/payment/reverse-transactions`,
                {
                    invoice,
                    urlId
                },
                {
                    headers: this.getHeaders(token),
                    timeout: 15000,
                }
            );

            if (res.data && res.data.resultCode === 0) {
                return res.data;
            } else {
                this.throwError('Reverse', res.data);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

}
