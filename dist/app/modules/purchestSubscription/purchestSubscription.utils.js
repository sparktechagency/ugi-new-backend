"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calculateExpirationDate(durationInDays) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + durationInDays);
    // Format the date as YYYY-MM-DDTHH:MM:SS.sss+00:00
    let formattedEndDate = currentDate.toISOString();
    // Replace the 'Z' (UTC) with '+00:00'
    formattedEndDate = formattedEndDate.replace('Z', '+00:00');
    return formattedEndDate;
}
exports.default = calculateExpirationDate;
