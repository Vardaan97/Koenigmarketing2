/**
 * Utility service to parse CSV content on the client side.
 * Extracts headers and sample rows to send to Gemini for schema analysis.
 */

export const parseCsvSnippet = (csvContent: string, sampleSize = 5) => {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], sample: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const sample = lines.slice(1, sampleSize + 1).map(line => {
        const values = line.split(',');
        // Basic CSV parsing handling quotes roughly
        const row: any = {};
        headers.forEach((h, index) => {
            row[h] = values[index]?.trim().replace(/^"|"$/g, '') || '';
        });
        return row;
    });

    return { headers, sample };
};