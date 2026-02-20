import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import path from 'path';
import destroyer from 'server-destroy';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/oauth2callback';

if (!clientId || !clientSecret) {
    console.error('Error: GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is missing from .env');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
);

const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send' // Added send scope for future use
];

async function authenticate() {
    return new Promise((resolve, reject) => {
        // Create an HTTP server to accept the callback
        const server = http.createServer(async (req, res) => {
            try {
                if (req.url!.indexOf('/oauth2callback') > -1) {
                    const qs = new url.URL(req.url!, 'http://localhost:3000').searchParams;
                    const code = qs.get('code');
                    
                    res.end('Authentication successful! You can close this window.');
                    server.destroy(); // Close the server

                    if (code) {
                        const { tokens } = await oauth2Client.getToken(code);
                        oauth2Client.setCredentials(tokens);
                        resolve(tokens);
                    } else {
                        reject(new Error('No code found in callback URL'));
                    }
                }
            } catch (e) {
                reject(e);
            }
        });

        destroyer(server);

        server.listen(3000, () => {
            // Generate the url that will be used for the consent dialog.
            const authorizeUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline', // Critical for receiving a refresh token
                scope: scopes,
                prompt: 'consent' // Force consent to ensure refresh token is returned
            });

            console.log('Open the following URL in your browser to authorize access:');
            console.log(authorizeUrl);
        });
    });
}

authenticate().then((tokens: any) => {
    console.log('\n--- AUTHENTICATION SUCCESSFUL ---\n');
    console.log('Here is your Refresh Token (save this to your .env file):');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n---------------------------------\n');
    if (!tokens.refresh_token) {
        console.warn('WARNING: No refresh token received. Did you forget to add "access_type: offline" or "prompt: consent"?');
    }
}).catch(console.error);
