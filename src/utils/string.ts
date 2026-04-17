export function convertCamelCaseToTitleCase(inputText: string) {
    const result = inputText.split(/(?=[A-Z])/).join(' ')
    return result.charAt(0).toUpperCase() + result.slice(1)
}

export function shortenString(str?: string, before = 4, after = 5) {
    if (!str) return ''
    if (str?.length <= before + after) return str
    return `${str.substring(0, before)}...${str.substring(str.length - after)}`
}

export function lowerCase(str?: string) {
    return (str || '')?.toLowerCase()
}
