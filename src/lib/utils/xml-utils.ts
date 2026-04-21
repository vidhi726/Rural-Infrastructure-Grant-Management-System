
export function convertGrantsToXML(grants: any[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<ongoing_grants>\n';

    grants.forEach(grant => {
        xml += '  <grant>\n';
        xml += `    <id>${grant.id}</id>\n`;
        xml += `    <title>${escapeXml(grant.title)}</title>\n`;
        xml += `    <application_number>${grant.application_number}</application_number>\n`;
        xml += `    <status>${grant.status}</status>\n`;
        xml += `    <approved_amount>${grant.approved_amount || 0}</approved_amount>\n`;
        xml += `    <completion_percentage>${grant.completion_percentage || 0}</completion_percentage>\n`;
        xml += `    <category>${grant.grant_schemes?.category || 'N/A'}</category>\n`;
        xml += `    <village>${escapeXml(grant.villages?.name || 'N/A')}</village>\n`;
        xml += `    <district>${escapeXml(grant.villages?.districts?.name || 'N/A')}</district>\n`;
        xml += '  </grant>\n';
    });

    xml += '</ongoing_grants>';
    return xml;
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
}
