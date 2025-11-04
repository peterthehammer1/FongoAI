# Complete List of Error Messages

This document lists all possible error messages that may appear in the dashboard when a credit card update fails.

## Fongo API Error Codes

These are extracted from the Fongo API response when it includes error codes:

1. **Invalid credit card number** (`invalid_card` or `invalid_card_number`)
   - **Display**: "Invalid credit card number"
   - **Cause**: The credit card number provided is not valid (e.g., wrong format, incorrect checksum, fake/test number)

2. **Customer account not found** (`customer_not_found`)
   - **Display**: "Customer account not found"
   - **Cause**: The phone number doesn't match any account in the Fongo system

3. **Invalid expiry date** (`invalid_expiry`)
   - **Display**: "Invalid expiry date"
   - **Cause**: The expiry date format or value is incorrect

4. **Credit card has expired** (`card_expired`)
   - **Display**: "Credit card has expired"
   - **Cause**: The expiry date is in the past

5. **Credit card was declined** (`card_declined`)
   - **Display**: "Credit card was declined"
   - **Cause**: The card issuer declined the card (e.g., insufficient funds, card blocked)

6. **Invalid expiry month** (`invalid_month`)
   - **Display**: "Invalid expiry month"
   - **Cause**: The month value is not valid (must be 01-12)

7. **Invalid expiry year** (`invalid_year`)
   - **Display**: "Invalid expiry year"
   - **Cause**: The year value is not valid (must be current year or future)

## Fongo API String Errors

These are error messages returned directly by the Fongo API:

8. **Customer Not Found**
   - **Display**: "Customer Not Found"
   - **Cause**: The phone number doesn't match any account

9. **ERROR: Cannot Update Card When Current Payment Type Is XXX**
   - **Display**: "Cannot Update Card When Current Payment Type Is XXX"
   - **Cause**: The account has a payment type that prevents card updates (e.g., PayPal, bank transfer)

10. **ERROR: Cannot Update Card When There Is No Existing Card On File**
    - **Display**: "Cannot Update Card When There Is No Existing Card On File"
    - **Cause**: The account doesn't have an existing card to update

11. **ERROR: Cannot Update Card When There Is No Name On File**
    - **Display**: "Cannot Update Card When There Is No Name On File"
    - **Cause**: The account is missing required name information

12. **FAULT: [Technical Error]**
    - **Display**: The actual error message (after removing "FAULT:" prefix)
    - **Cause**: A technical error occurred on Fongo's server (e.g., database error, service unavailable)

## Local Validation Errors

These are errors caught before calling the Fongo API:

13. **The card number doesn't match the {cardType} type**
    - **Display**: "The card number doesn't match the Visa/Mastercard/Amex type"
    - **Cause**: The card number doesn't match the card type (e.g., Visa card number starts with 4, Mastercard starts with 5 or 2)

14. **Invalid phone number - must be digits only**
    - **Display**: "Invalid phone number - must be digits only"
    - **Cause**: Phone number contains non-numeric characters

15. **Invalid credit card number - must be digits only**
    - **Display**: "Invalid credit card number - must be digits only"
    - **Cause**: Credit card number contains non-numeric characters

16. **Invalid credit card number - must be 15 or 16 digits**
    - **Display**: "Invalid credit card number - must be 15 or 16 digits"
    - **Cause**: Credit card number is not the correct length (15 for Amex, 16 for Visa/Mastercard)

17. **Invalid month - must be digits only**
    - **Display**: "Invalid month - must be digits only"
    - **Cause**: Month contains non-numeric characters

18. **Invalid year - must be digits only**
    - **Display**: "Invalid year - must be digits only"
    - **Cause**: Year contains non-numeric characters

## Network & System Errors

These are errors that occur during the API call or system processing:

19. **Network error**
    - **Display**: "Network error"
    - **Cause**: Unable to connect to the Fongo API (network timeout, DNS failure, etc.)

20. **Unable to parse API response**
    - **Display**: "Unable to parse API response"
    - **Cause**: The Fongo API returned a response that couldn't be parsed (unexpected format)

21. **Failed to update credit card**
    - **Display**: "Failed to update credit card"
    - **Cause**: Generic fallback error when the API fails but no specific error message is available

22. **Webhook processing failed**
    - **Display**: "Webhook processing failed"
    - **Cause**: An error occurred while processing the webhook request (rare, indicates system issue)

## Error Message Format

All error messages are displayed in the dashboard as:
- **Status**: "Failed - [Error Message]"
- **Error Details**: Full error message in the call details page

## Examples

### Example 1: Invalid Card Number
```
Status: Failed - Invalid credit card number
Error Details: Invalid credit card number
```

### Example 2: Customer Not Found
```
Status: Failed - Customer account not found
Error Details: Customer account not found
```

### Example 3: Card Type Mismatch
```
Status: Failed - The card number doesn't match the Visa type
Error Details: The card number doesn't match the Visa type. Please verify both the card type and number.
```

### Example 4: Network Error
```
Status: Failed - Network error
Error Details: Network error
```

## Notes

- Error messages are extracted and cleaned from the Fongo API response
- File paths and line numbers are automatically removed (e.g., "at /home/ploeppky/__soap/lib/CustomerNumber.pm line 116")
- "FAULT:" prefix is automatically removed
- Error codes (e.g., "error code invalid_card") are used to map to user-friendly messages
- If an error code is not recognized, the original error message (cleaned) is displayed

