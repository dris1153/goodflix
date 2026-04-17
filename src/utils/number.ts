import Big from 'big.js'
import bigDecimal from 'js-big-decimal'

export function toBig(value: string | number | bigint): Big {
    return new Big(typeof value === 'bigint' ? value.toString() : value)
}

const EXCEEDING_LIMIT_VALUE = 1.79769313 * Math.pow(10, 308)

export function formatShortNumber(number: number | string | bigint | undefined | null, decimals: number = 2): string {
    const value = Number(number || 0)
    if (!number) {
        return '0'
    }

    if (value < 1) {
        let r = 1
        for (let i = 0; i < decimals; i++) {
            r = r * 10
        }
        return (Math.floor(Number(value) * r) / r).toString()
    }

    // Special case: Exceeding limits
    if (value > EXCEEDING_LIMIT_VALUE) {
        return '999cz'
    }

    // Define suffixes for standard and extended notation
    const standardSuffixes = ['', 'K', 'M', 'B', 'T']
    const extendedSuffixes = []
    const englishAlphabetLength = 26
    const firstCharacterASCIICode = 97
    for (let i = 0; i < englishAlphabetLength; i++) {
        for (let j = 0; j < englishAlphabetLength; j++) {
            extendedSuffixes.push(
                String.fromCharCode(firstCharacterASCIICode + i) + String.fromCharCode(firstCharacterASCIICode + j),
            )
        }
    }

    // Determine the suffix and calculate the formatted value
    let suffix = ''
    let formattedValue = value

    if (value < 1000) {
        suffix = ''
    } else if (value < 1e15) {
        // Standard notation (K, M, B, T)
        let exponent = Math.floor(Math.log10(value) / 3)

        exponent = Math.min(exponent, standardSuffixes.length - 1)
        suffix = standardSuffixes[exponent]
        formattedValue = value / Math.pow(10, exponent * 3)
    } else {
        // Extended notation (aa, ab, ac, ..., cz)
        let exponent = Math.floor(Math.log10(value) / 3)
        exponent -= 4 // Since 1aa = 1e15 (10^15)
        if (exponent >= extendedSuffixes.length) {
            return '999cz'
        }
        suffix = extendedSuffixes[exponent]
        formattedValue = value / Math.pow(10, (exponent + 4) * 3)
    }

    // Limit to 2 decimal places
    formattedValue = Math.floor(formattedValue * 100) / 100

    return `${formattedValue}${suffix}`
}

export function formatNumber(
    number: number | bigint | string | undefined | null,
    config?: {
        maxLength?: number
        decimals?: number
        limitNoShortNumber?: number
    },
): string {
    const defaultConfig = {
        maxLength: 10,
        decimals: 18,
        limitNoShortNumber: 100_000_000,
    }

    config = { ...defaultConfig, ...config }

    // Convert the number to a string
    if (Number(number) < 0.000001 && Number(number) > -0.000001) {
        return '0'
    }
    if (Number(number) > Number(config?.limitNoShortNumber)) {
        return formatShortNumber(number)
    }
    const numberString = Number(Number(number || 0).toFixed(config?.decimals)).toString()
    // Split the string into integer and decimal parts
    const parts = numberString.split('.')
    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    // Check if the total length exceeds the specified maxLength
    const totalLength = parts.join('').length
    if (totalLength > Number(config?.maxLength || 10)) {
        // Truncate the decimal part to fit within the maxLength
        let remainingLength = Number(config?.maxLength || 10) - parts[0].length
        if (remainingLength < 0) {
            remainingLength = 0
        }
        parts[1] = parts[1]?.substring?.(0, remainingLength).replace(/([1-9])0+/g, '$1')
    }
    // Join the parts with a dot and check if the result ends with a dot
    let result = /^0+$/.test(parts[1]) ? parts[0] : parts.join('.')
    if (result.endsWith('.')) {
        result = result.slice(0, -1) // Remove the trailing dot
    }

    // Display the result
    return result
}

export interface FormattedNumberParts {
    prefix: string
    zeroCount: number
    rest: string
    isNegative: boolean
    formatted: string
}

export function parseLeadingZerosDecimal(input: string) {
    // Validate input
    if (typeof input !== 'string' || input.trim() === '') {
        throw new Error('Input must be a non-empty string')
    }

    // Regex for valid inputs: optional negative sign, followed by either:
    // 1. Whole number (e.g., '123', '-123')
    // 2. Decimal number (e.g., '0.000123', '0.0123')
    const validFormatRegex = /^(-)?(\d+|\d*\.\d+)$/

    // Initialize result object
    const result = {
        prefix: '',
        zeroCount: 0,
        rest: '',
        isNegative: false,
        formatted: '',
    }

    // Check if input matches the valid format
    if (!validFormatRegex.test(input)) {
        throw new Error('Invalid number format')
    }

    // Handle negative sign
    if (input.startsWith('-')) {
        result.isNegative = true
        input = input.slice(1) // Remove negative sign for processing
    }

    // Handle whole numbers (e.g., '123')
    if (!input.includes('.')) {
        result.formatted = `${result.isNegative ? '-' : ''}${input}`
        return result
    }

    // Split into integer and decimal parts
    const parts = input.split('.')
    if (parts.length === 2 && parts[0] === '0') {
        const decimalPart = parts[1]
        let zeroCount = 0
        let i = 0

        // Count leading zeros
        while (i < decimalPart.length && decimalPart[i] === '0') {
            zeroCount++
            i++
        }

        // Get remaining digits
        const rest = decimalPart.slice(i) || ''

        // Throw error if only zeros after decimal
        if (rest === '') {
            throw new Error('Invalid number format')
        }

        // Special case for inputs with exactly one leading zero (e.g., '0.0123', '0.0216364363811')
        if (zeroCount === 1) {
            // Truncate to 6 decimal places
            const truncatedDecimal = decimalPart.slice(0, 5)
            result.formatted = `${result.isNegative ? '-' : ''}0.${truncatedDecimal}`
            return result
        }

        result.prefix = '0.'
        result.zeroCount = zeroCount - 1
        result.rest = rest.slice(0, 4)

        if (result.zeroCount > 8) {
            result.zeroCount = 8
        }

        // Format the output string
        result.formatted = `$0.${result.zeroCount > 0 ? `0(${result.zeroCount})${result.rest}` : result.rest}`
    } else {
        throw new Error('Invalid number format')
    }

    return result
}

export const prettyNumber = (number: number | string, digits = 3, separator = ',') =>
    bigDecimal.getPrettyValue(number, digits, separator)
