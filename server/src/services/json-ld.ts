export function reverseContextMap(contextMap: any) {
    const reverseContextMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(contextMap)) {
        reverseContextMap[value as string] = key;
    }
    return reverseContextMap;
}