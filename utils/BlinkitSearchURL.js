export const getBlinkitSearchUrl = (productName) => {
    // This is an assumed URL structure for Blinkit. You might need to verify it.
    // Replace spaces with '+' for URL encoding.
    const encodedProductName = encodeURIComponent(productName.replace(/ /g, '+'));
    return `https://www.blinkit.com/search?query=${encodedProductName}`;
}