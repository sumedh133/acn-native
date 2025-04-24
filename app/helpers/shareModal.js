import * as Linking from 'expo-linking';
import axios from "axios";

function formatCost2(cost) {
    if (cost >= 100) {
      return `₹${(cost / 100).toFixed(2)} Cr`;
    } else {
      return `₹${cost} Lacs`;
    }
  }

  const shortenUrl = async (longUrl) => {
    if (!longUrl) {
        console.warn('No URL provided to shorten.');
        return null;
    }

    // Array of URL shortening services to try
    const shortenerServices = [
        async (url) => {
            const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`);
            return response.data.result.full_short_link;
        },
        async (url) => {
            const response = await axios.post('https://tinyurl.com/api-create.php', null, {
                params: { url: url }
            });
            return response.data;
        }
    ];

    // Try each service in sequence
    for (const shortener of shortenerServices) {
        try {
            const shortUrl = await shortener(longUrl);
            if (shortUrl) return shortUrl;
        } catch (error) {
            console.warn('URL shortening attempt failed:', error.message);
            continue;
        }
    }

    // If all services fail, return the original URL
    console.warn('All URL shortening services failed, using original URL');
    return longUrl;
};

export const createPropertyMessage = async (property, agentNumber) => {
    const projectName = property.nameOfTheProperty || "Unnamed Project";
    
    const shortDriveLink = property.driveLink
        ? await shortenUrl(property.driveLink)
        : null;

    const shortMapLocation = property.mapLocation
        ? await shortenUrl(property.mapLocation)
        : null;

    const appendDetail = (label, value) => (value ? `*${label}*: ${value}` : "");

    const message = encodeURIComponent(
        `Hi, 
I am sharing details about a property that suits your requirements.

*Project Name*: ${projectName}
${appendDetail("Location", property.micromarket)}
${appendDetail("Handover Date", property.handoverDate)}
${appendDetail("Asset Type", property.assetType)}
${appendDetail("Configuration", property.unitType)}
${appendDetail("SBUA", property.sbua)}
${appendDetail("Facing", property.facing)}
${appendDetail("Total Ask Price", property.totalAskPrice ? `${formatCost2(property.totalAskPrice)}` : null)}
${appendDetail("Photos/Videos", shortDriveLink)}
${appendDetail("Location", shortMapLocation)}

For more details, please contact me at ${agentNumber}`
    );

    return message;
};

export const shareProperty = async (property, agentNumber, userNumber) => {

    const message = await createPropertyMessage(property, agentNumber);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    Linking.openURL(whatsappUrl);
};
