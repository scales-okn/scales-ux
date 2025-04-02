export function reverseMap(contextMap: any) {
    const reverseContextMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(contextMap)) {
        if (typeof value === 'string') {

            reverseContextMap[value as string] = key;
        } else {
            reverseContextMap[value["@id"] as string] = key;
        }
    }
    return reverseContextMap;
}